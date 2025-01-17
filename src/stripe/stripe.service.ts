import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { UserService } from 'src/user/user.service';
import { PaymentQuery, QueryType } from 'src/payments/payments.entity';
import { StripePayment } from './stripe.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentQuery)
    private readonly paymentQueryRepository: Repository<PaymentQuery>,
    @InjectRepository(StripePayment)
    private readonly stripePaymentRepository: Repository<StripePayment>,
    private readonly userService: UserService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  private async getUserByEmail(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async savePaymentQuery({
    amount,
    queryType,
    queryCpfOrCpnj,
    queryName,
    email,
    natural,
  }: {
    amount: number;
    queryCpfOrCpnj: string;
    queryType: QueryType;
    queryName: string;
    natural: string;
    email: string;
  }) {
    const user = await this.getUserByEmail(email);

    const paymentIntent = await this.createPaymentIntent(amount);

    const paymentQuery = this.paymentQueryRepository.create({
      amount: parseFloat(amount.toFixed(2)),
      queryCpfOrCpnj,
      queryType,
      queryName,
      user,
      natural,
    });

    await this.paymentQueryRepository.save(paymentQuery);

    const stripePayment = this.stripePaymentRepository.create({
      paymentIntentId: paymentIntent.id,
      amount: parseFloat(amount.toFixed(2)),
      status: paymentIntent.status,
      user,
    });

    return await this.stripePaymentRepository.save(stripePayment);
  }
}

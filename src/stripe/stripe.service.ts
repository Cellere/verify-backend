import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { UserService } from 'src/user/user.service';
import { PaymentQuery } from 'src/payments/payments.entity';
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

  async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method_types: ['card'],
    });
  }

  async savePaymentQuery({
    email,
    queryType,
    value,
  }: {
    email: string;
    queryType: string;
    value: number;
  }) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const paymentIntent = await this.createPaymentIntent(value);

    const paymentQuery = this.paymentQueryRepository.create({
      queryType,
      value,
      user,
    });

    await this.paymentQueryRepository.save(paymentQuery);

    const stripePayment = this.stripePaymentRepository.create({
      paymentIntentId: paymentIntent.id,
      amount: value,
      status: paymentIntent.status,
      user,
    });

    await this.stripePaymentRepository.save(stripePayment);
  }
}

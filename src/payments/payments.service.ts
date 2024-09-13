import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { PaymentQuery } from './payments.entity';
import { StripePayment } from 'src/stripe/stripe.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentQuery)
    private readonly paymentQueryRepository: Repository<PaymentQuery>,
    @InjectRepository(StripePayment)
    private readonly stripePaymentRepository: Repository<StripePayment>,
    private readonly userService: UserService,
  ) {}

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

    const paymentQuery = this.paymentQueryRepository.create({
      queryType,
      value,
      user,
    });

    await this.paymentQueryRepository.save(paymentQuery);
  }

  async getPaymentQueriesByUser(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    return this.paymentQueryRepository.find({
      where: { user },
      relations: ['stripePayments'],
    });
  }

  async getStripePaymentsByUser(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    return this.stripePaymentRepository.find({
      where: { user },
    });
  }
}

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
    queryType,
    amount,
    queryCpf,
    queryName,
    email,
    natural,
  }: {
    queryType: string;
    amount: number;
    queryCpf: string;
    queryName: string;
    email: string;
    natural: string;
  }) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const paymentQuery = this.paymentQueryRepository.create({
      amount,
      queryType,
      queryCpf,
      queryName,
      natural,
    });

    await this.paymentQueryRepository.save(paymentQuery);
  }

  async getPaymentQueriesByUser(email: string): Promise<PaymentQuery[]> {
    return this.paymentQueryRepository.find({
      where: {
        user: { email: email },
      },
      relations: ['user'],
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { PaymentQuery, QueryType } from './payments.entity';
import { StripePayment } from 'src/stripe/stripe.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentQuery)
    private readonly paymentQueryRepository: Repository<PaymentQuery>,
    @InjectRepository(StripePayment)
    private readonly userService: UserService,
  ) {}

  async savePaymentQuery({
    queryType,
    amount,
    queryCpfOrCpnj,
    queryName,
    email,
    natural,
  }: {
    queryType: QueryType;
    amount: number;
    queryCpfOrCpnj: string;
    queryName?: string;
    email: string;
    natural: string;
  }) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const paymentQuery = this.paymentQueryRepository.create({
      amount: parseFloat(amount.toFixed(2)),
      queryType,
      queryCpfOrCpnj,
      queryName,
      natural,
      user,
    });

    return await this.paymentQueryRepository.save(paymentQuery);
  }

  async getPaymentQueriesByUser(email: string): Promise<PaymentQuery[]> {
    return this.paymentQueryRepository.find({
      where: {
        user: { email: email },
      },
      relations: ['user'],
    });
  }

  async getPaymentByIdAndUser(
    paymentId: number,
    userId: number,
  ): Promise<PaymentQuery | null> {
    return this.paymentQueryRepository.findOne({
      where: { id: paymentId, user: { id: userId } },
    });
  }

  async attachPdfToPayment(paymentId: number, pdfPath: string): Promise<void> {
    const payment = await this.paymentQueryRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.pdfPath = pdfPath;
    await this.paymentQueryRepository.save(payment);
  }
}

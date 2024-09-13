import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentQuery } from 'src/payments/payments.entity';
import { StripePayment } from './stripe.entity';
import { StripeService } from './stripe.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentQuery, StripePayment]),
    UserModule,
  ],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}

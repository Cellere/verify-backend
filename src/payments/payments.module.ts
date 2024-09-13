import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payments.service';
import { PaymentQuery } from './payments.entity';
import { UserModule } from '../user/user.module';
import { StripeController } from 'src/stripe/stripe.controller';
import { StripePayment } from 'src/stripe/stripe.entity';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentQuery, StripePayment]),
    UserModule,
  ],
  controllers: [StripeController],
  providers: [StripeService, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

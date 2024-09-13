import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PaymentService } from 'src/payments/payments.service';

@Controller('payments')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body('amount') amount: number,
    @Body('email') email: string,
    @Body('queryType') queryType: string,
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(amount);

    await this.stripeService.savePaymentQuery({
      email,
      queryType,
      value: amount,
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  @Get('queries/:email')
  async getPaymentQueriesByUser(@Param('email') email: string) {
    const paymentQueries =
      await this.paymentService.getPaymentQueriesByUser(email);
    return paymentQueries;
  }
}

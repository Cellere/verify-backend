import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PaymentService } from 'src/payments/payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body('amount') amount: number,
    @Body('email') email: string,
    @Body('queryType') queryType: string,
    @Body('queryName') queryName: string,
    @Body('queryCpf') queryCpf: string,
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(amount);

    await this.stripeService.savePaymentQuery({
      email,
      queryType,
      amount,
      queryCpf,
      queryName,
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('queries/:email')
  async getPaymentQueriesByUser(@Param('email') email: string) {
    const paymentQueries =
      await this.paymentService.getPaymentQueriesByUser(email);
    return paymentQueries;
  }
}

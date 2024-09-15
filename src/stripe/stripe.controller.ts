import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { PaymentService } from 'src/payments/payments.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'src/user/user.entity';

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
    @Body('queryCpfOrCpnj') queryCpfOrCpnj: string,
    @Body('natural') natural: string,
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(amount);

    await this.stripeService.savePaymentQuery({
      email: email,
      queryType,
      amount,
      queryCpfOrCpnj,
      queryName,
      natural,
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('queries')
  async getPaymentQueriesByUser(@Req() request: Request) {
    const user = request.user as User;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const paymentQueries = await this.paymentService.getPaymentQueriesByUser(
      user.email,
    );
    return paymentQueries;
  }
}

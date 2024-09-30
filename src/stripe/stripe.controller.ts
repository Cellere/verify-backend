import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StripeService } from '../stripe/stripe.service';
import { PaymentService } from 'src/payments/payments.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'src/user/user.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { QueryType } from 'src/payments/payments.entity';

@Controller('payments')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body('amount') amount: number,
    @Body('email') email: string,
    @Body('queryType') queryType: QueryType,
    @Body('queryName') queryName: string,
    @Body('queryCpfOrCpnj') queryCpfOrCpnj: string,
    @Body('natural') natural: string,
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(amount);

    const savedPayment = await this.stripeService.savePaymentQuery({
      email,
      queryType,
      amount,
      queryCpfOrCpnj,
      queryName,
      natural,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: savedPayment.id,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload-pdf')
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './uploads/pdf',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPdf(
    @Body('paymentId') paymentId: number,
    @UploadedFile() pdf: Express.Multer.File,
    @Req() req: Request,
    @Body('queryType') queryType: QueryType,
  ) {
    const user = req.user as User;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!pdf) {
      throw new Error('No PDF file uploaded');
    }

    const payment = await this.paymentService.getPaymentByIdAndUser(
      paymentId,
      user.id,
    );
    if (!payment) {
      throw new UnauthorizedException('Payment not found or not authorized');
    }

    const pdfPath = path.resolve(pdf.path);

    await this.paymentService.attachPdfToPayment(paymentId, pdfPath);
    await this.mailService.sendPaymentPdf(user.email, pdfPath, queryType);

    return { message: 'PDF uploaded and email sent successfully', pdfPath };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('queries')
  async getPaymentQueriesByUser(@Req() request: Request) {
    const user = request.user as User;
    if (!user) {
      throw new UnauthorizedException('User não está autenticado');
    }

    const paymentQueries = await this.paymentService.getPaymentQueriesByUser(
      user.email,
    );

    return paymentQueries.map((query) => ({
      ...query,
      pdfUrl: query.pdfPath
        ? `/uploads/pdf/${path.basename(query.pdfPath)}`
        : null,
    }));
  }
}

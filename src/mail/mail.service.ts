import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
  }

  async sendPaymentPdf(email: string, pdfPath: string) {
    if (!email) {
      throw new Error('No recipient email provided');
    }

    await this.transporter.sendMail({
      from: '"Trusty" <felipenobrega2012@gmail.com>',
      to: email,
      subject: 'Your Payment PDF',
      text: 'Please find the attached PDF for your payment.',
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
        },
      ],
    });
  }
}

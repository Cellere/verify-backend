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

  async sendPaymentPdf(email: string, pdfPath: string, queryType: string) {
    if (!email) {
      throw new Error('Nenhum destinatário de e-mail fornecido');
    }

    await this.transporter.sendMail({
      from: '"Verify" <felipenobrega2012@gmail.com>',
      to: email,
      subject: `Seu PDF de ${queryType} - Trusty`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Olá,</p>
          <p>Conforme solicitado, estamos enviando o PDF de sua ${queryType}.</p>
          <p>Caso tenha dúvidas ou precise de mais informações, não hesite em entrar em contato com a nossa equipe de suporte.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Trusty</strong></p>
          <p style="font-size: 12px; color: #999;">Este é um email automático, por favor, não responda.</p>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
        },
      ],
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const mailOptions = {
      from: '"Verify" <your-email@example.com>',
      to: email,
      subject: 'Verificação de Conta - Verify',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #333;">Bem-vindo à Verify!</h2>
          <p>Olá,</p>
          <p>Obrigado por se registrar no Verify. Para concluir o processo de verificação de sua conta, por favor use o código abaixo:</p>
          <div style="padding: 10px; text-align: center; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin: 0; color: #333;">${code}</h3>
          </div>
          <p>Insira este código no campo de verificação de sua conta no aplicativo.</p>
          <p>Se você não solicitou a criação de uma conta, ignore este email.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Verify</strong></p>
          <p style="font-size: 12px; color: #999;">Este é um email automático, por favor, não responda.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar o email:', error);
      return false;
    }
  }
}

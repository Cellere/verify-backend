import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StripePayment } from '../stripe/stripe.entity';
import { PaymentQuery } from 'src/payments/payments.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  verificationCode: string;

  @Column()
  isVerified: boolean;

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToMany(() => StripePayment, (stripe) => stripe.user)
  payments: StripePayment[];

  @OneToMany(() => PaymentQuery, (paymentQuery) => paymentQuery.user)
  paymentQueries: PaymentQuery[];
}

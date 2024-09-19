import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StripePayment } from '../stripe/stripe.entity';
import { PaymentQuery } from 'src/payments/payments.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ default: false })
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

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class StripePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentIntentId: string;

  @Column()
  amount: number;

  @Column()
  status: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;
}

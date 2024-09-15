import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class StripePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentIntentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

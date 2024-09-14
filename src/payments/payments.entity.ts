import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class PaymentQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  queryType: string;

  @Column()
  queryName: string;

  @Column()
  queryCpf: string;

  @Column()
  amount: number;

  @Column()
  natural: string;

  @ManyToOne(() => User, (user) => user.paymentQueries)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

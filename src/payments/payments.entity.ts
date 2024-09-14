import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @ManyToOne(() => User, (user) => user.paymentQueries)
  user: User;
}

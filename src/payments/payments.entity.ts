import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum QueryType {
  Simples = 'Consulta Simples',
  Intermediaria = 'Consulta Intermediária',
  Avancada = 'Consulta Avançada',
  Automotiva = 'Consulta Automotiva',
}

@Entity()
export class PaymentQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  queryType: QueryType;

  @Column({ nullable: true })
  queryName: string;

  @Column()
  queryCpfOrCpnj: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  pdfPath: string;

  @Column()
  natural: string;

  @ManyToOne(() => User, (user) => user.paymentQueries)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

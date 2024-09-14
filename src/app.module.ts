import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payments/payments.module';
import { PaymentQuery } from './payments/payments.entity';
import { StripePayment } from './stripe/stripe.entity';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_URL'),
        entities: [User, StripePayment, PaymentQuery],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    StripeModule,
    PaymentModule,
  ],
})
export class AppModule {}

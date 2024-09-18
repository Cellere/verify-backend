import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    const { ...result } = user;
    return result;
  }

  async login(user: User) {
    try {
      const payload = { username: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao gerar token de acesso');
    }
  }

  async verifyCode(email: string, code: string) {
    const user = await this.userService.findOneByEmail(email);

    console.log('verificationCode', user.verificationCode);
    console.log('code', code);

    if (!user || user.verificationCode !== code) {
      throw new BadRequestException('Código de verificação inválido');
    }

    user.isVerified = true;
    await this.userService.update(user);

    return {
      message: 'Verificação bem-sucedida!',
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findOneByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('O email já está em uso');
      }

      const verificationCode = randomBytes(3).toString('hex');

      await this.userService.register({
        ...createUserDto,
        verificationCode,
      });

      const emailSent = await this.mailService.sendVerificationEmail(
        createUserDto.email,
        verificationCode,
      );

      if (!emailSent) {
        throw new InternalServerErrorException(
          'Falha ao enviar o email de verificação',
        );
      }

      return {
        message:
          'Usuário registrado com sucesso. Verifique seu email para o código de verificação.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao registrar o usuário');
    }
  }
}

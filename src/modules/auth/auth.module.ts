import { AuthController } from '@modules/auth/controller/auth.controller';
import { AuthService } from '@modules/auth/services/auth.service';
import { EmailService } from '@modules/auth/services/mail.service';
import { OTPService } from '@modules/auth/services/OTP.service';
import { PasswordModule } from '@modules/password/password.module';
import { UserModel } from '@infrastructure/models/user.model';
import { UserModule } from '@modules/users/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefaultTokenSecretResolverStrategy } from '@core/strategies/default-token-secret-resolver.strategy';
import { AssociationsModule } from '@modules/associations/associations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    EventEmitterModule.forRoot(),
    UserModule,
    PasswordModule,
    AssociationsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    OTPService,
    // UserService,
    JwtModule,
    {
      provide: 'TokenSecretResolver',
      useClass: DefaultTokenSecretResolverStrategy,
    },
  ],
  exports: [AuthService, EmailService, OTPService],
})
export class AuthModule {}

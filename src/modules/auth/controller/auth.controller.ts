// import { VerifyOtpDto } from '@modules/auth/dto/verify-otp.dto';
import { RateLimit } from '@core/decorators/rate-limit';
import { RedisKey } from '@core/decorators/redis-key.decorator';
import { TokenType } from '@core/decorators/token-type.decorator';
import { JWTAuthGuard } from '@core/guards/jwt.guard';
import { RateLimitGuard } from '@core/guards/rate-limit.guard';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@modules/auth/dto/refreshToken.dto';
import { LoginResponseDto, VerifyResponseDto } from '@modules/auth/interface/login.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { OTPService } from '@modules/auth/services/OTP.service';
import {
  applyDecorators,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Version
} from '@nestjs/common';

const OTPGuard = () =>
  applyDecorators(
    RateLimit(3, 86400), // Limit to 3 requests per day
    TokenType('otp'),
    RedisKey('confirm-otp'),
    UseGuards(JWTAuthGuard, RateLimitGuard),
  );

// @Controller({ path:'auth', version: '1' })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly OTPService: OTPService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('login')
  async loginV1(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(body);
  }
  @Post('login')
  @Version('2')
  async loginV2(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(body);
  }
  
  @Post('refresh-token')
  @Version('3')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenDto): Promise<LoginResponseDto> {
    return await this.authService.refreshToken(body.refreshToken);
  }
  
  // @Post('verify-otp')
  // @Version('3')
  // @HttpCode(HttpStatus.CREATED)
  // async verifyOTP(@Body() body: VerifyOtpDto): Promise<VerifyResponseDto> {
  //   return await this.OTPService.verifyOtp(body);
  // }
}

import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@modules/users/services/user.service';
import { RedisContext, RedisModule } from '@redis/enums/redis-key.enum';
import { buildRedisKey } from '@redis/helpers/redis-key.helper';
import { findCacheByEmail, scanlAlKeys } from '@shared/utils/common.util';
import { GoneException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { VerifyOtpDto } from '@modules/auth/dto/verify-otp.dto';
import { VerifyResponseDto } from '@modules/auth/interface/login.interface';
import { REDIS_TOKEN } from '@redis/constants/key-prefix.constant';

@Injectable()
export class OTPService {
  constructor(
    @Inject(REDIS_TOKEN)
    private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // @Cron('00 00 00 * * *') // Every minute
  async resetVerifyOtp() {
    const keyCacheOtpByEmail = await scanlAlKeys(
      `${buildRedisKey(RedisModule.AUTH, RedisContext.OTP)}*`,
    );

    if (keyCacheOtpByEmail.length > 0) {
      const pipeline = this.redis.pipeline();
      keyCacheOtpByEmail.forEach((key) => {
        pipeline.del(key); // Queue deletion of each key
      });
      await pipeline.exec(); // Execute all deletions in a single operation
      console.log(
        `Cleared ${keyCacheOtpByEmail.length} expired OTPs from Redis`,
      );
    } else {
      console.log('No expired OTPs found in Redis');
    }
    console.log('----------------Reset check OTP----------------');
  }

  async verifyOtp(body: VerifyOtpDto): Promise<VerifyResponseDto> {
    const { otp, email } = body;
    const keyCacheOtpByEmail = await scanlAlKeys(`${buildRedisKey(RedisModule.AUTH, RedisContext.OTP)}*`);
    const keyByEmailCache = findCacheByEmail(keyCacheOtpByEmail, email);
    const key = buildRedisKey(RedisModule.AUTH, RedisContext.OTP, email);
    if (keyByEmailCache) {
      const cache = JSON.parse((await this.redis.get(keyByEmailCache)) as string);
      const limitCheckEmail = 5 
      const checkCount = cache.checkCount;
      if (Number(checkCount) > Number(limitCheckEmail)) {
        throw new GoneException('Đã vượt quá số lần check');
      }
      const otpByCache = cache.otp;
      if (Number(otpByCache) !== Number(otp)) {
        const updatedOtpCache = {
          ...cache,
          checkCount: cache.checkCount + 1,
        };
        await this.redis.set(key, JSON.stringify(updatedOtpCache));
        throw new GoneException('Sai OTP');
      } else {
        const userAuth = {
          email,
          name: '',
          is_root: false,
          is_active: true,
        };

        const user:any = await this.userService.createUserWithEmailOnly(userAuth);
        const { data: userId } = user || {};
        const payload = { email: email, id: userId };
        const accessToken = await this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
          expiresIn: '24h',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
          expiresIn: '1y',
        });

        await this.redis.del(keyByEmailCache);
        const response = new VerifyResponseDto();
        response.success = true;
        response.accessToken = accessToken;
        response.refreshToken = refreshToken;
        return response;
      }
    } else {
      throw new UnauthorizedException('Email này chưa yêu cầu OTP');
    }
  }

  gennerateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

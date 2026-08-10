import { BullService } from "@bull/bull.service";
import { RegisterDto } from "@modules/auth/dto/register.dto";
import { RedisContext, RedisModule } from "@redis/enums/redis-key.enum";
import { buildRedisKey } from "@redis/helpers/redis-key.helper";
import { REDIS_TOKEN } from "@redis/redis.module";
import { findCacheByEmail, scanlAlKeys } from "@shared/utils/common.util";
import { OTPService } from '@modules/auth/services/OTP.service';
import { GoneException, Inject, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "@modules/users/repository/user.admin.repository";
import Redis from "ioredis";


export class RegisterUserUseCase {
    constructor(
        private readonly bullService: BullService,
        private readonly userRepository: UserRepository,
        private readonly OTPService: OTPService,
        @Inject(REDIS_TOKEN)
        private readonly redis: Redis,
    ) {}
    async findEmail(email: string) {
        return this.userRepository.findOneByField('email', email)
    }

    async execute(body: RegisterDto): Promise<void> {
        const { email } = body;
    
        const existingUser = await this.findEmail(email);
    
        if (existingUser) {
          throw new UnauthorizedException('Email already exists in system');
        }
        const otp = this.OTPService.gennerateOtp();
    
        const otpCache = {
          otp,
          sendCount: 1,
          checkCount: 1,
          lastTime: Date.now() + 1 * 60 * 1000,
        };
    
        const TTL_OTP = 86400;
    
        const key = buildRedisKey(RedisModule.AUTH, RedisContext.OTP, email);
        const keyCacheOtpByEmail = await scanlAlKeys(`${buildRedisKey(RedisModule.AUTH, RedisContext.OTP)}*`);
    
        const cacheByEmail = findCacheByEmail(keyCacheOtpByEmail, email);
    
        if (!cacheByEmail) {
          await this.redis.set(key, JSON.stringify(otpCache), 'EX', TTL_OTP);
          await this.bullService.addSendMailJob({ email, otp })
        } else {
          const cache = JSON.parse((await this.redis.get(cacheByEmail as string)) as string);
          const sendCount = cache.sendCount;
          const limitSendEmail = 5 
          const now = Date.now();
          const lastTime = cache.lastTime;
          if (sendCount <= Number(limitSendEmail)) {
            if (now >= lastTime) {
              await this.bullService.addSendMailJob({ email, otp })
              const updatedOtpCache = Object.assign({}, otpCache, {
                sendCount: sendCount + 1,
                lastTime: Date.now() + 1 * 60 * 1000,
              });
              await this.redis.set(key, JSON.stringify(updatedOtpCache), 'EX', TTL_OTP);
            } else {
              throw new GoneException('Vui lòng đợi khoảng 1p');
            }
          } else {
            throw new GoneException('Đã vượt quá số lần gửi');
          }
        }
      }
  }
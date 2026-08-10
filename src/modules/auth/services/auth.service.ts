import { LoginDto } from '@modules/auth/dto/login.dto';
import { BullService } from '@bull/bull.service';
import { LoginResponseDto } from '@modules/auth/interface/login.interface';
import { RefreshTokenResponseDto } from '@modules/auth/interface/refreshToken.interface';
import { OTPService } from '@modules/auth/services/OTP.service';
import { PasswordService } from '@modules/password/services/password.service';
import { UserRepository } from '@modules/users/repository/user.admin.repository';
import { UserService } from '@modules/users/services/user.service';
import { GoneException, Inject, Injectable, Logger, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { REDIS_TOKEN } from '@redis/constants/key-prefix.constant';
import { RedisContext } from '@redis/enums/redis-key.enum';
import { buildRedisKeyQuery } from '@redis/helpers/redis-key.helper';
import { RedisService } from '@redis/redis.service';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly OTPService: OTPService,
    // @InjectModel(UserModel)
    // protected readonly UserModel: typeof UserModel,
    private readonly userRepository: UserRepository, // Assuming Redis is injected for cache management
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject(REDIS_TOKEN)
    private readonly redis: Redis,
    private readonly bullService: BullService,
    public cacheManage: RedisService,
  ) {
  }

  onModuleInit() { }

  async incrementFailedLogins(id: string): Promise<void> {
    const user = await this.userRepository.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const maxAttempts = 2;
    const logoutDuration = 3 * 60 * 1000; // 3 minutes
    const now = new Date();

    const updatedBody = {
      ...user,
      failed_login_attempts: user.failed_login_attempts + 1,
      last_failed_login_at: new Date(),
    };
    if (user.failed_login_attempts >= maxAttempts) {
      updatedBody.locked_until = new Date(now.getTime() + logoutDuration);
    }

    await this.userRepository.update(id, updatedBody);
  }

  async resetFailedLogins(id: string): Promise<void> {
    const update = {
      locked_until: null,
      failed_login_attempts: 0,
    }

    await this.userRepository.update(id, update);
  }

  async login(body: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = body;
    const user = await this.userRepository.findByOneByRaw({
      where: { email },
      returning: true,
    });
    Logger.log('user', user)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.locked_until && new Date() > new Date(user.locked_until)) {
      await this.resetFailedLogins(user.id);
    }
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      throw new GoneException(
        `Account locked until 3 minutes from last failed login attempt`,
      );
    }
    if (user) {
      if (user.deleted_at) {
        throw new GoneException('Account has been delete');
      }
      const isPasswordValid = await this.passwordService.comparePassword(
        password,
        user.password_hash,
      );
      if (isPasswordValid) {
        await this.resetFailedLogins(user.id);
        const session_id = uuidv4()
        const rolePermission = await this.userService.getRolePermissionByUserId(user.id);
        const rolePermissions = {};
        Logger.log('###session_id:', session_id);

        const normalizePermissions = (rows) => {
          const result: any = { roles: new Set(), permissions: {} };
          for (const row of rows) {
            result.roles.add(row.role_name);
            if (!result.permissions[row.resource])
                result.permissions[row.resource] = {};
                result.permissions[row.resource][row.permission_action] = true;
          }
          result.roles = [...result.roles];
          return result;
        }

        
        const normalizePermissionsRoleDefault = (rows) => {
          const roleMap = new Map();
          for (const item of rows) {
            const roleName = item.roles.name;
            const permissionKey = `${item.permissions.resource}.${item.permissions.action}`;

            if (!roleMap.has(roleName)) {
              roleMap.set(roleName, new Set()); // Dùng Set để tránh trùng
            }
            roleMap.get(roleName).add(permissionKey);
          }

          const result = [
            Object.fromEntries(
              Array.from(roleMap, ([role, perms]) => [role, [...perms]])
            )
          ];
        }

        
        
        if (rolePermission && rolePermission.length) {
          Object.assign(rolePermissions, normalizePermissions(rolePermission))
        } else {
          rolePermissions['roles'] = ['USER']
        }


        const redisKey = buildRedisKeyQuery('auth', RedisContext.SESSION, {}, session_id);
        
        await this.cacheManage.set(redisKey, JSON.stringify(rolePermissions), 'EX', 84600);

        const payload = { sub: user.id, session_id };

        const accessToken = await this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
          expiresIn: '24h',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
          expiresIn: '1y',
        });

        const response = new LoginResponseDto();
        response.success = true;
        response.accessToken = accessToken;
        response.refreshToken = refreshToken;
        return response;
      } else {
        this.incrementFailedLogins(user.id);
        throw new UnauthorizedException('Password is not correct');
      }
    } else {
      this.incrementFailedLogins(user.id);
      throw new NotFoundException('User not found');
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    try {
      const tokenOld = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
      });
      if (!tokenOld) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { email: tokenOld.email, id: tokenOld.id };
      const newAccessToken = await this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: '24h',
      });


      const response = new RefreshTokenResponseDto();
      response.success = true;
      response.accessToken = newAccessToken;

      return response;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}

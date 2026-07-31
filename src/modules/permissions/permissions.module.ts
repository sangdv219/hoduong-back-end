import { DefaultTokenSecretResolverStrategy } from '@core/strategies/default-token-secret-resolver.strategy';
import { RedisService } from '@redis/redis.service';
import { PermissionsController } from '@modules/permissions/controller/permissions.controller';
import { PermissionsModel } from '@modules/permissions/domain/models/permissions.model';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '@infrastructure/models/user.model';
import { PostgresPermissionsRepository } from '@modules/permissions/infrastructure/repository/postgres-permissions.repository';
import { PermissionsService } from '@modules/permissions/services/permissions.service';

@Module({
  imports: [ SequelizeModule.forFeature([PermissionsModel, UserModel]), PermissionsModule],
  controllers: [ PermissionsController ],
  providers: [
    PermissionsService,
    JwtModule,
    PostgresPermissionsRepository,
    RedisService,
    {
      provide: 'TokenSecretResolver',
      useClass: DefaultTokenSecretResolverStrategy,
    },
  ],
  exports: [PostgresPermissionsRepository, PermissionsService],
})
export class PermissionsModule {}

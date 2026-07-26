import { DefaultTokenSecretResolverStrategy } from '@core/strategies/default-token-secret-resolver.strategy';
import { RolePermissionsModel } from '@modules/associations/models/role-permissions.model';
import { UserRolesModel } from '@infrastructure/models/user_roles.model';
import { RolesController } from '@modules/roles/controller/roles.controller';
import { RolesModel } from '@/infrastructure/models/roles.model';
import { RolesService } from '@modules/roles/services/roles.service';
import { UserEntity } from '@/infrastructure/models/user.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { PostgresRoleRepository } from './infrastructure/repository/postgres-role.repository';

@Module({
  imports: [ SequelizeModule.forFeature([RolesModel, UserEntity, RolePermissionsModel, UserRolesModel])],
  controllers: [ RolesController ],
  providers: [
    RolesService,
    PostgresRoleRepository,
    RedisService,
    {
      provide: 'TokenSecretResolver',
      useClass: DefaultTokenSecretResolverStrategy,
    },
  ],
  exports: [PostgresRoleRepository, RolesService],
})
export class RolesModule {}

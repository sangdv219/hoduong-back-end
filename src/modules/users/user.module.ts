import { PasswordModule } from '@modules/password/password.module';
import { RolesModule } from '@modules/roles/roles.module';
import { FamilyMembersModule } from '@modules/family-members/family-members.module';
import { UserAdminController } from '@modules/users/controller/user.admin.controller';
import { UserModel } from '@infrastructure/models/user.model';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { UserService } from '@modules/users/services/user.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { DefaultTokenSecretResolverStrategy } from '@core/strategies/default-token-secret-resolver.strategy';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserRolesModel } from '@infrastructure/models/user_roles.model';
import { PostgresUserRolesRepository } from '@modules/associations/repositories/user-roles.repository';
import { PostgresRolePermissionsRepository } from '@modules/associations/repositories/role-permissions.repository';
import { AssociationsModule } from '@modules/associations/associations.module';
import { RolePermissionsModel } from '@modules/associations/models/role-permissions.model';
import { RegisterUserUseCase } from '@modules/users/use-cases/sign-up/signup.use-case';
import { CreateUserUseCase } from '@modules/users/use-cases/create-user/create-user.use-case';
import { OTPService } from '@modules/auth/services/OTP.service';
import { UserStatusStrategyFactory } from '@modules/users/strategies/userStatusStrategy';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, UserRolesModel, RolePermissionsModel, FamilyMembersModel, CouplesModel]),
    AssociationsModule,
    PasswordModule,
    RolesModule,
    FamilyMembersModule,
  ],
  controllers: [UserAdminController],
  providers: [
    PostgresUserRepository,
    UserService,
    PostgresUserRolesRepository,
    PostgresRolePermissionsRepository,
    RedisService,
    RegisterUserUseCase,
    CreateUserUseCase,
    OTPService,
    JwtModule,
    UserStatusStrategyFactory,
    UserQueryBuilder,
    {
      provide: 'TokenSecretResolver',
      useClass: DefaultTokenSecretResolverStrategy,
    },
  ],
  exports: [PostgresUserRepository, UserService],
})
export class UserModule {}

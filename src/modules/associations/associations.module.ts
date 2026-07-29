import { PermissionsModel } from '@modules/permissions/domain/models/permissions.model';
import { PostgresPermissionsRepository } from '@modules/permissions/infrastructure/repository/postgres-permissions.repository';
import { RolesModel } from '@/infrastructure/models/roles.model';
import { UserModel } from '@/infrastructure/models/user.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresRolePermissionsRepository } from './repositories/role-permissions.repository';
import { RolePermissionsModel } from './models/role-permissions.model';

@Module({
  imports: [ SequelizeModule.forFeature([RolesModel, PermissionsModel, UserModel, RolePermissionsModel])],
  providers: [
    PostgresPermissionsRepository,
    PostgresRolePermissionsRepository, 
  ],
  exports: [
    PostgresPermissionsRepository, 
    PostgresRolePermissionsRepository, 
  ],
})
export class AssociationsModule {}

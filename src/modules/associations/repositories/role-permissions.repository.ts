import { AbstractRolePermissionsRepository } from '@modules/associations/abstract/abstract-role-permissions.repository';
import { RolePermissionsModel } from '@modules/associations/models/role-permissions.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class RolePermissionsRepository extends AbstractRolePermissionsRepository {
  private static readonly searchableFields = ['name', 'description'];
  constructor(@InjectModel(RolePermissionsModel)
    protected readonly rolePermissionsModel: typeof RolePermissionsModel,
  ) {
    super(rolePermissionsModel, RolePermissionsRepository.searchableFields);
  }
}

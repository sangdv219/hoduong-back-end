import { AbstractUserRolesRepository } from '@modules/associations/abstract/abstract-user-roles.repository';
import { UserRolesModel } from '@infrastructure/models/user_roles.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

@Injectable()
export class PostgresUserRolesRepository extends AbstractUserRolesRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    @InjectModel(UserRolesModel)
    protected readonly userRolesModel: typeof UserRolesModel,
  ) {
    super(userRolesModel, PostgresUserRolesRepository.searchableFields);
  }

  async assignRole(
    userId: string,
    roleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    await this.model.create(
      { user_id: userId, role_id: roleId },
      { transaction },
    );
  }
}

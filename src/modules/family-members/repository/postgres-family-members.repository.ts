import { BaseRepository } from '@domain/repositories/base.repository';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

export abstract class AbstractFamilyMembersRepository extends BaseRepository<FamilyMembersModel> {}

@Injectable()
export class PostgresFamilyMembersRepository extends AbstractFamilyMembersRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    private readonly userQueryBuilder: UserQueryBuilder,
  ) {
    super(FamilyMembersModel, PostgresFamilyMembersRepository.searchableFields);
  }

  async findByUserId(userId: string, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: { user_id: userId },
      transaction,
    });
  }

  async findAllAsTree(transaction?: Transaction): Promise<FamilyMembersModel[] | null> {
    return this.model.findAll({
      where: { status: true },
      transaction,
    });
  }

  async findAll(condition: Record<string, unknown>, transaction?: Transaction): Promise<FamilyMembersModel[] | null> {
    return this.model.findAll({
      where: condition,
      transaction,
    });
  }

  async findByParentId(fatherId: string, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: { father_id: fatherId, status: true },
      transaction,
    });
  }

  async findRootNode(transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: { father_id: null, status: true },
      transaction,
    });
  }

  async findByPkWithRelations(id: string, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findByPk(id, {
      include: [
        { model: UserModel, as: 'user' },
        {
          model: FamilyMembersModel,
          as: 'parent',
          include: [{ model: UserModel, as: 'user' }],
        },
      ],
      transaction,
    });
  }

  async incrementMembers(nodeId: string, transaction?: Transaction): Promise<void> {
    await this.model.increment('child_order', {
      by: 1,
      where: { id: nodeId },
      transaction,
    });
  }

  async decrementMembers(nodeId: string, transaction?: Transaction): Promise<void> {
    await this.model.decrement('child_order', {
      by: 1,
      where: { id: nodeId },
      transaction,
    });
  }

  async updateNode(
    id: string,
    data: Partial<FamilyMembersModel>,
    transaction?: Transaction,
  ): Promise<FamilyMembersModel | null> {
    const node = await this.model.findByPk(id, { transaction });
    if (!node) {
      return null;
    }
    await node.update(data, { transaction });
    return node;
  }

  async softDeactivate(id: string, updatedBy: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { status: false, updated_by: updatedBy },
      { where: { id }, transaction },
    );
  }
}

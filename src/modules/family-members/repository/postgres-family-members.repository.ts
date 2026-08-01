import { BaseRepository } from '@domain/repositories/base.repository';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { ConflictException, Injectable } from '@nestjs/common';
import { Op, Transaction, WhereOptions } from 'sequelize';

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
      where: {  },
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
      where: { father_id: fatherId,  },
      transaction,
    });
  }

  async findRootNode(father_id, mother_id, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: {
        // Hỗ trợ cả hai trường hợp: parent là cha hoặc parent là mẹ
        [Op.or]: [
          { father_id: father_id },
          { mother_id: mother_id }
        ],
      },
      transaction,
    });
  }
  async findChildrenByParentId(parentId: string, transaction?: Transaction): Promise<FamilyMembersModel[]> {
    return this.model.findAll({
      where: {
        [Op.or]: [
          { father_id: parentId },
          { mother_id: parentId },
        ],
      },
      order: [['child_order', 'ASC']], // Sắp xếp theo thứ tự anh/chị/em
      transaction,
    });
  }

  async getMaxChildOrder(parentId: string, transaction?: Transaction): Promise<number> {
    const maxOrder = await this.model.max('child_order', {
      where: {
        [Op.or]: [
          { father_id: parentId },
          { mother_id: parentId },
        ],
      },
      transaction,
    });
    
    return (maxOrder as number) || 0;
  }

  async existsChildOrder(parentId: string, childOrder: number, transaction?: Transaction): Promise<boolean> {
    const count = await this.model.count({
      where: {
        [Op.or]: [
          { father_id: parentId },
          { mother_id: parentId },
        ],
        child_order: childOrder,
      },
      transaction,
    });
    
    return count > 0;
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

  async softDeactivate(id: string, updatedBy: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { status: false, updated_by: updatedBy },
      { where: { id }, transaction },
    );
  }
}

import { BaseRepository } from '@/domain/repositories/base.repository';
import { NodeModel } from '@/infrastructure/models/node.model';
import { UserModel } from '@/infrastructure/models/user.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

export abstract class AbstractNodeRepository extends BaseRepository<NodeModel> {}

@Injectable()
export class PostgresNodeRepository extends AbstractNodeRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    @InjectModel(NodeModel)
    protected readonly nodeModel: typeof NodeModel,
  ) {
    super(nodeModel, PostgresNodeRepository.searchableFields);
  }

  async findByUserId(userId: string, transaction?: Transaction): Promise<NodeModel | null> {
    return this.model.findOne({
      where: { user_id: userId },
      transaction,
    });
  }

  async findAllAsTree(transaction?: Transaction): Promise<NodeModel[] | null> {
    return this.model.findAll({
      where: { status: true },
      transaction,
    });
  }

  async findAll(condition: Record<string, unknown>, transaction?: Transaction): Promise<NodeModel[] | null> {
    return this.model.findAll({
      where: condition,
      transaction,
    });
  }

  async findByParentId(fatherId: string, transaction?: Transaction): Promise<NodeModel | null> {
    return this.model.findOne({
      where: { father_id: fatherId, status: true },
      transaction,
    });
  }

  async findRootNode(transaction?: Transaction): Promise<NodeModel | null> {
    return this.model.findOne({
      where: { father_id: null, status: true },
      transaction,
    });
  }

  async findByPkWithRelations(id: string, transaction?: Transaction): Promise<NodeModel | null> {
    return this.model.findByPk(id, {
      include: [
        { model: UserModel, as: 'user' },
        {
          model: NodeModel,
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
    data: Partial<NodeModel>,
    transaction?: Transaction,
  ): Promise<NodeModel | null> {
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

import { BaseRepository } from '@/domain/repositories/base.repository';
import { NodeModel } from '@/infrastructure/models/node.model';
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
      where: { is_active: true },
      transaction,
    });
  }

  async findAll(condition: any, transaction?: Transaction) : Promise<NodeModel[] | null> {
    return this.model.findAll({
      where: condition,
      transaction,
    });
  }

  async findByParentId(parentId: string, transaction?: Transaction): Promise<NodeModel | null> {
    return this.model.findOne({
      where: { parent_id: parentId },
      transaction,
    });
  }

  async incrementMembers(nodeId: string, transaction?: Transaction): Promise<void> {
    await this.model.increment('members', {
      by: 1,
      where: { id: nodeId },
      transaction,
    });
  }
}

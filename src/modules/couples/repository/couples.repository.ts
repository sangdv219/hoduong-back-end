import { BaseRepository } from '@/domain/repositories/base.repository';
import { CouplesModel } from '@/infrastructure/models/couples.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

export abstract class AbstractCouplesRepository extends BaseRepository<CouplesModel> {}

@Injectable()
export class CouplesRepository extends AbstractCouplesRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    @InjectModel(CouplesModel)
    protected readonly coupleModel: typeof CouplesModel,
  ) {
    super(coupleModel, CouplesRepository.searchableFields);
  }

  async findByUserId(userId: string, transaction?: Transaction): Promise<CouplesModel | null> {
    return this.model.findOne({
      where: { user_id: userId },
      transaction,
    });
  }

  async findByNodeId(nodeId: string, transaction?: Transaction): Promise<CouplesModel | null> {
    return this.model.findOne({
      where: { node_id: nodeId },
      transaction,
    });
  }

  async findAllByNodeId(nodeId: string, transaction?: Transaction): Promise<CouplesModel[]> {
    return this.model.findAll({
      where: { node_id: nodeId, status: true },
      transaction,
    });
  }

  async deactivateByNodeId(nodeId: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { status: false },
      { where: { node_id: nodeId }, transaction },
    );
  }

  async deactivateByUserId(userId: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { status: false },
      { where: { user_id: userId }, transaction },
    );
  }
}

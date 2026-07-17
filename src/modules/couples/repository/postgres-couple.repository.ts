import { BaseRepository } from '@/domain/repositories/base.repository';
import { CoupleModel } from '@/infrastructure/models/couple.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';

export abstract class AbstractCoupleRepository extends BaseRepository<CoupleModel> {}

@Injectable()
export class PostgresCoupleRepository extends AbstractCoupleRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    @InjectModel(CoupleModel)
    protected readonly coupleModel: typeof CoupleModel,
  ) {
    super(coupleModel, PostgresCoupleRepository.searchableFields);
  }

  async findByUserId(userId: string, transaction?: Transaction): Promise<CoupleModel | null> {
    return this.model.findOne({
      where: { user_id: userId, is_active: true },
      transaction,
    });
  }

  async findByNodeId(nodeId: string, transaction?: Transaction): Promise<CoupleModel | null> {
    return this.model.findOne({
      where: { node_id: nodeId, is_active: true },
      transaction,
    });
  }

  async findAllByNodeId(nodeId: string, transaction?: Transaction): Promise<CoupleModel[]> {
    return this.model.findAll({
      where: { node_id: nodeId, is_active: true },
      transaction,
    });
  }

  async deactivateByNodeId(nodeId: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { is_active: false },
      { where: { node_id: nodeId }, transaction },
    );
  }

  async deactivateByUserId(userId: string, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { is_active: false },
      { where: { user_id: userId }, transaction },
    );
  }
}

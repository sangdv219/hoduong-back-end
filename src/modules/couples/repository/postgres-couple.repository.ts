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
      where: { user_id: userId },
      transaction,
    });
  }

  async findByNodeId(nodeId: string, transaction?: Transaction): Promise<CoupleModel | null> {
    return this.model.findOne({
      where: { node_id: nodeId },
      transaction,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@domain/repositories/base.repository';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { ICouplesPaginationDTO } from '@modules/couples/dto/couples.request.dto';
import { CouplesQueryBuilder } from '@modules/couples/query/couples.query.builder';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';

export abstract class AbstractCouplesRepository extends BaseRepository<CouplesModel> {}

@Injectable()
export class CouplesRepository extends AbstractCouplesRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    private readonly couplesQueryBuilder: CouplesQueryBuilder,
  ) {
    super(CouplesModel, CouplesRepository.searchableFields);
  }

  async search(params: ICouplesPaginationDTO, customOptions: FindOptions<CouplesModel>){
    const options = this.couplesQueryBuilder.build(params);
    const where: WhereOptions = {
      ...options.where,
      ...customOptions?.where,
    };

    // if (!where['status']) {
    //   where['status'] = { [Op.ne]: Status.ARCHIVED };
    // }

    console.log('params couples repository', params);

    const finalOptions = {
      ...options,
      ...customOptions,
      where,
    };

    const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
    
    return { items: rows, total: count } as any
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

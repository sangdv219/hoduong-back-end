import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@domain/repositories/base.repository';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { ICouplesPaginationDTO } from '@modules/couples/dto/couples.request.dto';
import { CouplesQueryBuilder } from '@modules/couples/query/couples.query.builder';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';

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

  async getNextCoupleOrder(partnerId: string, transaction?: Transaction): Promise<number> {
    // Lấy row couple_order lớn nhất hiện tại của partner này, khoá lại (FOR UPDATE)
    // để request thứ 2 chạy song song phải đợi request đầu commit xong mới đọc được.
    const lastCouple = await this.model.findOne({
      where: {
        [Op.or]: [{ partner_1_id: partnerId }, { partner_2_id: partnerId }],
      },
      order: [['couple_order', 'DESC']],
      lock: transaction ? Transaction.LOCK.UPDATE : undefined,
      transaction,
    });

    return (lastCouple?.couple_order ?? 0) + 1;
  }

  async findByPartnerId(partnerId: string, transaction?: Transaction): Promise<CouplesModel | null> {
    return this.model.findOne({
      where: {
        [Op.or]: [
          { partner_1_id: partnerId }, 
          { partner_2_id: partnerId }
        ]
      },
      transaction
    });
  }
}

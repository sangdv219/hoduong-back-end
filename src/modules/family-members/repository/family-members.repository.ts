import { CouplesModel } from '@infrastructure/models/couples.model';
import { BaseRepository } from '@domain/repositories/base.repository';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { FamilyMembersQueryBuilder } from '@modules/family-members/query/family-members.query.builder';
import { Injectable, Logger } from '@nestjs/common';
import { FindOptions, Op, QueryTypes, Sequelize, Transaction, WhereOptions } from 'sequelize';
import { FamilyMembersPaginationDTO } from '../dto/family-members.request.dto';
import { InjectConnection } from '@nestjs/sequelize';

export abstract class AbstractFamilyMembersRepository extends BaseRepository<FamilyMembersModel> {}

@Injectable()
export class FamilyMembersRepository extends AbstractFamilyMembersRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly familyMembersQueryBuilder: FamilyMembersQueryBuilder,
  ) {
    super(FamilyMembersModel, FamilyMembersRepository.searchableFields);
  }

  async findByFamilyMembersId(FamilyMembersId: string, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: { FamilyMembers_id: FamilyMembersId },
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
      where: { parent_couple_id: fatherId,  },
      transaction,
    });
  }

  async findRootNode(parent_couple_id, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: {
        // Hỗ trợ cả hai trường hợp: parent là cha hoặc parent là mẹ
        [Op.or]: [
          { parent_couple_id: parent_couple_id },
        ],
      },
      transaction,
    });
  }
  
  async findChildrenByParentId(parentId: string, transaction?: Transaction): Promise<FamilyMembersModel[]> {
    return this.model.findAll({
      where: {
        [Op.or]: [
          { parent_couple_id: parentId },
        ],
      },
      order: [['child_order', 'ASC']], // Sắp xếp theo thứ tự anh/chị/em
      transaction,
    });
  }

  async getMaxChildOrder(parent_couple_id: string | null, transaction?: Transaction): Promise<number> {
    const maxOrder = await this.model.max('child_order', {
      where: {
        [Op.or]: [
          { parent_couple_id: parent_couple_id },
        ],
      },
      transaction,
    });
    
    return (maxOrder as number) || 0;
  }

  async getDescendantIds(rootId: string, transaction?: Transaction): Promise<string[]> {
    const rows = await this.sequelize.query(
      `WITH RECURSIVE descendants AS (
         SELECT id, parent_couple_id FROM family_members WHERE parent_couple_id IN (
           SELECT id FROM couples WHERE partner_1_id = :rootId OR partner_2_id = :rootId
         )
         UNION ALL
         SELECT fm.id, fm.parent_couple_id
         FROM family_members fm
         INNER JOIN descendants d ON fm.parent_couple_id IN (
           SELECT id FROM couples WHERE partner_1_id = d.id OR partner_2_id = d.id
         )
       )
       SELECT id FROM descendants;`,
      { replacements: { rootId }, type: QueryTypes.SELECT, transaction }
    );
    return rows.map((r: any) => r.id);
  }

  async bulkShiftGenerationOrder(ids: string[], delta: number, transaction?: Transaction): Promise<void> {
    await this.model.update(
      { generation_order: Sequelize.literal(`generation_order + (${delta})`) },
      { where: { id: { [Op.in]: ids } }, transaction }
    );
  }
  
  async existsChildOrder(parentId: string, childOrder: number, transaction?: Transaction): Promise<boolean> {
    const count = await this.model.count({
      where: {
        [Op.or]: [
          { parent_couple_id: parentId },
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
        // { model: UserModel, as: 'user' },
        {
          model: FamilyMembersModel,
          as: 'partners',
          include: [{ model: CouplesModel, as: 'parent_coiuple' }],
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

  async getTree(query, rootNodeId, maxDepth){
    return await this.model.sequelize.query(query, {
      replacements: { rootNodeId, maxDepth },
      type: QueryTypes.SELECT,
    });
  }

  async search(params: FamilyMembersPaginationDTO, customOptions: FindOptions<FamilyMembersModel>){
    const options = this.familyMembersQueryBuilder.build(params);
    Logger.log('options_____', options);
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
        // distinct: true, 
        // col: 'id',
      };
      
      const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
      Logger.log('rows', rows);
    
    return { items: rows, total: count } as any
  }

  async findByUserId(userId: string, transaction?: Transaction){
    return this.model.findOne({
      where: { user_id: userId },
      transaction,
    });
  }
}

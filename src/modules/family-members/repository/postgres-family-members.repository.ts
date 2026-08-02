import { BaseRepository } from '@domain/repositories/base.repository';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { FamilyMembersQueryBuilder } from '@modules/family-members/query/family-members.query.builder';
import { ConflictException, Injectable } from '@nestjs/common';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { IFamilyMembersPaginationDTO } from '../dto/family-members.request.dto';
import { includes } from 'zod';
import { UserModel } from '@/infrastructure/models/user.model';

export abstract class AbstractFamilyMembersRepository extends BaseRepository<FamilyMembersModel> {}

@Injectable()
export class PostgresFamilyMembersRepository extends AbstractFamilyMembersRepository {
  private static readonly searchableFields: string[] = [];

  constructor(
    private readonly familyMembersQueryBuilder: FamilyMembersQueryBuilder,
  ) {
    super(FamilyMembersModel, PostgresFamilyMembersRepository.searchableFields);
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
      where: { father_id: fatherId,  },
      transaction,
    });
  }

  async findRootNode(father_id, transaction?: Transaction): Promise<FamilyMembersModel | null> {
    return this.model.findOne({
      where: {
        // Hỗ trợ cả hai trường hợp: parent là cha hoặc parent là mẹ
        [Op.or]: [
          { father_id: father_id },
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
          as: 'father',
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

  async search(params: IFamilyMembersPaginationDTO, customOptions: FindOptions<FamilyMembersModel>){
    const options = this.familyMembersQueryBuilder.build(params);
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

    try {
      const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
      console.log('rows', rows)
      
    } catch (error) {
      console.log('error', error)
      
    }
    const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
    
    return {
             items: rows,  
             total: count,
           } as any
  }

  async findByUserId(userId: string, transaction?: Transaction){
    return this.model.findOne({
      where: { user_id: userId },
      transaction,
    });
  }
}

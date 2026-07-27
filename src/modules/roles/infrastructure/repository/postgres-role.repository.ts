import { RolesModel } from '@/infrastructure/models/roles.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, WhereOptions } from 'sequelize';
import { BaseRepository } from '@/domain/repositories/base.repository';
import { IPaginatedResult, IPaginationDTO } from '@/shared/interface/common';

class AbstractRoleRepository extends BaseRepository<RolesModel> {}
@Injectable()
export class PostgresRoleRepository extends AbstractRoleRepository {
  private static readonly searchableFields = ['sku', 'price', 'promotion_price', 'evaluate'];
  constructor(
    @InjectModel(RolesModel)
    protected readonly productModel: typeof RolesModel,
  ) {
    super(productModel, PostgresRoleRepository.searchableFields);
  }

  async paginate(params: IPaginationDTO, options: FindOptions<RolesModel> = {}): Promise<IPaginatedResult<RolesModel>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Xử lý Sort
    let order: any = [['created_at', 'DESC']];
    if (params.sortOrder) {
        const direction = params.sortOrder.startsWith('-') ? 'DESC' : 'ASC';
        const column = params.sortOrder.replace('-', '');
        order = [[column, direction]];
    }

    // 2. Xử lý Filter & Keyword
    let whereClause: WhereOptions = options.where || {}; // Lấy filter gốc từ Service truyền xuống
    
    // Nếu có keyword và có khai báo searchableFields -> Merge điều kiện Search
    if (params.keyword && this.searchableFields.length > 0) {
      const searchCondition = {
        [Op.or]: this.searchableFields.map(field => ({
          [field]: { [Op.iLike]: `%${params.keyword}%` }
        }))
      };
      
      // Kết hợp logic: (Filter gốc) AND (Search Keyword)
      // Ví dụ: (price > 100) AND (name LIKE %abc% OR code LIKE %abc%)
      whereClause = {
        [Op.and]: [whereClause, searchCondition]
      };
    }

    const { rows, count } = await this.model.findAndCountAll({
      ...options, // Spread options để lấy include, attributes...
      where: whereClause,
      limit,
      offset,
      order: options.order || order,
    });

    return {
      items: rows,
      total: count,
      // page,
      // limit,
      // totalPages: Math.ceil(count / limit),
    };
  }
}

import { BaseRepository } from '@/domain/repositories/base.repository';
import { Status, UserEntity } from '@/infrastructure/models/user.model';
import { Injectable } from '@nestjs/common';
import { FindOptions, Op, Transaction } from 'sequelize';
import { UserPaginationDTO } from '../dto/user.admin.request.dto';

export abstract class AbstractUserRepository extends BaseRepository<UserEntity> {}

@Injectable()
export class PostgresUserRepository extends AbstractUserRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'fullname', 'ascii_name'];

  constructor() {
    super(UserEntity, PostgresUserRepository.searchableFields);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const record = await this.findOneByField('email', email);
    return !!record;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const record = await this.findOneByField('phone', phone);
    return !!record;
  }


  async search(params: UserPaginationDTO){
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Xử lý Sắp xếp (Order)
    let order: any = [['created_at', 'DESC']];
    if (params.sortOrder) {
        const direction = params.sortOrder.startsWith('-') ? 'DESC' : 'ASC';
        const column = params.sortOrder.replace('-', '');
        order = [[column, direction]];
    }
    // 2. Bóc tách các tham số phân trang/sắp xếp ra khỏi điều kiện filter
    const { page: _p, limit: _l, sortOrder: _s, status, ...otherFilters } = params as any;

    // 3. Khởi tạo điều kiện filter cơ bản từ các params còn lại
    const whereClause: any = {};
    Object.keys(otherFilters).forEach((key) => {
      if (otherFilters[key] !== undefined && otherFilters[key] !== null && otherFilters[key] !== '') {
        whereClause[key] = otherFilters[key];
      }
    });
    if (status) {
      const statusValue = String(status).toLowerCase();
        // Nếu truyền status cụ thể (VD: 'active', 'pending'...) -> Query chính xác status đó
        whereClause.status = statusValue;
    } else {
      // MẶC ĐỊNH: Nếu không truyền status -> Lấy tất cả TRỪ status = 'archived'
      whereClause.status = {
        [Op.ne]: Status.ARCHIVED, // Tương đương SQL: WHERE status != 'archived'
      };
    }

    // 5. Query dữ liệu
    const { rows, count } = await this.model.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order,
    });

    return {
      items: rows,  
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }


  async findAll(userIds: string[], transaction?: Transaction): Promise<UserEntity[] | null> {
    return this.model.findAll({
      where: { id: { [Op.in]: userIds } },
      transaction,
    });
  }
}

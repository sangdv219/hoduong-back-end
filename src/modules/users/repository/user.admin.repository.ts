import { RolesModel } from '@/infrastructure/models/roles.model';
import { BaseRepository } from '@domain/repositories/base.repository';
import { Status, UserEntity } from '@infrastructure/models/user.model';
import { UserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { prepareSearchParams } from '@modules/users/helpers/user-response.helper';
import { Injectable } from '@nestjs/common';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { GetAllUserAdminResponseDto } from '../dto/user.admin.response.dto';

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

  
  async search(params: UserPaginationDTO, customOptions?: FindOptions): Promise<GetAllUserAdminResponseDto | any> {
    const {page = 1, limit = 10, keyword, sortBy, sortOrder, status, life_status, ...otherFilters} = params;
    const offset = (page - 1) * limit;

    try {
      
      let column = 'created_at';
      let direction = 'DESC';
   
      if (sortBy) {
        // Trường hợp 1: Chuẩn RESTful mới (sortBy = 'name', sortOrder = 'asc' hoặc sortBy = '-name')
        if (sortBy.startsWith('-')) {
          column = sortBy.substring(1);
          direction = 'DESC';
        } else {
          column = sortBy;
          direction = sortOrder && String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      } else if (sortOrder) {
        // Trường hợp 2: Fallback logic cũ (truyền sortOrder = '-name' hoặc 'name')
        direction = sortOrder.startsWith('-') ? 'DESC' : 'ASC';
        column = sortOrder.replace('-', '');
      }
   
      const order: any = [[column, direction]];
      
       // 2. Bóc tách các tham số phân trang/sắp xếp ra khỏi điều kiện filter
      //  const { page: _p, limit: _l, sortOrder: _s, sortBy: _sb, keyword: _k, status, life_status, ...otherFilters } = params as any;
   
       // 3. Khởi tạo điều kiện filter cơ bản từ các params còn lại
       const whereClause: WhereOptions<UserEntity> = {};
   
       Object.keys(otherFilters).forEach((key) => {
         if (otherFilters[key] !== undefined && otherFilters[key] !== null && otherFilters[key] !== '') {
           whereClause[key] = otherFilters[key];
         }
       });
   
       if (keyword && keyword.trim()) {
         const { rawInput, phoneKeyword, asciiKeyword, flexibleAsciiPattern } = prepareSearchParams(keyword);
         const orConditions: any[] = [
           // Tim theo email
           { email: { [Op.iLike]: `%${rawInput}%` } },
           // Tim theo ascii_name (khớp dạng slug: 'nguyen-van')
           { ascii_name: { [Op.iLike]: `%${asciiKeyword}%` } },
           // Tim theo ascii_name linh hoạt (khớp cả khi dùng khoảng trắng)
           { ascii_name: { [Op.iLike]: `%${flexibleAsciiPattern}%` } },
         ];
         
         if (phoneKeyword.length > 0) {
           orConditions.push({ phone: { [Op.iLike]: `%${phoneKeyword}%` } });
         }
   
         whereClause[Op.or] = orConditions;
       }
   
       if (status) {
          whereClause['status'] = String(status).toLowerCase();
        } else {
          whereClause['status'] = { [Op.ne]: Status.ARCHIVED };
        }

       if (life_status !== undefined && life_status !== null && String(life_status) !== '') {
          whereClause['life_status'] = Number(life_status); 
       }
   
       const queryOptions: FindOptions = {
        where: whereClause,
        limit,
        offset,
        order,
        ...customOptions, 
      };

      const { rows, count } = await this.model.findAndCountAll(queryOptions);

       return {
         items: rows,  
         total: count,
         page,
         limit,
         totalPages: Math.ceil(count / limit),
       };
    } catch (error) {
        console.log('error_', error)
    }
  }


  async findAll(userIds: string[], transaction?: Transaction): Promise<UserEntity[] | null> {
    return this.model.findAll({
      where: { id: { [Op.in]: userIds } },
      transaction,
    });
  }
}

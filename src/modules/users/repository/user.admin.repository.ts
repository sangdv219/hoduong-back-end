import { RolesModel } from '@/infrastructure/models/roles.model';
import { BaseRepository } from '@domain/repositories/base.repository';
import { Status, UserModel } from '@infrastructure/models/user.model';
import { IUserPaginationDTO, UserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { prepareSearchParams } from '@modules/users/helpers/user-response.helper';
import { Injectable } from '@nestjs/common';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { GetAllUserAdminResponseDto, IUserAdmin } from '@modules/users/dto/user.admin.response.dto';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { IPaginatedResult, IPaginationDTO } from '@/shared/interface/common';

export abstract class AbstractUserRepository extends BaseRepository<UserModel> {}

@Injectable()
export class PostgresUserRepository extends AbstractUserRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'fullname', 'ascii_name'];
  private readonly sortableColumns = {
    age: 'age',
    created_at: 'created_at',
    updated_at: 'updated_at',
  };
  constructor(
    private readonly userQueryBuilder: UserQueryBuilder,
  ) {
    super(UserModel, PostgresUserRepository.searchableFields);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const record = await this.findOneByField('email', email);
    return !!record;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const record = await this.findOneByField('phone', phone);
    return !!record;
  }

  
  // async search(params: UserPaginationDTO, customOptions?: FindOptions): Promise<GetAllUserAdminResponseDto> {
  //   const {page = 1, limit = 10, keyword, sortBy, sortOrder, status, life_status, ...filters} = params;
  //   const offset = (page - 1) * limit;
    
  //   // try {
  //     let column = 'created_at';
  //     let direction = 'DESC';
   
  //     if (sortBy) {
  //       if (sortBy.startsWith('-')) {
  //         column = sortBy.substring(1);
  //         direction = 'DESC';
  //       } else {
  //         column = this.sortableColumns[sortBy] ?? 'created_at';;
  //         direction = sortOrder && String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  //       }
  //     } else if (sortOrder) {
  //       const upperSortOrder = String(sortOrder).toUpperCase();
  //       if (upperSortOrder === 'ASC' || upperSortOrder === 'DESC') {
  //         direction = upperSortOrder;
  //       } else {
  //         direction = sortOrder.startsWith('-') ? 'DESC' : 'ASC';
  //         column = sortOrder.replace('-', '');
  //       }
  //     }
   
  //     const order: any = [[column, direction]];
  //     const whereCondition: WhereOptions<UserModel> = {};
      
  //     Object.keys(filters).forEach((key) => {
  //       if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
  //         whereCondition[key] = filters[key];
  //       }
  //     });
      
  //      if (keyword && keyword.trim()) {
  //        const { rawInput, phoneKeyword, asciiKeyword, flexibleAsciiPattern } = prepareSearchParams(keyword);
  //        const orConditions: any[] = [
  //          // Tim theo email
  //          { email: { [Op.iLike]: `%${rawInput}%` } },
  //          // Tim theo ascii_name (khớp dạng slug: 'nguyen-van')
  //          { ascii_name: { [Op.iLike]: `%${asciiKeyword}%` } },
  //          // Tim theo ascii_name linh hoạt (khớp cả khi dùng khoảng trắng)
  //          { ascii_name: { [Op.iLike]: `%${flexibleAsciiPattern}%` } },
  //        ];
         
  //        if (phoneKeyword.length > 0) {
  //          orConditions.push({ phone: { [Op.iLike]: `%${phoneKeyword}%` } });
  //        }
   
  //        whereCondition[Op.or] = orConditions;
  //      }
   
  //      if (status) {
  //         whereCondition['status'] = String(status).toLowerCase();
  //       } else {
  //         whereCondition['status'] = { [Op.ne]: Status.ARCHIVED };
  //       }

  //      if (life_status !== undefined && life_status !== null && String(life_status) !== '') {
  //         whereCondition['life_status'] = Number(life_status); 
  //      }
  //     if (customOptions?.where) {
  //       Object.assign(whereCondition, customOptions.where);
  //     }

  //      const queryOptions: FindOptions = {
  //        ...customOptions, 
  //        where: whereCondition,
  //        limit,
  //        offset,
  //        order,
  //       };

  //       const { rows, count } = await this.model.findAndCountAll(queryOptions);

  //      return {
  //        items: rows,  
  //        total: count,
  //        page,
  //        limit,
  //        totalRecord: Math.ceil(count / limit),
  //      };
  //   // } catch (error) {
  //   //     console.log('error_', error)
  //   // }
  // }

  async search(params: IUserPaginationDTO, customOptions: FindOptions<UserModel>){
    const options = this.userQueryBuilder.build(params);
    const finalOptions = {
      ...options,
      ...customOptions,
      where:{
        ...options.where,
        ...customOptions?.where,
      }
    };
    const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
    return {
             items: rows,  
             total: count,
            //  page,
            //  limit,
            //  totalRecord: Math.ceil(count / limit),
           } as any
  }

  async findAll(userIds: string[], transaction?: Transaction): Promise<UserModel[] | null> {
    return this.model.findAll({
      where: { id: { [Op.in]: userIds } },
      transaction,
    });
  }
}

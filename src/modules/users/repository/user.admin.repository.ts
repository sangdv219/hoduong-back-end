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

import { BaseRepository } from '@domain/repositories/base.repository';
import { Status, UserModel } from '@infrastructure/models/user.model';
import { IUserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { Injectable, Logger } from '@nestjs/common';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';

export abstract class AbstractUserRepository extends BaseRepository<UserModel> {}

@Injectable()
export class UserRepository extends AbstractUserRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'fullname', 'ascii_name'];

  constructor(
    private readonly userQueryBuilder: UserQueryBuilder,
  ) {
    super(UserModel, UserRepository.searchableFields);
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
    const where: WhereOptions = {
      ...options.where,
      ...customOptions?.where,
    };

    if (!where['status']) {
      where['status'] = { [Op.ne]: Status.ARCHIVED };
    }
    console.log('params user repository', params); 
    const finalOptions = {
      ...options,
      ...customOptions,
      where,
      distinct: true, 
      col: 'id',
    };

    const { rows, count } :{rows:any[], count: number}= await this.model.findAndCountAll(finalOptions);
    return { items: rows,  total: count } as any
  }

  async findAll(userId: string[], transaction?: Transaction): Promise<UserModel[] | null> {
    return this.model.findAll({
      where: { id: { [Op.in]: userId } },
      transaction,
    });
  }
}

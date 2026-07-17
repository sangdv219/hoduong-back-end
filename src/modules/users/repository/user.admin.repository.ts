import { BaseRepository } from '@/domain/repositories/base.repository';
import { UserEntity } from '@/infrastructure/models/user.model';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

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

  async findAll(userIds: string[], transaction?: Transaction): Promise<UserEntity[] | null> {
    return this.model.findAll({
      where: { id: { [Op.in]: userIds } },
      transaction,
    });
  }
}

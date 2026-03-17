import { BaseRepository } from '@/domain/repositories/base.repository';
import { UserEntity } from '@/infrastructure/models/user.model';
import { Injectable } from '@nestjs/common';

export abstract class AbstractUserRepository extends BaseRepository<UserEntity> {}
@Injectable()
export class PostgresUserRepository extends AbstractUserRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'name'];
  constructor(
    // @InjectModel(UserEntity)
    // protected readonly UserEntity: typeof UserEntity
  ) {
    super(UserEntity, PostgresUserRepository.searchableFields);
  }
}

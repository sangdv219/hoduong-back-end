import { UserEntity } from '@/infrastructure/models/user.model';
import { AbstractAnalyticsRepository } from '@modules/analytics/domain/abstract/abstract-analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostgresAnalyticsRepository extends AbstractAnalyticsRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'name'];
  constructor(
    // @InjectModel(UserEntity)
    // protected readonly UserEntity: typeof UserEntity,
  ) {
    super(UserEntity, PostgresAnalyticsRepository.searchableFields);
  }
}

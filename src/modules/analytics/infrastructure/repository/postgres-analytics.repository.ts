import { UserModel } from '@infrastructure/models/user.model';
import { AbstractAnalyticsRepository } from '@modules/analytics/domain/abstract/abstract-analytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostgresAnalyticsRepository extends AbstractAnalyticsRepository {
  private static readonly searchableFields = ['phone', 'gender', 'email', 'name'];
  constructor(
    // @InjectModel(UserModel)
    // protected readonly UserModel: typeof UserModel,
  ) {
    super(UserModel, PostgresAnalyticsRepository.searchableFields);
  }
}

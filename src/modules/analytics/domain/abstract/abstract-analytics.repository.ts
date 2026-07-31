import { BaseRepository } from '@/domain/repositories/base.repository';
import { UserModel } from '@infrastructure/models/user.model';

export abstract class AbstractAnalyticsRepository extends BaseRepository<UserModel> {}

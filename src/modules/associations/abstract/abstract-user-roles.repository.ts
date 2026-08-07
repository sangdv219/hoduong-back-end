import { BaseRepository } from '@domain/repositories/base.repository';
import { UserRolesModel } from '@infrastructure/models/user_roles.model';

export abstract class AbstractUserRolesRepository extends BaseRepository<UserRolesModel> {}

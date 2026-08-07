import { BaseRepository } from '@domain/repositories/base.repository';
import { RolePermissionsModel } from '@modules/associations/models/role-permissions.model';

export abstract class AbstractRolePermissionsRepository extends BaseRepository<RolePermissionsModel> {}

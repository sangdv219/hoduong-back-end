import { BaseRepository } from '@domain/repositories/base.repository';
import { PermissionsModel } from '@modules/permissions/domain/models/permissions.model';

export abstract class AbstractPermissionsRepository extends BaseRepository<PermissionsModel> {}

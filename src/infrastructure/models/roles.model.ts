import { UserRolesModel } from '@infrastructure/models/user_roles.model';
import { RolePermissionsModel } from '@modules/associations/models/role-permissions.model';
import { ROLES_ENTITY } from '@modules/roles/constants/roles.constant';
import { BaseModel } from '@shared/model/base.model';
import { BelongsToMany, Column, DataType, HasMany, PrimaryKey, Table } from 'sequelize-typescript';
import { UserEntity } from './user.model';

export interface IRole{
  id: string,
  description: string,
}
@Table({ tableName: ROLES_ENTITY.TABLE_NAME })
export class RolesModel extends BaseModel<RolesModel> implements IRole{
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4, // 🟢 Dùng DataType.UUIDV4 thay cho Sequelize.literal
  })
  declare id: string;

  @Column({ type: DataType.STRING(100) })
  declare name: string;

  @Column({ type: DataType.STRING(100) })
  declare description: string;

  @HasMany(() => UserRolesModel)
  declare userRoles: UserRolesModel[]

  @HasMany(() => RolePermissionsModel)
  declare rolePermission: RolePermissionsModel[]

  @BelongsToMany(() => UserEntity, {
    through: () => UserRolesModel,
    foreignKey: 'role_id',
    otherKey: 'user_id',
  })
  users!: UserEntity[];
}
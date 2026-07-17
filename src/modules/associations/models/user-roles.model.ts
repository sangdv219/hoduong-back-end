import { RolesModel } from '@/infrastructure/models/roles.model';
import { UserEntity } from '@/infrastructure/models/user.model';
import { BaseModel } from '@shared/model/base.model';
import { AllowNull, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';
import { USER_ROLES_ENTITY } from '@modules/associations/constants/user-roles.constant';

@Table({ tableName: USER_ROLES_ENTITY.TABLE_NAME })
export class UserRolesModel extends BaseModel<UserRolesModel> {
  @ForeignKey(() => UserEntity)
  @PrimaryKey
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  declare user_id: string;

  @BelongsTo(() => UserEntity)
  declare user: UserEntity;

  @ForeignKey(() => RolesModel)
  @PrimaryKey
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  declare role_id: string;

  @BelongsTo(() => RolesModel)
  declare role: RolesModel;
}
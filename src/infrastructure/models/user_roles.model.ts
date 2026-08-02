import { USER_ROLES_ENTITY } from '@modules/associations/constants/user-roles.constant';
import { BaseModel } from '@shared/model/base.model';
import { AllowNull, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, PrimaryKey, Table } from 'sequelize-typescript';
import { RolesModel } from '@infrastructure/models/roles.model';
import { UserModel } from '@infrastructure/models/user.model';

export interface IUserRoles{
  id: string,
  user_id: string,
  role_id: string,
}
@Table({ 
  tableName: USER_ROLES_ENTITY.TABLE_NAME,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id'],
    },
  ] 
})
export class UserRolesModel extends BaseModel<UserRolesModel> implements IUserRoles{
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4, // 🟢 Dùng DataType.UUIDV4 thay cho Sequelize.literal
  })
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
  })
  user_id!: string;

  @AllowNull(false)
  @ForeignKey(() => RolesModel)
  @Column({
    type: DataType.UUID,
  })
  role_id!: string;

  @BelongsTo(() => UserModel)
  user!: UserModel;

  @BelongsTo(() => RolesModel)
  role!: RolesModel;
}
import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
})
export class PermissionModel extends BaseModel<PermissionModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100), unique: true })
  declare action: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100), unique: true })
  declare resource: string;
}


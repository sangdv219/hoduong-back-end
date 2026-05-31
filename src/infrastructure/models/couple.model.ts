import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserEntity } from './user.model';
import { NodeModel } from './node.model';

@Table({
  tableName: 'couples',
  timestamps: true,
  underscored: true,
})
export class CoupleModel extends BaseModel<CoupleModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare node_id: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare level: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @BelongsTo(() => UserEntity, 'user_id')
  declare user: UserEntity;

  @BelongsTo(() => NodeModel, 'node_id')
  declare node: NodeModel;
}


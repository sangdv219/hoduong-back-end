import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserEntity } from './user.model';

@Table({
  tableName: 'nodes',
  timestamps: true,
  underscored: true,
})
export class NodeModel extends BaseModel<NodeModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare members: number;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare parent_id: string | null;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare created_at: Date;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare updated_at: Date;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  declare created_by: string | null;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  declare updated_by: string | null;

  @BelongsTo(() => UserEntity, 'user_id')
  declare user: UserEntity;

  @BelongsTo(() => NodeModel, { foreignKey: 'parent_id', as: 'parent' })
  declare parent?: NodeModel;

  @HasMany(() => NodeModel, { foreignKey: 'parent_id', as: 'children' })
  declare children?: NodeModel[];
}


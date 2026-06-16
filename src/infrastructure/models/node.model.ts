import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { CoupleModel } from '@/infrastructure/models/couple.model';
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

  @ForeignKey(() => UserEntity)
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

  @BelongsTo(() => UserEntity, 'user_id')
  declare user: UserEntity;

  @BelongsTo(() => NodeModel, { foreignKey: 'parent_id', as: 'parent' })
  declare parent?: NodeModel;

  @HasMany(() => NodeModel, { foreignKey: 'parent_id', as: 'children' })
  declare children?: NodeModel[];

  @HasMany(() => CoupleModel, 'node_id')
  declare couples?: CoupleModel[];
}


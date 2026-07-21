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

  @AllowNull(true)
  @Column(DataType.UUID)
  declare parent_branch_id: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare father_id: string | null;
  
  @AllowNull(true)
  @Column(DataType.UUID)
  declare mother_id: string | null;
  
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare child_order: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare generation_order: number;

  @BelongsTo(() => UserEntity, 'user_id')
  declare user: UserEntity;

  @BelongsTo(() => NodeModel, { foreignKey: 'father_id', as: 'parent' })
  declare parent?: NodeModel;

  @HasMany(() => NodeModel, { foreignKey: 'father_id', as: 'children' })
  declare children?: NodeModel[];

  @HasMany(() => CoupleModel, 'node_id')
  declare couples?: CoupleModel[];
}


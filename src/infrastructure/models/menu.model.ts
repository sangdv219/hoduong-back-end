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

@Table({
  tableName: 'menus',
  timestamps: true,
  underscored: true,
})
export class MenuModel extends BaseModel<MenuModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare name: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare ascii_name: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare father_id: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare type: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare couple_order: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare sort: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare link: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare status: boolean;

  @BelongsTo(() => MenuModel, { foreignKey: 'father_id', as: 'parent' })
  declare parent?: MenuModel;

  @HasMany(() => MenuModel, { foreignKey: 'father_id', as: 'children' })
  declare children?: MenuModel[];
}


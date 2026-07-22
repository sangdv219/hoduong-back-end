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
  tableName: 'configurations',
  timestamps: true,
  underscored: true,
})
export class ConfigurationModel extends BaseModel<ConfigurationModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare key: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare value: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50) })
  declare description: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare type: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare status: boolean;
}


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
  tableName: 'contacts',
  timestamps: true,
  underscored: true,
})
export class ContactModel extends BaseModel<ContactModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare fullName: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare email: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare phone: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare description: string;
}


import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';

export enum MarriageStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}
export enum MarriageDateStatus {
  SOLAR = 'SOLAR',
  LUNAR = 'LUNAR',
}
export interface ICouple{
  id: string;
  partner_1_id: string;
  partner_2_id: string;
  family_member_id: string;
  couple_order: number;
  marriage_date: Date;
  marriage_status: MarriageStatus;
  marriage_date_type: MarriageDateStatus;
  divorce_date: Date
}
@Table({
  tableName: 'couples',
  timestamps: true,
  underscored: true,
  // Tối ưu Database: Thêm unique constraint để tránh 2 người tạo trùng nhiều cặp đôi
  indexes: [
    {
      unique: true,
      fields: ['partner_1_id', 'partner_2_id'],
    }
  ]
})
export class CouplesModel extends BaseModel<CouplesModel> implements ICouple{
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;
  
  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  partner_1_id!: string;

  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  partner_2_id!: string;
  
  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  family_member_id!: string;

  @AllowNull(true)
  @Default(1)
  @Column(DataType.INTEGER)
  couple_order!: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  marriage_date!: Date;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(MarriageStatus)),
  })
  marriage_status!: MarriageStatus;

  @AllowNull(true)
  @Default('SOLAR')
  @Column({
    type: DataType.ENUM(...Object.values(MarriageDateStatus)),
  })
  marriage_date_type!: MarriageDateStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  divorce_date!: Date;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'partner_1_id', as: 'partner_1' })
  partner_1!: FamilyMembersModel;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'partner_2_id', as: 'partner_2' })
  partner_2!: FamilyMembersModel;
}


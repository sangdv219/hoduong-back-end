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

export enum EMarriageStatus {
  SINGLE = 'SINGLE',
  UNMARRIED = 'UNMARRIED',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export type TMarriageStatus =
  | "SINGLE"
  | "UNMARRIED"
  | "MARRIED"
  | "DIVORCED"
  | "WIDOWED";


export interface ICouples{
  id: string;
  partner_1_id: string;
  partner_2_id: string;
  couple_order: number;
  marriage_date: Date;
  marriage_status: EMarriageStatus;
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
export class CouplesModel extends BaseModel<CouplesModel> implements ICouples{
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;
  
  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare partner_1_id: string;

  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare partner_2_id: string;
  
  @AllowNull(true)
  @Default(1)
  @Column(DataType.INTEGER)
  declare couple_order: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare marriage_date: Date;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(EMarriageStatus)),
  })
  declare marriage_status: EMarriageStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare divorce_date: Date;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'partner_1_id', as: 'partner_1' })
  partner_1!: FamilyMembersModel;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'partner_2_id', as: 'partner_2' })
  partner_2!: FamilyMembersModel;
}


import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '@infrastructure/models/user.model';
import { FamilyMembersModel } from './family-members.model';


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
  user_id: string;
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
})
export class CouplesModel extends BaseModel<CouplesModel> implements ICouple{
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;
  
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;
  
  @ForeignKey(() => FamilyMembersModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  family_member_id!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  couple_order!: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  marriage_date!: Date;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(MarriageStatus)),
  })
  marriage_status!: MarriageStatus;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(MarriageDateStatus)),
  })
  marriage_date_type!: MarriageDateStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  divorce_date!: Date;

  @BelongsTo(() => UserModel, { foreignKey: 'user_id' })
  user!: UserModel;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'family_member_id' })
  family_members!: FamilyMembersModel;
}


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
  node_id: string;
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
export class CoupleModel extends BaseModel<CoupleModel> implements ICouple{
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;
  
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare node_id: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare couple_order: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare marriage_date: Date;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(MarriageStatus)),
  })
  declare marriage_status: MarriageStatus;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(MarriageDateStatus)),
  })
  declare marriage_date_type: MarriageDateStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare divorce_date: Date;

  @BelongsTo(() => UserModel, 'user_id')
  declare user: UserModel;

  @BelongsTo(() => FamilyMembersModel, 'node_id')
  declare node: FamilyMembersModel;
}


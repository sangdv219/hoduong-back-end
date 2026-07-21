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
import { UserEntity } from './user.model';
import { NodeModel } from './node.model';


export enum MarriageStatus {
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}
export enum MarriageDateStatus {
  SOLAR = 'SOLAR',
  LUNAR = 'LUNAR',
}

@Table({
  tableName: 'couples',
  timestamps: true,
  underscored: true,
})
export class CoupleModel extends BaseModel<CoupleModel> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;
  
  @ForeignKey(() => UserEntity)
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

  @BelongsTo(() => UserEntity, 'user_id')
  declare user: UserEntity;

  @BelongsTo(() => NodeModel, 'node_id')
  declare node: NodeModel;
}


import { CouplesModel } from '@infrastructure/models/couples.model';
import { UserModel } from '@infrastructure/models/user.model';
import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  PrimaryKey,
  Sequelize,
  Table
} from 'sequelize-typescript';

export enum EMemberRelationType {
  BLOOD = 'BLOOD',           // huyết thống trực hệ (con ruột / cụ tổ)
  MARRIED_IN = 'MARRIED_IN', // dâu/rể - kết hôn vào gia đình
}

export type TMemberRelationType = 'MARRIED_IN' |  'BLOOD';
           // huyết thống trực hệ (con ruột / cụ tổ)
export interface IFamilyMembers {
  id: string;
  user_id: string | null;
  parent_couple_id: string | null;
  child_order: number;
  generation_order: number;
  relation_type: EMemberRelationType;
}

@Table({
  tableName: 'family_members',
  timestamps: true,
  underscored: true,
})

export class FamilyMembersModel extends BaseModel<FamilyMembersModel> implements IFamilyMembers {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare user_id: string | null;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare generation_order: number;

  @ForeignKey(() => CouplesModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  declare parent_couple_id: string | null;
  
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare child_order: number;

  @AllowNull(false)
  // @Default(EMemberRelationType.BLOOD)
  @Column({ type: DataType.ENUM(...Object.values(EMemberRelationType)) })
  declare relation_type: EMemberRelationType;

  @BelongsTo(() => UserModel, { foreignKey: 'user_id', as: 'user' })
  declare user: UserModel; //relation N-1 with user

  @BelongsTo(() => CouplesModel, { foreignKey: 'parent_couple_id', as: 'parent_couple' })
  declare parent_couple: CouplesModel;

  @BelongsToMany(() => FamilyMembersModel, {
    through: () => CouplesModel,
    foreignKey: 'partner_1_id',
    otherKey: 'partner_2_id',
    as: 'partners'
  })
  declare partners: FamilyMembersModel[];
}


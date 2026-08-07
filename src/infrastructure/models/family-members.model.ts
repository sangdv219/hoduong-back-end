import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { CouplesModel } from '@/infrastructure/models/couples.model';
import { UserModel } from '@infrastructure/models/user.model';

export interface IFamilyMembers {
  id: string;
  user_id: string;
  parent_couple_id: string | null;
  child_order: number;
  generation_order: number;
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
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @ForeignKey(() => CouplesModel)
  @AllowNull(true)
  @Column(DataType.UUID)
  parent_couple_id!: string | null;
  
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  child_order!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  generation_order!: number;

  @BelongsTo(() => UserModel, { foreignKey: 'user_id', as: 'user' })
  user!: UserModel; //relation N-1 with user

  @BelongsTo(() => CouplesModel, { foreignKey: 'parent_couple_id', as: 'parent_couple' })
  parent_couple!: CouplesModel;

  @BelongsToMany(() => UserModel, {
    through: () => CouplesModel,
    foreignKey: 'family_member_id',
    otherKey: 'user_id',
    as: 'wife'
  })
  wife!: UserModel[];
}


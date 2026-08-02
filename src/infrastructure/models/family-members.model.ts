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
import { CoupleModel } from '@infrastructure/models/couple.model';
import { UserModel } from '@infrastructure/models/user.model';

export interface IFamilyMembers {
  id: string;
  user_id: string;
  father_id: string | null;
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

  @AllowNull(true)
  @Column(DataType.UUID)
  father_id!: string | null;
  
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  child_order!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  generation_order!: number;

  @BelongsTo(() => UserModel, { foreignKey: 'user_id', as: 'user' })
  user!: UserModel; //relation N-1 with user

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'father_id', as: 'father' })
  father!: FamilyMembersModel;

  // @HasMany(() => FamilyMembersModel, { foreignKey: 'father_id', as: 'children' })
  // declare children?: FamilyMembersModel[];

  // @HasMany(() => CoupleModel, 'family_member_id')
  // declare couples?: CoupleModel[];

  @BelongsToMany(() => UserModel, {
    through: () => CoupleModel,
    foreignKey: 'family_member_id',
    otherKey: 'user_id',
    as: 'wife'
  })
  wife!: UserModel[];
}


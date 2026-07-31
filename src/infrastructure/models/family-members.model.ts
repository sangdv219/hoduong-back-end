import { BaseModel } from '@shared/model/base.model';
import {
  AllowNull,
  BelongsTo,
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
  parent_branch_id: string | null;
  father_id: string | null;
  mother_id: string | null;
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
  declare user_id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare parent_branch_id: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare father_id: string | null;
  
  @AllowNull(true)
  @Column(DataType.UUID)
  declare mother_id: string | null;
  
  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare child_order: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare generation_order: number;

  @BelongsTo(() => UserModel, 'user_id')
  declare user: UserModel;

  @BelongsTo(() => FamilyMembersModel, { foreignKey: 'father_id', as: 'parent' })
  declare parent?: FamilyMembersModel;

  @HasMany(() => FamilyMembersModel, { foreignKey: 'father_id', as: 'children' })
  declare children?: FamilyMembersModel[];

  @HasMany(() => CoupleModel, 'node_id')
  declare couples?: CoupleModel[];
}


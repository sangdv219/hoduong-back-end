import { CouplesModel, EMarriageStatus, ICouples } from '@/infrastructure/models/couples.model';
import { IPaginatedResult } from '@/shared/interface/common';
import { GenderEnum, IUser, Status } from '@infrastructure/models/user.model';
import { Expose, Type } from 'class-transformer';

export interface IFamilyMembers{
  id: string;
  user_id: string; 
  parent_couple_id: string;
  child_order: number; 
  generation_order: number;
}

export interface FamilyTreeNode {
  id: string;
  user_id: string;
  fullname: string;
  generation_order: number;
  child_order: number;
  couples: FamilyTreeCoupleNode[];
}

export interface FamilyTreeCoupleNode {
  couple_id: string;
  marriage_status: EMarriageStatus;
  partner: {
    id: string;
    user_id: string;
    fullname: string;
  } | null;
  children: FamilyTreeNode[];
}

export class FamilyMembersBaseDto implements IFamilyMembers {
  @Expose()
  id!: string;

  @Expose()
  user_id!: string; 

  @Expose()
  generation_order!: number;

  @Expose()
  parent_couple_id!: string;
  
  @Expose()
  relation_type!: string;

  @Expose()
  child_order!: number;

  @Expose()
  user!: IUser;

  @Expose()
  parent_couple!: ICouples;

  @Expose()
  partners!: IUser;

  @Expose()
  created_at!: Date;
}

export class GetAllFamilyMembersResponseDto implements IPaginatedResult<IFamilyMembers> {
  @Expose()
  @Type(() => FamilyMembersBaseDto)
  items!: IFamilyMembers[];

  @Expose()
  total!: number;
  
  @Expose()
  totalRecord!: number;
}

export class FamilyMembersDetail extends FamilyMembersBaseDto {
  @Expose()
  updated_by!: string;

  @Expose()
  updated_at!: Date;
}
export class GetByIdFamilyMembersResponseDto {
  @Expose()
  @Type(() => FamilyMembersDetail)
  items!: FamilyMembersDetail;
}
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
  child_order!: number;

  @Expose()
  user!: IUser;

  @Expose()
  father!: IUser;

  @Expose()
  wife!: IUser;

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
  birth_date!: Date; // 🟢 Bỏ 'declare'

  @Expose()
  year_of_death!: Date; // Khớp với yearOfDeath?

  @Expose()
  burial_place!: string; // Khớp với burialPlace?

  @Expose()
  address!: string; // Khớp với address?

  @Expose()
  biography!: string; // Khớp với biography?

  @Expose()
  avatar_file_id!: number; 
  
  @Expose()
  is_root!: boolean;

  @Expose()
  updated_by!: string;

  @Expose()
  updated_at!: Date;

  @Expose()
  deleted_by!: string;

  @Expose()
  deleted_at!: Date;

  @Expose()
  failed_login_attempts!: number;

  @Expose()
  last_failed_login_at!: Date;

  @Expose()
  locked_until!: Date; // 
}
export class GetByIdFamilyMembersResponseDto {
  @Expose()
  @Type(() => FamilyMembersDetail)
  items!: FamilyMembersDetail;
}
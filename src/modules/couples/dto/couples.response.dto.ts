import { MarriageDateStatus, MarriageStatus } from '@/infrastructure/models/couples.model';
import { GenderEnum, Status } from '@infrastructure/models/user.model';
import { Expose, Type } from 'class-transformer';

export interface ICouples{
  id: string;
  user_id: string;
  family_member_id: string;
  couple_order: number;
  marriage_date: Date;
  marriage_status: MarriageStatus;
  marriage_date_type: MarriageDateStatus;
  divorce_date: Date
}

interface IPaginatedResult<T> {
  items: T[];
  total: number;
  // page: number;
  // limit: number;
  // totalRecord: number;
}

export class CouplesBaseDto implements ICouples {
  @Expose()
  id!: string;

  @Expose()
  user_id!: string; 

  @Expose()
  family_member_id!: string;

  @Expose()
  couple_order!: number;

  @Expose()
  marriage_date!: Date; 

  @Expose()
  marriage_status!: MarriageStatus;

  @Expose()
  marriage_date_type!: MarriageDateStatus;

  @Expose()
  divorce_date!: Date
}

export class GetAllCouplesResponseDto implements IPaginatedResult<ICouples> {
  @Expose()
  @Type(() => CouplesBaseDto)
  items!: ICouples[];

  @Expose()
  total!: number;
  
  @Expose()
  totalRecord!: number;
}

export class CouplesDetail extends CouplesBaseDto {
  @Expose()
  updated_by!: string;

  @Expose()
  updated_at!: Date;
}
export class GetByIdCouplesResponseDto {
  @Expose()
  @Type(() => CouplesDetail)
  items!: CouplesDetail;
}
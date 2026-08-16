import { IPaginatedResult } from '@/shared/interface/common';
import { EMarriageStatus, ICouples, TMarriageStatus } from '@infrastructure/models/couples.model';
import { Expose, Type } from 'class-transformer';

export class CouplesBaseDto implements ICouples {
  @Expose()
  id!: string;

  @Expose()
  partner_1_id!: string; 

  @Expose()
  partner_2_id!: string;

  @Expose()
  couple_order!: number;

  @Expose()
  marriage_date!: Date; 

  @Expose()
  marriage_status!: EMarriageStatus;

  @Expose()
  divorce_date!: Date

  @Expose()
  partner_1!: any

  @Expose()
  partner_2!: any
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
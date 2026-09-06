import { CouplesModel, EMarriageStatus, TMarriageStatus } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/common';
import { IBaseSearchParams, ICreated, IUpdated } from '@shared/interface/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min
} from 'class-validator';

interface ICreatedCouplesRequest extends ICreated {
  partner_1_id: string;
  partner_2_id: string;
  couple_order: number;
  marriage_status: TMarriageStatus | null;
  marriage_date: Date;
  divorce_date: Date | null
}

export interface ICouplesPaginationDTO extends IBaseSearchParams{
  partner_1_id: string;
  partner_2_id: string;
  couple_order: number;
  marriage_status: TMarriageStatus;
  marriage_date: Date;
  divorce_date: Date
}

export interface IUpdateCoupleDto extends IUpdated {
  partner_1_id?: string;
  partner_2_id?: string;
  marriage_status?: TMarriageStatus;
  marriage_date?: Date;
  divorce_date?: Date;
}

export interface IMarriageStatus {
  couple: CouplesModel;
  dto?: IUpdateCoupleDto;
  partner_1?: any;
  partner_2?: any;
}

export class CreatedCouplesRequestDto implements ICreatedCouplesRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'partner_1_id', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  partner_1_id!: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'partner_2_id', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  partner_2_id!: string;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'couple_order', example: 1 })
  couple_order!: number;
  
  @IsNotEmpty()
  @IsIn(['SINGLE', 'UNMARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
  @ApiPropertyOptional({
    enum: ['SINGLE', 'UNMARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  marriage_status!: TMarriageStatus;

  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ description: 'marriage_date', example: "2026-08-09 20:00:05.461+07" })
  marriage_date!: Date;
  
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ description: 'divorce_date', example: "2026-08-09 20:00:05.461+07" })
  divorce_date!: Date;
}


export class UpdatedCouplesRequestDto extends PartialType(CreatedCouplesRequestDto) {}

export class CouplesPaginationDTO extends PaginationQueryDto implements ICouplesPaginationDTO{
  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  partner_1_id!: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  partner_2_id!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2], { message: 'Phải lớn hơn 0' })
  @ApiPropertyOptional({
    enum: [1, 2],
    description: 'Thứ tự người vợ',
    example: null,
  })
  couple_order!: number;
  
  @IsOptional()
  @IsIn(['SINGLE', 'UNMARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
    @ApiPropertyOptional({
      enum: ['SINGLE', 'UNMARRIED', 'MARRIED', 'DIVORCED', 'WIDOWED'],
      example: null,
  })
  marriage_status!: TMarriageStatus;

  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    example: null,
  })
  marriage_date!: Date;

  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    example: null,
  })
  divorce_date!: Date ;
}

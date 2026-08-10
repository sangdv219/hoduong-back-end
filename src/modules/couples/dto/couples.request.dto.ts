import { CouplesModel, EMarriageStatus } from '@/infrastructure/models/couples.model';
import { FamilyMembersModel } from '@/infrastructure/models/family-members.model';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/common';
import { IPaginationDTO } from '@shared/interface/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min
} from 'class-validator';

interface ICreatedCouplesRequest {
  partner_1_id: string;
  partner_2_id: string;
  couple_order: number;
  marriage_date: Date;
  marriage_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  divorce_date: Date
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface ICouplesPaginationDTO extends IPaginationDTO{
  partner_1_id: string;
  partner_2_id: string;
  couple_order?: number;
  marriage_date?: Date;
  marriage_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  divorce_date?: Date
}

export interface IUpdateCoupleDto {
  marriage_status?: EMarriageStatus;
  marriage_date?: Date;
  divorce_date?: Date;
}

export interface IMarriageStatus {
  couple: CouplesModel;
  dto?: IUpdateCoupleDto;
  partner1?: FamilyMembersModel;
  partner2?: FamilyMembersModel;
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
  @IsIn(['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
  @ApiPropertyOptional({
    enum: ['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  marriage_status!: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' ;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ description: 'marriage_date', example: "2026-08-09 20:00:05.461+07" })
  marriage_date!: Date;

  @IsOptional()
  @Type(() => Date)
  divorce_date!: Date;
}


export class UpdatedCouplesRequestDto extends PartialType(OmitType(CreatedCouplesRequestDto, ['partner_1_id', "partner_2_id", "couple_order"] as const)) {
  @IsOptional()
  @IsIn(['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
  @ApiPropertyOptional({
    enum: ['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  marriage_status?: EMarriageStatus;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ description: 'marriage_date', example: "2026-08-09 20:00:05.461+07" })
  marriage_date?: Date;

  @IsOptional()
  @Type(() => Date)
  divorce_date?: Date;
}

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
  @IsIn(['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
  @ApiPropertyOptional({
    enum: ['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  marriage_status!: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  divorce_date?: Date;
}

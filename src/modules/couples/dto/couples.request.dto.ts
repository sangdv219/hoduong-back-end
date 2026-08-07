import { PaginationQueryDto } from '@shared/dto/common';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { IPaginationDTO } from '@shared/interface/common';
import { MarriageDateStatus, MarriageStatus } from '@infrastructure/models/couples.model';

interface ICreatedCouplesRequest {
  user_id: string;
  family_member_id: string;
  couple_order: number;
  marriage_date: Date;
  marriage_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  marriage_date_type: 'SOLAR' | 'LUNAR';
  divorce_date: Date
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface ICouplesPaginationDTO extends IPaginationDTO{
  user_id?: string;
  family_member_id?: string;
  couple_order?: number;
  marriage_date?: Date;
  marriage_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  marriage_date_type?: 'SOLAR' | 'LUNAR';
  divorce_date?: Date
}

export class CreatedCouplesRequestDto implements ICreatedCouplesRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'user_id', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'family_member_id', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  family_member_id!: string;
  
  
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'couple_order', example: 1 })
  couple_order!: number;
  
  @IsNotEmpty()
  @Type(() => Date)
  marriage_date!: Date;

  
  @IsIn(['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'], 
    { message: 'SINGLE, MARRIED, DIVORCED, WIDOWED'})
  @ApiPropertyOptional({
    enum: ['SINGLE','MARRIED', 'DIVORCED', 'WIDOWED'],
  })
  marriage_status!: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

  @IsIn(['SOLAR','LUNAR'], 
    { message: 'SOLAR, LUNAR'})
  @ApiPropertyOptional({
    enum: ['SOLAR','LUNAR'],
  })
  marriage_date_type!: 'SOLAR' | 'LUNAR';

  @IsOptional()
  @Type(() => Date)
  divorce_date!: Date;
}

export class UpdatedCouplesRequestDto extends CreatedCouplesRequestDto { }

export class CouplesPaginationDTO extends PaginationQueryDto implements ICouplesPaginationDTO{
  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  user_id?: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  family_member_id?: string;

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
  @IsIn(['SOLAR','LUNAR'], 
    { message: 'SOLAR, LUNAR'})
  @ApiPropertyOptional({
    enum: ['SOLAR','LUNAR'],
  })
  marriage_date_type!: 'SOLAR' | 'LUNAR';

  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  divorce_date?: Date;
}

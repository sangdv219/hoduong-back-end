import { PaginationQueryDto } from '@/shared/dto/common';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

interface CreatedUserAdminRequest {
  fullname: string;
  other_name: string;
  email: string;
  parentUserId: string;
  roleId: string;
  password?: string;
  gender: string;
  phone: string;
  is_root: boolean;
  is_active: boolean;
  avatar_file_id?: number;
  status?: number;
  biography?: string;
  address?: string;
  burial_place?: string;
  year_of_death?: Date;
  birth_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

export class CreatedUserAdminRequestDto implements CreatedUserAdminRequest {
  @IsNotEmpty({ message: 'Fullname is required' })
  @IsString({ message: 'Fullname must be a string' })
  @ApiProperty({ description: 'Full name', example: 'Nguyen Van A' })
  fullname!: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'email', example: 'sangdv219@gmail.com' })
  @IsEmail()
  email!: string;

  @IsOptional()
  @ApiProperty({ description: 'parentUserId', example: null })
  parentUserId!: string;
  
  @IsNotEmpty()
  @ApiProperty({ description: 'roleId', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  roleId!: string;

  @ApiProperty({ description: 'password', minLength: 6, example: '123456' })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @ApiProperty({ description: 'gender', example: 'Nam' })
  @IsString({ message: 'Gender must be a string' })
  gender!: string;

  @IsOptional()
  @ApiProperty({ description: 'age', example: 22 })
  @IsNumber({}, { message: 'Age must be a number' })
  age!: number;

  @ApiProperty({ description: 'phone', example: '0919 528 956' })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone!: string;

  @IsOptional()
  @ApiProperty({ description: 'is_root', example: true })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'is_root must be a boolean (true/false)' })
  is_root: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({ description: 'is_active', example: true })
  @IsBoolean({ message: 'is_active must be a boolean (true/false)' })
  is_active: boolean = true;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tên gọi khác', example: 'A Bảy', required: false })
  other_name!: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Năm sinh', example: 1990, required: false })
  birth_date!: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Năm mất', example: 2025, required: false })
  year_of_death!: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Nơi an táng', example: 'Nghĩa trang TP.HCM', required: false })
  burial_place!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Địa chỉ', example: '123 Đường ABC, Quận 1', required: false })
  address!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tiểu sử', example: 'Mô tả tóm tắt về lý lịch...', required: false })
  biography?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Trạng thái tài khoản/hồ sơ', example: 1, required: false })
  status: number = 1;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'ID file ảnh đại diện', example: 102, required: false })
  avatar_file_id?: number;
}

export class UpdatedUserAdminRequestDto extends PartialType(OmitType(CreatedUserAdminRequestDto, ['password'] as const)) {
  @IsOptional()
  @ApiProperty({ description: 'deleted_at', example: new Date() })
  @IsDate({ message: 'deleted_at must be a date' })
  deleted_at!: Date;

  @IsOptional()
  @ApiProperty({ description: 'deleted_by', example: 'system' })
  @IsString({ message: 'deleted_by must be a string' })
  deleted_by!: string;
 }


export class UserPaginationDTO extends PaginationQueryDto{
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'Is active' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'is_active must be a boolean (true/false)' })
  is_active: boolean = true;

  // @IsOptional()
  // @ApiPropertyOptional({ example: '026e2174-aff3-4461-9f43-0e16c9a88f17', description: 'Role' })
  // @IsString({ message: 'is_active must be a boolean (true/false)' })
  // role_id: string = '026e2174-aff3-4461-9f43-0e16c9a88f17';

  @IsOptional()
  @IsEnum(['Nam' , 'Nữ'])
  @ApiPropertyOptional({
    enum: ['Nam' , 'Nữ'],
  })
  gender!: 'Nam' | 'Nữ';
}

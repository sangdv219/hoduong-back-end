import { GenderEnum, Status } from '@/infrastructure/models/user.model';
import { PaginationQueryDto } from '@/shared/dto/common';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  gender: number;
  phone: string;
  is_root: boolean;
  avatar_file_id?: number;
  life_status?: 0 | 1;
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
  @IsNotEmpty()
  @ApiProperty({ description: 'email', example: 'sangdv219@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'password', minLength: 6, example: '123456' })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsNotEmpty({ message: 'Fullname is required' })
  @IsString({ message: 'Fullname must be a string' })
  @ApiProperty({ description: 'Full name', example: 'Nguyen Van A' })
  fullname!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tên gọi khác', example: 'A Bảy', required: false })
  other_name!: string;

  @IsOptional()
  @ApiProperty({ description: 'parentUserId', example: null })
  parentUserId!: string;
  
  @IsNotEmpty()
  @ApiProperty({ description: 'roleId', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  roleId!: string;

  @IsOptional()
  @ApiProperty({ description: 'gender', example: 0 })
  gender!: number;

  @IsOptional()
  @ApiProperty({ description: 'age', example: 22 })
  @IsNumber({}, { message: 'Age must be a number' })
  age!: number;
  
  @IsOptional()
  @ApiProperty({ description: 'phone', example: '0919 528 956' })
  phone!: string;

  @IsOptional()
  @ApiProperty({ description: 'is_root', example: true })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'is_root must be a boolean (true/false)' })
  is_root: boolean = false;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ description: 'Năm sinh', example: '2001-07-15T17:00:00.000Z', required: false })
  birth_date!: Date;
  
  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Tình trạng sống/chết', example: 1, required: false })
  life_status!: 0 | 1;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ description: 'Năm mất', example: '2100-07-15T17:00:00.000Z', required: false })
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
  @IsInt()
  @ApiProperty({ description: 'ID file ảnh đại diện', example: 102, required: false })
  avatar_file_id?: number;
}

export class UpdatedUserAdminRequestDto extends PartialType(OmitType(CreatedUserAdminRequestDto, ['password'] as const)) {
  @IsOptional()
  @ApiProperty({ description: 'deleted_at', example: new Date() })
  @Type(() => Date)
  @IsDate({ message: 'deleted_at must be a date' })
  deleted_at!: Date;

  @IsOptional()
  @ApiProperty({ description: 'deleted_by', example: 'system' })
  @IsString({ message: 'deleted_by must be a string' })
  deleted_by!: string;

  @IsOptional()
  @ApiProperty({ description: 'status', example: 'active' })
  @IsString({ message: 'active | inactive | pending | suspended | archived' })
  status!: Status;
 }


export class UserPaginationDTO extends PaginationQueryDto{
  // @IsOptional()
  // @ApiPropertyOptional()
  // @IsEnum({ message: 'active | inactive | pending | suspended | archived' })
  // status!: Status;
  
  @IsOptional()
  @Type(() => Number)
  @IsEnum([0, 1], { message: 'Giới tính phải là 0 hoặc 1' })
  @ApiPropertyOptional({
    enum: [0, 1],
    description: '0: Nam, 1: Nữ',
    example: 0,
  })
  gender?: 0 | 1;
  // @IsOptional()
  // @ApiPropertyOptional({ example: '026e2174-aff3-4461-9f43-0e16c9a88f17', description: 'Role' })
  // @IsString({ message: 'status must be a boolean (true/false)' })
  // role_id: string = '026e2174-aff3-4461-9f43-0e16c9a88f17';

  @IsOptional()
  @IsEnum(['active' , 'inactive' , 'pending' , 'suspended' , 'archived'], 
    { message: 'PENDING, ACTIVE, INACTIVE, SUSPENDED, ARCHIVED'})
  @ApiPropertyOptional({
    enum: ['active' , 'inactive' , 'pending' , 'suspended' , 'archived'],
  })
  status!: 'active | inactive | pending | suspended | archived';

  @IsOptional()
  @Type(() => Number)
  @IsEnum([0, 1], { message: 'Tình trạng phải là 0 hoặc 1' })
  @ApiPropertyOptional({
    enum: [0, 1],
    description: '0: Đã mất 1: Sống',
    example: 0,
  })
  life_status!: number;
}

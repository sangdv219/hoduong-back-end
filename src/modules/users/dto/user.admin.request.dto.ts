import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

interface CreatedUserAdminRequest {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  is_root: boolean;
  is_active: boolean;
  avatar: string;
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
  fullname: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'email', example: 'sangdv219@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password', minLength: 6, example: '123456' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @ApiProperty({ description: 'gender', example: 'Nam' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;

  @IsOptional()
  @ApiProperty({ description: 'age', example: 22 })
  @IsNumber({}, { message: 'Age must be a number' })
  age: number;

  @ApiProperty({ description: 'phone', example: '0919 528 956' })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

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
  @ApiProperty({ description: 'avatar', example: 'abc' })
  @IsString({ message: 'avatar must be a string' })
  avatar: string;
}

export class UpdatedUserAdminRequestDto extends PartialType(OmitType(CreatedUserAdminRequestDto, ['password'] as const)) { }

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateMemberRequestDto {
  @IsNotEmpty({ message: 'Fullname is required' })
  @IsString()
  @ApiProperty({ description: 'Full name', example: 'Nguyen Van A' })
  fullname: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email', example: 'member@example.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ description: 'Password', minLength: 6, example: '123456' })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @ApiProperty({ description: 'Phone', example: '0919528956' })
  phone: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Gender', example: 'Nam' })
  gender?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Age', example: 25 })
  age?: number;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent user ID to attach this member in the family tree' })
  parentUserId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Role ID to assign; defaults to USER role' })
  roleId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Active status', example: true, default: true })
  is_active?: boolean = true;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Avatar URL or path' })
  avatar?: string;
}

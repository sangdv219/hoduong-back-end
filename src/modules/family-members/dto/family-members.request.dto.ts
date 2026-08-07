import { PaginationQueryDto } from '@/shared/dto/common';
import { IPaginationDTO } from '@/shared/interface/common';
import { Status } from '@infrastructure/models/user.model';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export interface ICreatedFamilyMembersRequest {
  user_id: string;
  parent_couple_id: string | null;
}

export interface IFamilyMembersPaginationDTO extends IPaginationDTO{
  user_id?: string;
}

export class NodeUserVModel {
  id?: string;
  fullname?: string;
  otherName?: string;
  gender?: number;
  yearOfBirth?: Date;
  yearOfDeath?: Date;
  burialPlace?: string;
  address?: string;
  biography?: string;
  life_status?: number;
  email?: string;
  status?: Status;
  createdAt?: Date;
  updatedBy?: string;
}

export class CoupleGetVModel {
  id?: string;
  couple_order?: number;
  userId?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  status?: boolean | null;
  nodeId?: string | null;
  user?: NodeUserVModel | null;
}

export class FamilyMembersGetVModel {
  nodeId?: string;
  userId?: string | null;
  parent_couple_id?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  status?: boolean;
  child_order?: number;
  father?: NodeUserVModel;
  mother?: NodeUserVModel;
  user?: NodeUserVModel;
  couples?: CoupleGetVModel[];
}

export class NodeTreeVModel {
  id?: string;
  userId?: string | null;
  parent_couple_id?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  status?: boolean;
  child_order?: number;
  children?: NodeTreeVModel[] | null;
  user?: NodeUserVModel;
}

export class NodePaginationModel {
  records?: FamilyMembersGetVModel[] | null;
  totalRecords?: number | null;
}

export class NodeFilterQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number | null = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number | null = 10;

  @IsOptional()
  @IsString()
  keyword?: string | null;

  @IsOptional()
  @IsUUID()
  parent_couple_id?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean | null;

  @IsOptional()
  @IsString()
  createdBy?: string | null;

  @IsOptional()
  @IsString()
  updatedBy?: string | null = null;

  @IsOptional()
  @Type(() => Date)
  createdDate?: Date | null = null;

  @IsOptional()
  @Type(() => Date)
  updatedDate?: Date | null = null;
}

export class CreatedFamilyMembersRequestDto implements ICreatedFamilyMembersRequest{
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID linked to this node', example: "584a57c8-beb9-489d-b690-6b1d0eb6cc95" })
  user_id!: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: 'parent_couple_id', example: null })
  parent_couple_id: string | null = null;

  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // @ApiPropertyOptional({ description: 'Member order among siblings', default: null })
  // child_order?: number | undefined;
}
export class UpdatedFamilyMembersRequestDto extends CreatedFamilyMembersRequestDto{
  // @ApiPropertyOptional({
  //   description: 'Danh sách Role ID',
  //   type: [String],
  //   example: [
  //     '026e2174-aff3-4461-9f43-0e16c9a88f17',
  //     '8bd28c38-678d-4fe8-a8e2-579696599446',
  //   ],
  // })
  // @IsOptional()
  // @IsArray()
  // @IsUUID('4', { each: true }) // hoặc @IsString({ each: true })
  // roles?: string[];
}
export class ChangeStatusUserAdminRequestDto  {
  @ApiProperty({ description: 'status', example: 'pending' })
  @IsString({ message: 'active | inactive | pending | suspended | archived' })
  status!: Status;
}

export class UpdateNodeRequestDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'User ID linked to this node' })
  userId?: string | null = null;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent node ID' })
  parent_couple_id?: string | null = null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Member order among siblings' })
  child_order?: number | null = 1;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional()
  status?: boolean | null = true ;
}

export class FamilyMembersPaginationDTO extends PaginationQueryDto implements IFamilyMembersPaginationDTO {
  // @IsOptional()
  // @Type(() => Number)
  // @IsEnum([0, 1], { message: 'Giới tính phải là 0 hoặc 1' })
  // @ApiPropertyOptional({
  //   enum: [0, 1],
  //   description: '0: Nam, 1: Nữ',
  //   example: null,
  // })
  // gender?: 0 | 1;

  // @IsOptional()
  // @IsIn(['active' , 'inactive' , 'pending' , 'suspended' , 'archived'], 
  //   { message: 'PENDING, ACTIVE, INACTIVE, SUSPENDED, ARCHIVED'})
  // @ApiPropertyOptional({
  //   enum: ['active' , 'inactive' , 'pending' , 'suspended' , 'archived'],
  // })
  // status!: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';

  // @IsOptional()
  // @Type(() => Number)
  // @IsIn([0, 1], { message: 'Tình trạng phải là 0 hoặc 1' })
  // @ApiPropertyOptional({
  //   enum: [0, 1],
  //   description: '0: Đã mất 1: Sống',
  //   example: null,
  // })
  // life_status!: number;

  @IsOptional()
  @ApiPropertyOptional({ description: 'User', example: "f41cd31b-aa71-4ef6-b863-1fafa5475439" })
  user_id?: string;
}
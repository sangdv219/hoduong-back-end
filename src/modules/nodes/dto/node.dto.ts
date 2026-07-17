import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class NodeUserVModel {
  id: string;
  fullname: string;
  otherName?: string;
  gender?: string;
  yearOfBirth?: number;
  yearOfDeath?: number;
  burialPlace?: string;
  address?: string;
  biography?: string;
  status?: string;
  email?: string;
  is_active: boolean;
  createdAt?: Date;
  updatedBy?: string;
}

export class CoupleGetVModel {
  id: string;
  level: number;
  userId: string;
  createdAt?: Date;
  createdBy?: string;
  is_active: boolean;
  nodeId?: string;
  user?: NodeUserVModel;
}

export class NodeGetVModel {
  nodeId: string;
  userId: string;
  parentId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  is_active: boolean;
  members?: number;
  parent?: NodeUserVModel;
  user?: NodeUserVModel;
  couples?: CoupleGetVModel[];
}

export class NodeTreeVModel {
  id: string;
  userId: string;
  parentId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  is_active: boolean;
  members?: number;
  children: NodeTreeVModel[];
  user?: NodeUserVModel;
}

export class NodePaginationModel {
  records: NodeGetVModel[];
  totalRecords: number;
}

export class NodeFilterQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @Type(() => Date)
  createdDate?: Date;

  @IsOptional()
  @Type(() => Date)
  updatedDate?: Date;
}

export class CreateNodeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID linked to this node' })
  userId: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent node ID' })
  parentId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Spouse user ID to create couple relation' })
  coupleUserId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Member order among siblings', default: 1 })
  members?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({ default: true })
  is_active?: boolean = true;
}

export class UpdateNodeRequestDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'User ID linked to this node' })
  userId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent node ID' })
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Member order among siblings' })
  members?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional()
  is_active?: boolean;
}

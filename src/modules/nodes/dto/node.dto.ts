import { Status } from '@/infrastructure/models/user.model';
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

export class NodeGetVModel {
  nodeId?: string;
  userId?: string | null;
  fatherId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  status?: boolean;
  child_order?: number;
  parent?: NodeUserVModel;
  user?: NodeUserVModel;
  couples?: CoupleGetVModel[];
}

export class NodeTreeVModel {
  id?: string;
  userId?: string | null;
  fatherId?: string;
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
  records?: NodeGetVModel[] | null;
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
  fatherId?: string | null;

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

export class CreateNodeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID linked to this node' })
  userId?: string | null = null;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent node ID' })
  fatherId?: string | null = null;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Spouse user ID to create couple relation' })
  coupleUserId?: string | null = null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Member order among siblings', default: 1 })
  child_order?: number | null = 1;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({ default: true })
  status?: boolean | null = true;
}

export class UpdateNodeRequestDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'User ID linked to this node' })
  userId?: string | null = null;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent node ID' })
  fatherId?: string | null = null;

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

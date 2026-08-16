import { PaginationQueryDto } from '@/shared/dto/common';
import { IPaginatedResult, IBaseSearchParams } from '@/shared/interface/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';


export interface ICreatedRolesRequest{
  name: string;
  description: string;
}

export interface IRolesPaginationDTO extends IBaseSearchParams{
  name?: string;
  description?: string;
}

export interface IRolesDto{
  name?: string;
  description?: string;
}

export class CreatedRolesRequestDto implements ICreatedRolesRequest {
  @ApiProperty({ description: 'role', example: 'Admin' })
  @IsNotEmpty({ message: 'Name role is required' })
  declare name: string;

  @IsOptional()
  @ApiProperty({ description: 'description', example: 10 })
  declare description: string;
}

export class UpdatedRolesRequestDto extends PartialType(CreatedRolesRequestDto){}
export class RolesPaginationDTO extends PaginationQueryDto implements IRolesPaginationDTO{
  @IsOptional()
  @ApiPropertyOptional({ description: 'Role', example: "026e2174-aff3-4461-9f43-0e16c9a88f17" })
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Role', example: "026e2174-aff3-4461-9f43-0e16c9a88f17" })
  description?: string;
}
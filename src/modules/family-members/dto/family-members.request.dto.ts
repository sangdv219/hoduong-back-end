import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/common';
import { IBaseSearchParams, ICreated, IUpdated } from '@shared/interface/common';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID
} from 'class-validator';

interface ICreatedFamilyMembersRequest extends ICreated {
  user_id: string;
  parent_couple_id: string | null;
}

export interface IFamilyMembersPaginationDTO extends IBaseSearchParams{
  user_id: string | null;
  parent_couple_id: string | null;
}

export class CreatedFamilyMembersRequestDto implements ICreatedFamilyMembersRequest {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'user_id', example: '026e2174-aff3-4461-9f43-0e16c9a88f17' })
  user_id!: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'parent_couple_id',
    example: '',
  })
  parent_couple_id!: string | null;
}


export class UpdatedFamilyMembersRequestDto extends PartialType(CreatedFamilyMembersRequestDto) {}

export class FamilyMembersPaginationDTO extends PaginationQueryDto implements IFamilyMembersPaginationDTO{
  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  user_id!: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: '',
  })
  parent_couple_id!: string;
}
export class FamilyMembersAsTreeDTO{
  @IsUUID()
  @IsNotEmpty()
  @ApiPropertyOptional({ description: 'rootId', example: 'e82f4e52-42fa-412f-8d75-63a616e72de3' })
  rootId!: string
  
  // @IsOptional()
  // @ApiProperty({ description: 'maxDepth' })
  // maxDepth!: number
}
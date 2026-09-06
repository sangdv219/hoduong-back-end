import { EMarriageStatus } from '@/infrastructure/models/couples.model';
import { EMemberRelationType } from '@/infrastructure/models/family-members.model';
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


  @IsOptional()
  @ApiPropertyOptional({
    description: 'generation_order',
    example: '',
  })
  generation_order!: number | null;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'relation_type',
    example: '',
  })
  relation_type!: EMemberRelationType;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'child_order',
    example: '',
  })
  child_order!: number;
}

export class AttachSpouseRequestDto {
  @IsUUID() @IsNotEmpty()
  @ApiProperty({ description: 'user_id của người dâu/rể mới' })
  user_id!: string;

  @IsUUID() @IsNotEmpty()
  @ApiProperty({ description: 'id của family_member đã có trong cây mà người này kết hôn cùng' })
  married_to_member_id!: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: EMarriageStatus })
  marriage_status?: EMarriageStatus;
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
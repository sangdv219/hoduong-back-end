import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateMemberResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Nguyen Van A' })
  fullname!: string;

  @Expose()
  @ApiProperty({ example: 'nguyen-van-a' })
  ascii_name!: string;

  @Expose()
  @ApiProperty({ example: 'member@example.com' })
  email!: string;

  @Expose()
  @ApiProperty({ example: '0919528956' })
  phone!: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Nam' })
  gender?: string;

  @Expose()
  @ApiPropertyOptional({ example: 25 })
  age?: number;

  @Expose()
  @ApiProperty({ example: false })
  is_root!: boolean;

  @Expose()
  @ApiProperty({ example: true })
  is_active!: boolean;

  @Expose()
  @ApiPropertyOptional()
  avatar?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Assigned role ID' })
  roleId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Family tree node ID' })
  nodeId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Couple record ID' })
  coupleId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Generation level in family tree' })
  level?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Parent node ID in family tree' })
  parentNodeId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Parent user ID in family tree' })
  parentUserId?: string;

  @Expose()
  @ApiProperty()
  created_at!: Date;

  @Expose()
  @ApiProperty()
  updated_at!: Date;
}

import { IPaginationDTO } from '@/domain/repositories/base.repository';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto implements IPaginationDTO {
  @IsOptional()
  @ApiPropertyOptional({ example: 1, description: 'Page number (1–10)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1'})
  @Max(10, { message: 'Page cannot exceed 10'})
  page!: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 100, description: 'Limit per page (1–100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1'})
  @Max(100, { message: 'Limit cannot exceed 100'})
  limit!: number;

  @IsOptional()
  @ApiPropertyOptional({ example: '', description: 'Find' })
  @Type(() => String)
  @IsString()
  keyword!: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '', description: 'Order by field' })
  @Type(() => String)
  @IsString()
  orderBy!: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
  })
  sortOrder!: 'ASC' | 'DESC';

  @IsOptional()
  @ApiPropertyOptional({ example: 'created_at', description: 'Sort by field' })
  @Type(() => String)
  @IsString()
  sortBy!: string;
}



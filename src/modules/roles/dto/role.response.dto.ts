import { Expose, Type } from 'class-transformer';

export interface IRoles{
  id: string;
  name: string;
  description: string;
}

interface IPaginatedResult<T> {
  items: T[];
  total: number;
}

export class RolesBaseDto implements IRoles{
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;
}

export class GetAllRoleResponseDto {
  @Expose()
  @Type(() => RolesBaseDto)
  items!: RolesBaseDto[];

  @Expose()
  total!: number;

  @Expose()
  totalRecord!: number;
}

export class CreatedRoleReponseDto extends RolesBaseDto {
  @Expose()
  created_at!: Date;
  
  @Expose()
  updated_at!: Date;
}

export class GetAllRolesResponseDto implements IPaginatedResult<IRoles> {
  @Expose()
  @Type(() => RolesBaseDto)
  items!: IRoles[];

  @Expose()
  total!: number;
  
  @Expose()
  totalRecord!: number;
}

export class RolesDetail extends RolesBaseDto {
  @Expose()
  updated_by!: string;

  @Expose()
  updated_at!: Date;
}

export class GetByIdRoleResponseDto extends CreatedRoleReponseDto {
  @Expose()
  @Type(() => RolesDetail)
  items!: RolesDetail;
}


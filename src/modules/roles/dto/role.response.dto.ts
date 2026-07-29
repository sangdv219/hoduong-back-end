import { Expose } from 'class-transformer';

export class RoleBaseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;
}

export class GetAllRoleResponseDto {
  @Expose()
  items!: RoleBaseDto[];

  @Expose()
  totalRecord!: number;
}

export class CreatedRoleReponseDto extends RoleBaseDto {
  @Expose()
  created_at!: Date;
  
  @Expose()
  updated_at!: Date;
}


export class GetByIdRoleResponseDto extends CreatedRoleReponseDto {}


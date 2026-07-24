import { Expose } from 'class-transformer';

export class PermissionsBaseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;
}

export class GetAllPermissionsResponseDto {
  @Expose()
  items!: PermissionsBaseDto[];

  @Expose()
  totalRecord!: number;
}

export class CreatedPermissionsReponseDto extends PermissionsBaseDto {
  @Expose()
  created_at!: Date;
  
  @Expose()
  updated_at!: Date;
}


export class GetByIdPermissionsResponseDto extends CreatedPermissionsReponseDto {}


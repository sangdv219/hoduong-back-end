import { Expose } from 'class-transformer';

export class UserAdminBaseDto {
  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  gender: string;

  @Expose()
  age: number;

  @Expose()
  is_root: boolean = true;

  @Expose()
  status: boolean = true;
}

export class GetAllUserAdminResponseDto {
  @Expose()
  items: UserAdminBaseDto[];

  @Expose()
  totalRecord: number;
}

export class CreatedUserAdminReponseDto extends UserAdminBaseDto {
  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}

export class GetByIdUserAdminResponseDto extends CreatedUserAdminReponseDto {
  @Expose()
  user: UserAdminBaseDto[];
}

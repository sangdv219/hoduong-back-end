import { GenderEnum, Status } from '@/infrastructure/models/user.model';
import { Expose, Type } from 'class-transformer';

interface UserAdmin{
  id: string;
  fullname: string; 
  life_status: string; 
  other_name: string;
  email: string;
  phone: string; 
  gender: GenderEnum;
  age: number; 
  status: Status;
  roles: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserAdminBaseDto {
  @Expose()
  id!: string;

  @Expose()
  fullname!: string; 

  @Expose()
  life_status!: string;

  @Expose()
  other_name!: string;

  @Expose()
  email!: string; 

  @Expose()
  phone!: string; 

  @Expose()
  gender?: GenderEnum;

  @Expose()
  age!: number;

  @Expose()
  status!: Status;

  @Expose()
  roles!: string;
}

export class GetAllUserAdminResponseDto implements PaginatedResult<UserAdmin> {
  @Expose()
  @Type(() => UserAdminBaseDto)
  items!: UserAdmin[];

  @Expose()
  total!: number;
  
  @Expose()
  page!: number;
  
  @Expose()
  limit!: number;
  
  @Expose()
  totalPages!: number;
}

export class CreatedUserAdminReponseDto extends UserAdminBaseDto {
  @Expose()
  updated_at!: Date;
}

export class GetByIdUserAdminResponseDto extends CreatedUserAdminReponseDto {
  @Expose()
  user!: UserAdminBaseDto[];

  @Expose()
  birth_date!: Date; // 🟢 Bỏ 'declare'

  @Expose()
  year_of_death!: Date; // Khớp với yearOfDeath?

  @Expose()
  burial_place!: string; // Khớp với burialPlace?

  @Expose()
  address!: string; // Khớp với address?

  @Expose()
  biography!: string; // Khớp với biography?

  @Expose()
  avatar_file_id!: number; 
  
  @Expose()
  is_root!: boolean;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_by!: string;

  @Expose()
  deleted_by!: string;

  @Expose()
  deleted_at!: Date;

  @Expose()
  failed_login_attempts!: number;

  @Expose()
  last_failed_login_at!: Date;

  @Expose()
  locked_until!: Date; // 
}

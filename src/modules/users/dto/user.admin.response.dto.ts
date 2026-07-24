import { GenderEnum, Status } from '@/infrastructure/models/user.model';
import { Expose, Type } from 'class-transformer';

export class UserAdminBaseDto {
  @Expose()
  id!: string;

  @Expose()
  fullname!: string; // 🟢 Bỏ { name: 'fullname' } nếu key DB trùng tên

  @Expose()
  ascii_name!: string; // 🟢 Bỏ 'declare'

  @Expose()
  other_name!: string; // 🟢 Bỏ 'declare'

  @Expose()
  email!: string; // 🟢 Bỏ 'declare'

  @Expose()
  phone!: string; // 🟢 Bỏ 'declare'

  @Expose()
  gender?: GenderEnum;

  @Expose()
  age!: number; // 🟢 Bỏ 'declare'

  @Expose()
  status!: Status;
}

export class GetAllUserAdminResponseDto {
  @Expose()
  @Type(() => UserAdminBaseDto)
  items!: UserAdminBaseDto[];

  @Expose()
  totalRecord!: number;
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
  life_status!: 0 | 1; // Khớp với life_status?

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

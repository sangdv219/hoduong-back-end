import { GenderEnum, Status } from '@infrastructure/models/user.model';
import { Expose, Type } from 'class-transformer';

export interface IUserAdmin{
  id: string;
  fullname: string; 
  life_status: string; 
  other_name: string;
  email: string;
  phone: string; 
  gender: GenderEnum;
  age: number; 
  status: Status;
  roles: any[]
}

interface IPaginatedResult<T> {
  items: T[];
  total: number;
  // page: number;
  // limit: number;
  // totalRecord: number;
}

export class UserAdminBaseDto implements IUserAdmin {
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
  gender!: GenderEnum;

  @Expose()
  age!: number;

  @Expose()
  status!: Status;

  @Expose()
  roles!: [];

  @Expose()
  created_at!: Date;   
}

export class GetAllUserAdminResponseDto implements IPaginatedResult<IUserAdmin> {
  @Expose()
  @Type(() => UserAdminBaseDto)
  items!: IUserAdmin[];

  @Expose()
  total!: number;
  
  // @Expose()
  // page!: number;
  
  // @Expose()
  // limit!: number;
  
  @Expose()
  totalRecord!: number;
}

export class UserAdminDetail extends UserAdminBaseDto {
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
  updated_by!: string;

  @Expose()
  updated_at!: Date;

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
export class GetByIdUserAdminResponseDto {
  @Expose()
  @Type(() => UserAdminDetail)
  items!: UserAdminDetail;
}
// import { UserRolesModel } from '@modules/associations/models/user-roles.model';
import { NodeModel } from '@/infrastructure/models/node.model';
import { CoupleModel } from '@/infrastructure/models/couple.model';
import { UserRolesModel } from '@modules/associations/models/user-roles.model';
import { BaseModel } from '@shared/model/base.model';
import { ClsServiceManager } from 'nestjs-cls';
import {
  AllowNull,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}
export enum GenderEnum {
  NAM = 0,
  NU = 1,
}
// PENDING: Mới đăng ký, chưa verify email/chờ Admin duyệt.
// ACTIVE: Đang hoạt động bình thường.
// INACTIVE: Người dùng tự tắt tài khoản / chưa kích hoạt xong.
// SUSPENDED: Bị Admin khóa / vi phạm tiêu chuẩn.
// ARCHIVED: Đã xóa mềm / Đưa vào lưu trữ.

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})

export class UserEntity extends BaseModel<UserEntity> {
  @PrimaryKey
  @Default(Sequelize.literal('gen_random_uuid()'))
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(500) })
  declare fullname: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(500) })
  declare ascii_name: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500) })
  declare other_name: string; // Khớp với otherName?

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare password_hash: string;

  @AllowNull(true)
  @Unique
  @Column({ type: DataType.STRING(500) })
  declare email: string;
  
  @AllowNull(false)
  @Default('')
  @Unique
  @Column({ type: DataType.STRING(100) })
  declare phone: string;

  @Column({
    type: DataType.SMALLINT, // Hoặc DataType.INTEGER
    allowNull: true,
    comment: '0: Nam, 1: Nữ',
  })
  gender?: GenderEnum;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare age: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare birth_date: Date; // Khớp với yearOfBirth?

  @AllowNull(true)
  @Column(DataType.DATE)
  declare year_of_death: Date; // Khớp với yearOfDeath?

  @AllowNull(true)
  @Column({ type: DataType.STRING(1000) })
  declare burial_place: string; // Khớp với burialPlace?

  @AllowNull(true)
  @Column({ type: DataType.STRING(1000) })
  declare address: string; // Khớp với address?

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare biography: string; // Khớp với biography?

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare life_status: 0 | 1; // Khớp với life_status?

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare avatar_file_id: number; 
  
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_root: boolean;

  @AllowNull(false)
  @Default('pending')
  @Column({
    type: DataType.ENUM(...Object.values(Status)),
  })
  declare status: Status;

  @AllowNull(true)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare created_at: Date;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  declare updated_by: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  declare deleted_by: string;

  @BeforeUpdate
  static setDeteledBy(instance: UserEntity) {
    const userId = ClsServiceManager.getClsService().get('userId');
    if (userId) {
      instance.deleted_by = userId;
    }
  }

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  declare deleted_at: Date;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.INTEGER)
  declare failed_login_attempts: number;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  declare last_failed_login_at: Date;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  declare locked_until: Date; // New field to track when the account is locked until

  @HasMany(() => UserRolesModel)
  declare userRoles: UserRolesModel[];

  @HasMany(() => NodeModel)
  declare nodes: NodeModel[];

  @HasMany(() => CoupleModel)
  declare couples: CoupleModel[];
}

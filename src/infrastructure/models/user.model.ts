import { NodeModel } from '@/infrastructure/models/node.model';
import { CoupleModel } from '@/infrastructure/models/couple.model';
import { UserRolesModel } from '@infrastructure/models/user_roles.model';
import { BaseModel } from '@shared/model/base.model';
import { ClsServiceManager } from 'nestjs-cls';
import {
  AllowNull,
  BeforeUpdate,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';
import { RolesModel } from './roles.model';

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
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4, // 🟢 Dùng DataType.UUIDV4 thay cho Sequelize.literal
  })
  declare id: string;

  // @AllowNull(false)
  @Column({ type: DataType.STRING(500) })
  fullname!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(500) })
  ascii_name!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500) })
  other_name!: string; // Khớp với otherName?

  @AllowNull(true)
  @Column(DataType.TEXT)
  password_hash!: string;

  @AllowNull(true)
  @Unique
  @Column({ type: DataType.STRING(500) })
  email!: string;
  
  @AllowNull(false)
  // @Default('')
  @Unique
  @Column({ type: DataType.STRING(100) })
  phone!: string;

  @Column({
    type: DataType.SMALLINT, // Hoặc DataType.INTEGER
    allowNull: true,
    comment: '0: Nam, 1: Nữ',
  })
  gender?: GenderEnum;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  age!: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  birth_date!: Date; // Khớp với yearOfBirth?

  @AllowNull(true)
  @Column(DataType.DATE)
  year_of_death!: Date; // Khớp với yearOfDeath?

  @AllowNull(true)
  @Column({ type: DataType.STRING(1000) })
  burial_place!: string; // Khớp với burialPlace?

  @AllowNull(true)
  @Column({ type: DataType.STRING(1000) })
  address!: string; // Khớp với address?

  @AllowNull(true)
  @Column(DataType.TEXT)
  biography! : string; // Khớp với biography?

  @AllowNull(true)
  @Column(DataType.INTEGER)
  life_status!: 0 | 1; // Khớp với life_status?

  @AllowNull(true)
  @Column(DataType.INTEGER)
  avatar_file_id!: number; 
  
  @AllowNull(false)
  // @Default(false)
  @Column(DataType.BOOLEAN)
  is_root!: boolean;

  @AllowNull(false)
  // @Default('pending')
  @Column({
    type: DataType.ENUM(...Object.values(Status)),
  })
  status!: Status;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  deleted_by!: string;

  @BeforeUpdate
  static setDeteledBy(instance: UserEntity) {
    const userId = ClsServiceManager.getClsService().get('userId');
    if (userId) {
      instance.deleted_by = userId;
    }
  }

  @AllowNull(true)
  @Column(DataType.DATE)
  deleted_at!: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  failed_login_attempts!: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  last_failed_login_at!: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  locked_until!: Date; // New field to track when the account is locked until

  // @HasMany(() => UserRolesModel)
  // userRoles!: UserRolesModel[];

  @HasMany(() => NodeModel)
  nodes!: NodeModel[];

  @HasMany(() => CoupleModel)
  couples!: CoupleModel[];

  @BelongsToMany(() => RolesModel, {
    through: () => UserRolesModel,
    foreignKey: 'user_id',
    otherKey: 'role_id',
  })
  roles!: RolesModel[];


}

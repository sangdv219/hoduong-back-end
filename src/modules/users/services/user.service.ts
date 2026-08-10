import { BaseService } from '@core/services/base.service';
import { RolesModel } from '@infrastructure/models/roles.model';
import { Status, UserModel } from '@infrastructure/models/user.model';
import { UserRolesRepository } from '@modules/associations/repositories/user-roles.repository';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { PasswordService } from '@modules/password/services/password.service';
import { PostgresRoleRepository } from '@modules/roles/infrastructure/repository/postgres-role.repository';
import { DEFAULT_MEMBER_ROLE_NAME, USER_ENTITY, USER_ERROR } from '@modules/users/constants/user.constant';
import { ChangeStatusUserAdminRequestDto, CreatedUserAdminRequestDto, IUserPaginationDTO, UpdatedUserAdminRequestDto, UserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { GetAllUserAdminResponseDto, GetByIdUserAdminResponseDto } from '@modules/users/dto/user.admin.response.dto';
import { UserRepository } from '@modules/users/repository/user.admin.repository';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { toAsciiName } from '@shared/utils/string.util';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserStatusStrategyFactory } from '@modules/users/strategies/userStatusStrategy';

@Injectable()
export class UserService extends BaseService<
  UserModel,
  CreatedUserAdminRequestDto,
  UpdatedUserAdminRequestDto,
  GetByIdUserAdminResponseDto,
  GetAllUserAdminResponseDto
  > {
  protected entityName: string;
  private users: string[] = [];
  protected readonly getAllDtoClass = GetAllUserAdminResponseDto;
  protected readonly getByIdDtoClass = GetByIdUserAdminResponseDto;
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    protected repository: UserRepository,
    protected userRolesRepository: UserRolesRepository,
    private readonly userRepository: UserRepository,
    public cacheManage: RedisService,
    private readonly passwordService: PasswordService,
    private readonly roleRepository: PostgresRoleRepository,
    private readonly statusStrategyFactory: UserStatusStrategyFactory, 
  ) {
    super(repository);
    this.searchableFields = ['fullname', 'other_name', 'email' ];
    this.entityName = USER_ENTITY.NAME;
  }

  protected async moduleInit() {
    this.users = ['Iphone', 'Galaxy'];
  }

  protected async bootstrapLogic(): Promise<void> {
    Logger.log(`🛑 repository--------->`, this.repository);
    Logger.log(this.repository);
  }

  protected async beforeAppShutDown(signal): Promise<void> {
    this.stopJob();
    Logger.log(`🛑 beforeApplicationShutdown: UserService cleanup before shutdown.`);
  }

  private async stopJob() {
    Logger.log('logic dừng cron job: ');
    Logger.log('* Ngắt kết nối queue worker: ');
  }

  protected async moduleDestroy() {
    this.users = [];
    Logger.log('🗑️onModuleDestroy -> users: ', this.users);
  }

  async update(
    id: string,
    dto: UpdatedUserAdminRequestDto,
  ): Promise<any> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException('khoong tim thasy');
    }
  
    const transaction = await this.sequelize.transaction();
  
    try {
      const { roles, ...res } = dto;
  
      Object.assign(user, dto);
      await user.update(res, { transaction });
  
      // 4. Đồng bộ Roles sử dụng Sequelize Association Mixin
      if (roles && Array.isArray(roles)) {
        await this.validateRoleIds(roles); 
        await user.$set('roles', roles, { transaction });
      }
  
      // Commit Transaction
      await transaction.commit();
      this.cleanCacheRedis()
      // 5. Xóa Redis Cache sau khi Commit thành công
      // await this.clearUserCache(id);
  
      // 6. (Nâng cao) Publish Event nếu hệ thống chạy Event-Driven
      // this.eventEmitter.emit('user.updated', new UserUpdatedEvent(id, dto));
  
      // 7. Trả về thông tin User mới nhất
    } catch (error) {
      // Rollback nếu có bất kỳ lỗi nào xảy ra
      await transaction.rollback();
      Logger.error(`[UserService][update] Error updating user ${id}:`, error);
      throw error;
    }
  }

  async changeUserStatus(id: string, dto: ChangeStatusUserAdminRequestDto): Promise<UserModel> {
    const user = await this.userRepository.findByPk(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    const currentStatus = user.get('status') as Status; 

    if (currentStatus === dto.status) {
      return user; 
    }

    const strategy = this.statusStrategyFactory.getStrategy(dto.status);
    strategy.validateTransition(currentStatus);
    // strategy.handleLogic();

    const transaction = await this.sequelize.transaction();
    try {
      // 3.1 Thực thi các logic đi kèm (Gửi mail, huỷ token...)
      await strategy.handleLogic(user, transaction);
      // 3.2 Cập nhật trạng thái trong DB
      user.set('status', dto.status);
      await user.save({ transaction });

      await transaction.commit();
      this.cleanCacheRedis(); // Xoá cache
      console.log("Đã thay đổi status thành công")
      return user;
    } catch (error) {
      console.log("Thay đổi status thất bại", error)
      await transaction.rollback();
      throw error;
    }
  }

  async restoreUser(id: string): Promise<any> {
    const user = await this.userRepository.findByOneByRaw({
      where: { id, status: Status.ARCHIVED },
      // paranoid: false,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const result = await this.userRepository.update(id, {
      status: Status.PENDING,
      deleted_at: null,
    });

    if (!result[0]) {
      return { success: false, message: 'User not found or restore failed' };
    }

    const restoredUser = result[1][0] as UserModel;
    const { password_hash, ...safeData } = restoredUser.get({ plain: true });

    return {
      success: true,
      data: safeData as Partial<UserModel>,
    };
  }

  async getRolePermissionByUserId(userId: string) {
    const rawQuery = await this.sequelize.query(
      `
        SELECT DISTINCT p.id, p.resource as resource, p.action as permission_action, r.name as role_name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON r.id = rp.role_id
        JOIN user_roles ur ON ur.role_id = r.id
        JOIN users u ON u.id = ur.user_id
        WHERE u.id = :userId;
      `,
      {
        replacements: { userId },
        raw: true,
        nest: true,
      },
    );

    return rawQuery;
  }

  async createUserWithEmailOnly(body: any): Promise<void> {
    const existsEmail = await this.userRepository.checkExistsField({
      email: { value: body.email, mode: 'equal' },
    });
    if (existsEmail) {
      throw new ConflictException('Email already exists');
    }
    await this.userRepository.create(body);
  }

  async ensureUniqueContact(email: string, phone: string): Promise<void> {
    if (await this.userRepository.existsByEmail(email)) {
      throw new ConflictException(USER_ERROR.EMAIL_EXISTS);
    }
    if (await this.userRepository.existsByPhone(phone)) {
      throw new ConflictException(USER_ERROR.PHONE_EXISTS);
    }
  }

  async resolveRoleId(): Promise<string> {
    const defaultRole = await this.roleRepository.findOneByField('name', DEFAULT_MEMBER_ROLE_NAME);
    if (!defaultRole?.id) {
      throw new NotFoundException(USER_ERROR.DEFAULT_ROLE_NOT_FOUND);
    }
    return defaultRole.id;
  }

  async createMember(
    dto: CreatedUserAdminRequestDto,
    transaction?: Transaction,
  ): Promise<any> {
    try {
      await this.ensureUniqueContact(dto.email, dto.phone);
      
      const passwordHash = await this.passwordService.hashPassword(dto.password);
      const userEntity = {
        fullname: dto.fullname,
        other_name: dto.other_name,
        ascii_name: toAsciiName(dto.fullname),
        email: dto.email,
        phone: dto.phone || null,
        password_hash: passwordHash,
        gender: dto.gender,
        age: dto.age,
        birth_date: dto.birth_date,
        year_of_death: dto.year_of_death,
        burial_place: dto.burial_place,
        biography: dto.biography,
        address: dto.address,
        life_status: dto.life_status,
        avatar_file_id: dto.avatar_file_id,
        is_root: false,
        status: Status.PENDING,
      };
  
      this.cleanCacheRedis();
      return this.userRepository.create(userEntity, { transaction });
    } catch (error:any) {
      throw new HttpException(
        'Đã có sẵn trong thùng rác, vui lòng khôi phục lại!',
        HttpStatus.CONFLICT,
      );
    }
  }

  async searchUser(params: IUserPaginationDTO):Promise<GetAllUserAdminResponseDto |any> {
    const { role_id, ...baseParams } = params;
    return super.search(baseParams, params, options => {

        const include = Array.isArray(options.include)
            ? options.include
            : options.include
                ? [options.include]
                : [];

        const roleInclude:any = {
            model: RolesModel,
            attributes: ['name'],
            through: {
                attributes: [],
            },
        };

        if (role_id) {
            roleInclude.where = {
                id: role_id,
            };

            roleInclude.required = true;
        }

        options.include = [
            ...include,
            roleInclude,
        ];

        return options;
    });
  }

  async getUserById(id: string): Promise<any>{
    return super.getById(id, options => {
      const include = Array.isArray(options.include) ? options.include : options.include  ? [options.include] : [];
      const roleInclude:any = {
          model: RolesModel,
          attributes: ['id','name'],
          through: {
              attributes: [],
          },
      };
      options.include = [
          ...include,
          roleInclude,
      ];
      return options;
    })
  }

  private async validateRoleIds(roleIds: string[]): Promise<void> {
    if (roleIds.length === 0) return;
    const existingRolesCount = await this.roleRepository.count({
      where: { id: roleIds },
    });
    if (existingRolesCount !== roleIds.length) {
      throw new HttpException('Một hoặc nhiều Role ID không tồn tại!', HttpStatus.BAD_REQUEST);
    }
  }
}

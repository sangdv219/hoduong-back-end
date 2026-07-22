import { UserEntity } from '@/infrastructure/models/user.model';
import { BaseService } from '@core/services/base.service';
import { PostgresUserRolesRepository } from '@modules/associations/repositories/user-roles.repository';
import { PasswordService } from '@modules/password/services/password.service';
import { PostgresRoleRepository } from '@modules/roles/infrastructure/repository/postgres-role.repository';
import { USER_ENTITY, USER_ERROR, DEFAULT_MEMBER_ROLE_NAME } from '@modules/users/constants/user.constant';
import { CreatedUserAdminRequestDto, UpdatedUserAdminRequestDto, UserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import { GetAllUserAdminResponseDto, GetByIdUserAdminResponseDto } from '@modules/users/dto/user.admin.response.dto';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { NodeService } from '@modules/nodes/services/node.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { toAsciiName } from '@shared/utils/string.util';
import { FindOptions, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IPaginationDTO } from '@/domain/repositories/base.repository';
import { buildRedisKeyQuery } from '@/redis/helpers/redis-key.helper';
import { RedisContext } from '@/redis/enums/redis-key.enum';
import { sensitiveFields } from '@/shared/config/sensitive-fields.config';

@Injectable()
export class UserService extends BaseService<
  UserEntity,
  CreatedUserAdminRequestDto,
  UpdatedUserAdminRequestDto,
  GetByIdUserAdminResponseDto,
  GetAllUserAdminResponseDto
> {
  protected entityName: string;
  private users: string[] = [];

  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    protected repository: PostgresUserRepository,
    protected userRolesRepository: PostgresUserRolesRepository,
    private readonly userRepository: PostgresUserRepository,
    public cacheManage: RedisService,
    private readonly passwordService: PasswordService,
    private readonly roleRepository: PostgresRoleRepository,
    private readonly nodeService: NodeService,
  ) {
    super(repository);
    this.searchableFields = ['fullname', 'other_name', 'email', 'phone', 'gender', 'age', 'birth_date'];
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

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findByPk(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found!`);

    await this.nodeService.detachMemberByUserId(id);
    user.deleted_at = new Date();
    await user.save();
  }

  async update(id: string, dto: UpdatedUserAdminRequestDto) {
    // this.cleanCacheRedis();
    const entity = await this.userRepository.findByPk(id);
    if (!entity) throw new NotFoundException(`User with id ${id} not found!`);
    Object.assign(entity, dto);
    // entity.set(dto); 
    // console.log('entity cux', entity)
    // await entity.save();
    await entity.update(dto);

    return entity;
  }

  async restoreUser(id: string): Promise<any> {
    const user = await this.userRepository.findByOneByRaw({
      where: { id, status: false },
      paranoid: false,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const result = await this.userRepository.update(id, {
      status: true,
      deleted_at: null,
    });

    if (!result[0]) {
      return { success: false, message: 'User not found or restore failed' };
    }

    const restoredUser = result[1][0] as UserEntity;
    const { password_hash, ...safeData } = restoredUser.get({ plain: true });

    return {
      success: true,
      data: safeData as Partial<UserEntity>,
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

  async resolveRoleId(roleId?: string): Promise<string> {
    if (roleId) {
      return roleId;
    }

    const defaultRole = await this.roleRepository.findOneByField('name', DEFAULT_MEMBER_ROLE_NAME);
    if (!defaultRole?.id) {
      throw new NotFoundException(USER_ERROR.DEFAULT_ROLE_NOT_FOUND);
    }
    return defaultRole.id;
  }

  async createMember(
    dto: CreatedUserAdminRequestDto,
    transaction?: Transaction,
  ): Promise<Record<string, unknown>> {
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
    };

    this.cleanCacheRedis();
    return this.userRepository.create(userEntity, { transaction });
  }

  async searchUser(params: UserPaginationDTO & Record<string, any>): Promise<any> {
    return this.search(params);
  }

  async getUserById(id: string): Promise<any>{
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.DETAIL, {}, id);

    const cached = await this.cacheManage.get(redisKey);

    const exclude = sensitiveFields[this.entityName] ?? [];
    const dataCache = cached && JSON.parse(cached);
    if (cached) return dataCache;
    
    const entity = await this.repository.findByPk(id, exclude);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    await this.cacheManage.set(redisKey, JSON.stringify(entity), 'EX', 30);
  }
}

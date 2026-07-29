import { GetAllPermissionsResponseDto, GetByIdPermissionsResponseDto } from '@modules/permissions/dto/permissions.response.dto';
import { BaseService } from '@core/services/base.service';
import { PERMISSION_ENTITY } from '@modules/permissions/constants/permissions.constant';
import { PermissionsModel } from '@modules/permissions/domain/models/permissions.model';
import { PostgresPermissionsRepository } from '@modules/permissions/infrastructure/repository/postgres-permissions.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { RedisService } from '@redis/redis.service';
import { Sequelize } from 'sequelize';
import { CreatedPermissionssRequestDto, UpdatedPermissionssRequestDto } from '@modules/permissions/dto/permissions.request.dto';
import { GetAllUserAdminResponseDto } from '@/modules/users/dto/user.admin.response.dto';

@Injectable()
export class PermissionsService extends
  BaseService<PermissionsModel,
    CreatedPermissionssRequestDto,
    UpdatedPermissionssRequestDto,
    GetByIdPermissionsResponseDto,
    GetAllPermissionsResponseDto> {
  protected entityName: string;
  private Permissionss: string[] = [];
  protected readonly getAllDtoClass = GetAllPermissionsResponseDto;
  protected readonly getByIdDtoClass = GetByIdPermissionsResponseDto;

  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    public cacheManage: RedisService,
    protected repository: PostgresPermissionsRepository,
    protected permissionsRepository: PostgresPermissionsRepository,
  ) {
    super(repository);
    this.entityName = PERMISSION_ENTITY.NAME;
  }

  protected async moduleInit() {
    // Logger.log('✅ Init Permissions cache...');
    this.Permissionss = ['Iphone', 'Galaxy'];
  }

  protected async bootstrapLogic(): Promise<void> {}

  protected async beforeAppShutDown(signal): Promise<void> {
    this.stopJob();
    Logger.log(`🛑 beforeApplicationShutdown: PermissionsService cleanup before shutdown.`);
  }

  private async stopJob() {
    Logger.log('logic dừng cron job: ');
    Logger.log('* Ngắt kết nối queue worker: ', PermissionsService.name);
  }

  protected async moduleDestroy() {
    this.Permissionss = [];
    Logger.log('onModuleDestroy -> Permissionss: ', this.Permissionss);
  }
}
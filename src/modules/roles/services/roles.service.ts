import { GetAllRoleResponseDto, GetByIdRoleResponseDto } from '@modules/roles/dto/role.response.dto';
import { BaseService } from '@core/services/base.service';
import { ROLES_ENTITY } from '@modules/roles/constants/roles.constant';
import { RolesModel } from '@/infrastructure/models/roles.model';
import { PostgresRoleRepository } from '@modules/roles/infrastructure/repository/postgres-role.repository';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@redis/redis.service';
import { CreatedRolesRequestDto, UpdatedRolesRequestDto } from '@modules/roles/dto/role.request.dto';
import { Sequelize } from 'sequelize-typescript';
import { BaseTransactionService } from '@/infrastructure/database/transaction.service';

@Injectable()
export class RolesService extends
  BaseService<RolesModel,
    CreatedRolesRequestDto,
    UpdatedRolesRequestDto,
    GetByIdRoleResponseDto,
    GetAllRoleResponseDto> {
  protected entityName: string;
  private Roles: string[] = [];
  protected readonly getAllDtoClass = GetAllRoleResponseDto;
  constructor(
    protected repository: PostgresRoleRepository,
    protected rolesRepository: PostgresRoleRepository,
    protected cacheManage: RedisService,
    protected baseTransactionService: BaseTransactionService,
    private readonly sequelize: Sequelize

  ) {
    super(repository);
    this.entityName = ROLES_ENTITY.NAME;
  }

  protected async moduleInit() {
    this.Roles = ['Iphone', 'Galaxy'];
    // Logger.log('baseTransactionService:', this.baseTransactionService);

  }

  protected async bootstrapLogic(): Promise<void> { }

  protected async beforeAppShutDown(signal): Promise<void> {
    this.stopJob();
    Logger.log(`🛑 beforeApplicationShutdown: RoleService cleanup before shutdown.`);
  }

  private async stopJob() {
    Logger.log('logic dừng cron job: ');
    Logger.log('* Ngắt kết nối queue worker: ', RolesService.name);
  }

  async getPermission(userId: string) {
    Logger.log('userId:', userId);
  }

  protected async moduleDestroy() {
    this.Roles = [];
    Logger.log('onModuleDestroy -> Roles: ', this.Roles);
  }

  // async create(dto) {
    // this.baseTransactionService.runInTransaction(async (t1) => {
    //   //B1 Insert role
    //   this.repository.upsert(
    //     this.sequelize,
    //     'roles',
    //     ['name'],
    //     {
    //       product_id: 'abc',
    //       quantity: 5,
    //       price: 10000,
    //     },
    //     ['total_price', 'updated_at'],
    //     { transaction: t1 }
    //   )
    // })
    // await this.repository.create(d)
  // }

}
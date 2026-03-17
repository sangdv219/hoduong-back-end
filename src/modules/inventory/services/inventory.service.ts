import { BaseService } from '@core/services/base.service';
import { InventoryModel } from '@/infrastructure/models/inventory.model';
import { PostgresProductRepository } from '@modules/products/repository/postgres-product.repository';
import { RedisService } from '@redis/redis.service';
import { ProductModel } from '@/infrastructure/models/product.model';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { INVENTORY_ENTITY } from '@modules/inventory/constants/inventory.constant';
import { CreatedInventoryRequestDto, UpdatedInventoryRequestDto } from '@modules/inventory/dto/inventory.request.dto';
import { GetAllInventoryResponseDto, GetByIdInventoryResponseDto } from '@modules/inventory/dto/inventory.response.dto';
import { PostgresInventoryRepository } from '@modules/inventory/infrastructure/repository/postgres-inventory.repository';
import { buildRedisKeyQuery } from '@redis/helpers/redis-key.helper';
import { RedisContext } from '@redis/enums/redis-key.enum';

@Injectable()
export class InventoryService extends
  BaseService<InventoryModel,
    CreatedInventoryRequestDto,
    UpdatedInventoryRequestDto,
    Partial<InventoryModel>,
    GetAllInventoryResponseDto> {
  protected entityName: string;
  private inventory: string[] = [];
  constructor(
    protected repository: PostgresInventoryRepository,
    protected postgresProductRepository: PostgresProductRepository,
    public cacheManage: RedisService,
  ) {
    super(repository);
    this.entityName = INVENTORY_ENTITY.NAME;
  }

  protected async moduleInit() {
    // Logger.log('✅ Init Inventory cache...');
    this.inventory = ['Iphone', 'Galaxy'];
  }

  protected async bootstrapLogic(): Promise<void> {
    // Logger.log(
    //   '👉 OnApplicationBootstrap: InventoryService bootstrap: preloading cache...',
    // );
    //Bắt đầu chạy cron job đồng bộ tồn kho.
    //* Gửi log "App ready" cho monitoring system.
  }

  protected async beforeAppShutDown(signal): Promise<void> {
    this.stopJob();
    Logger.log(
      `🛑 beforeApplicationShutdown: InventoryService cleanup before shutdown.`,
    );
  }

  private async stopJob() {
    Logger.log('logic dừng cron job: ');
    Logger.log('* Ngắt kết nối queue worker: ');
  }

  protected async moduleDestroy() {
    this.inventory = [];
    Logger.log('🗑️onModuleDestroy -> inventory: ', this.inventory);
  }

  async getByProductId(field: string, id: string) {
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.DETAIL, {}, id);

    const cached = await this.cacheManage.get(redisKey);

    const dataCache = cached && JSON.parse(cached);

    if (cached) return dataCache;

    const inventory = await this.repository.findByOneByRaw({
      where: { [`${field}`]: id },
      include: [{
        model: ProductModel,
        attributes: ['name', 'price', 'promotion_price', 'evaluate'],
      }],
      raw: true,
      nest: true,
    });

    if (!inventory) throw new TypeError('Inventory not found!');
    inventory['product'] = inventory.product;
    const dto = plainToInstance<GetByIdInventoryResponseDto, any>(GetByIdInventoryResponseDto, inventory, { excludeExtraneousValues: true });
    await this.cacheManage.set(redisKey, JSON.stringify(dto), 'EX', 300);
  }
}

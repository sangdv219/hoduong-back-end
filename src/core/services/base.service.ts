import { IBaseRepository } from '@domain/repositories/base.repository';
import { IUserPaginationDTO } from '@modules/users/dto/user.admin.request.dto';
import {
  BeforeApplicationShutdown,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { RedisContext } from '@redis/enums/redis-key.enum';
import { buildRedisKeyQuery } from '@redis/helpers/redis-key.helper';
import { RedisService } from '@redis/redis.service';
import { sensitiveFields } from '@shared/config/sensitive-fields.config';
import { IPaginationDTO } from '@shared/interface/common';
import { plainToInstance } from 'class-transformer';
import { Model } from 'sequelize';
 // BaseService không cần biết Thực thế có field gì.
export abstract class BaseService<
  TEntity,
  TCreateDto,
  TUpdateDto,
  GetByIdResponseDto,
  GetAllResponseDto
>
  implements
  OnModuleInit,
  OnApplicationBootstrap,
  BeforeApplicationShutdown,
  OnModuleDestroy {
  protected abstract entityName: string;
  protected abstract cacheManage: RedisService;
  protected abstract moduleInit(): Promise<void>;
  protected abstract bootstrapLogic(): Promise<void>;
  protected abstract beforeAppShutDown(signal?: string): Promise<void>;
  protected abstract moduleDestroy(): Promise<void>;
  private readonly logger = new Logger(BaseService.name);
  protected searchableFields: string[] = [];
  protected booleanFields: string[] = [];

  protected abstract readonly getAllDtoClass: new () => GetAllResponseDto;
  protected abstract readonly getByIdDtoClass: new () => GetByIdResponseDto;

  constructor(
    protected readonly repository: IBaseRepository<TEntity>,
    protected readonly mapper?: (dto: TCreateDto) => Partial<TEntity>,
  ) { 
    
  }

  async onModuleInit() {
    await this.moduleInit();
    this.logger.log(`${this.entityName} Service initialized`);
  }

  async loadPermissionsDefault() {}

  async onApplicationBootstrap() {
   
  }

  async beforeApplicationShutdown(signal?: string) {
    await this.beforeAppShutDown(signal);
  }

  async onModuleDestroy() {
    await this.moduleDestroy();
  }

  async getPagination(query:IPaginationDTO) {
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.LIST, query as unknown as Record<string, string>);

    const cached = await this.cacheManage.get(redisKey);

    const dataCache = cached && JSON.parse(cached);
    if (cached) return dataCache;

    const exclude = sensitiveFields[this.entityName] ?? [];

    const { items, total } = await this.repository.findWithPagination(query, exclude);

    const response = { items: items, totalRecord: total };

    await this.cacheManage.set(redisKey, JSON.stringify(response), 'EX', 30);

    return response as GetAllResponseDto;
  }

  async search(params: IUserPaginationDTO, query, callback){
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.LIST, query as unknown as Record<string, string>);

    const cached = await this.cacheManage.get(redisKey);

    const dataCache = cached && JSON.parse(cached);
    if (cached) return dataCache;

    let options={};
    if(callback){
        options = await callback(options);
    }
    const result = await this.repository.search( params, options );
    await this.cacheManage.set(redisKey, JSON.stringify(this.transformToDto( result )), 'EX', 30);

    return this.transformToDto( result );
  }

  async create(dto: TCreateDto) {
    this.cleanCacheRedis()
    const entity = this.mapper ? this.mapper(dto) : (dto as Partial<TEntity>)
    
    return await this.repository.create(entity);
  }
  
  async update(id: string, dto: TUpdateDto): Promise<any> {
    this.cleanCacheRedis()
    const entity = await this.repository.findByPk(id, [], false) as Model<any, any>
    if (!entity) return null;
    try {
      Object.assign(entity, dto)
      await entity.save()
      return entity;
    } catch (error) {
      this.logger.error('[base.service:97] message', error);
      
    }
  }
  
  async getById(id: string, callback): Promise<GetByIdResponseDto | any> {
    let options={};
    if(callback){
        options = await callback(options);
    }
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.DETAIL, {}, id);

    const cached = await this.cacheManage.get(redisKey);

    const dataCache = cached && JSON.parse(cached);
    if (cached) return dataCache;

    const exclude = sensitiveFields[this.entityName] ?? [];
    const result = await this.repository.findByPk(id, exclude, false, options );
    if (!result) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    return this.transformToDto( result );
    // const dto = plainToInstance<GetByIdResponseDto, any>(GetByIdResponseDto, entity, { excludeExtraneousValues: true });
    // await this.cacheManage.set(redisKey, JSON.stringify(entity), 'EX', 30);
  }

  async cleanCacheRedis() {
    try {
      const keyCacheListByBrand = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.LIST);
      await this.cacheManage.delCache(keyCacheListByBrand);
    } catch (error) {
      this.logger.error(`${error}`);
    }
  }

  async delete(id: string) {
    await this.cleanCacheRedis();
    // await this.getById(id);
    await this.repository.delete(id);
  }

  private transformToDto(res: any): any {
    if (!res) return res;
    // Hàm chuyển 1 Sequelize Model thành Plain Object an toàn
    const toPlain = (item: any) => {
      if (!item) return item;
      // Sequelize Model
      if (typeof item.get === 'function') {
        return item.get({ plain: true });
      }
      // Trường hợp chỉ có dataValues
      if (item.dataValues) {
        return item.dataValues;
      }
      return item;
    };

    // Trường hợp 1: res là Object phân trang (ví dụ { data: [...], totalRecord: 10 })
    if (typeof res === 'object' && !Array.isArray(res)) {
      const listKey = res.data ? 'data' : res.items ? 'items' : null;
  
      if (listKey && Array.isArray(res[listKey])) {
        const plainList = res[listKey].map(toPlain);
        const formattedResponse = {
          items: plainList,
          totalRecord: res.totalRecord || res.total || 0,
        };

        return plainToInstance(this.getAllDtoClass, formattedResponse, {
          excludeExtraneousValues: true,
        });
      }
    }
  
    // Trường hợp 2: res là Mảng danh sách các Model Instance ([User1, User2])
    if (Array.isArray(res)) {
      const plainList = res.map(toPlain);
      return plainToInstance(this.getAllDtoClass, plainList, {
        excludeExtraneousValues: true,
      });
    }
    // Trường hợp 3: res là 1 Model Instance đơn lẻ
    const plain = toPlain(res);
    return plainToInstance(
      this.getByIdDtoClass,
      {
        items: plain,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

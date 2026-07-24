import { IBaseRepository, IPaginationDTO } from '@domain/repositories/base.repository';
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
import { FindOptions, Model, Op } from 'sequelize';
import { plainToInstance } from 'class-transformer';

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

    const response = { data: items, totalRecord: total };

    await this.cacheManage.set(redisKey, JSON.stringify(response), 'EX', 30);

    return response as GetAllResponseDto;
  }

  async search(
    params: IPaginationDTO & Record<string, any>, // Chấp nhận các filter động đi kèm
    queryBuilder?: (options: FindOptions<TEntity>) => FindOptions<TEntity> | Promise<FindOptions<TEntity>>
  ): Promise<any> {
    const options: FindOptions<TEntity> = {};
    const andConditions: any[] = [];

    // 1. Xử lý tìm kiếm toàn văn theo từ khóa (Keyword Search)
    if (params.keyword && this.searchableFields.length > 0) {
      andConditions.push({
        [Op.or]: this.searchableFields.map(field => ({
          [field]: { [Op.iLike]: `%${params.keyword}%` }
        }))
      });
    }
    
    // 2. Tự động trích xuất tất cả bộ lọc động (ví dụ: status, status...)
    const basePaginationKeys = ['page', 'limit', 'keyword', 'sortOrder'];
    const filters: Record<string, any> = {};
    
    Object.keys(params).forEach(key => {
      // Nếu thuộc tính nằm ngoài thông số phân trang gốc và có giá trị hợp lệ
      if (!basePaginationKeys.includes(key) && params[key] !== undefined && params[key] !== null && params[key] !== '') {
        let value = params[key];
        // Chuẩn hóa kiểu dữ liệu Boolean khi nhận từ URL (Query string)
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        filters[key] = value;
      }
    });
  
    if (Object.keys(filters).length > 0) {
      andConditions.push(filters);
    }
  
    // Gán tất cả các điều kiện vào điều kiện chung WHERE
    if (andConditions.length > 0) {
      options.where = { [Op.and]: andConditions };
    }
  
    // 3. Cho phép bổ sung logic thông qua callback queryBuilder nếu cần cấu trúc truy vấn nâng cao
    let finalOptions = options;
    if (queryBuilder) {
      finalOptions = await queryBuilder(options);
    }

    const res = await this.repository.search(params, finalOptions)
    return this.transformToDto(res);
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
  
  async getById(id: string): Promise<GetByIdResponseDto | any> {
    const redisKey = buildRedisKeyQuery(this.entityName.toLocaleLowerCase(), RedisContext.DETAIL, {}, id);

    const cached = await this.cacheManage.get(redisKey);

    const dataCache = cached && JSON.parse(cached);
    if (cached) return dataCache;

    const exclude = sensitiveFields[this.entityName] ?? [];
    const entity = await this.repository.findByPk(id, exclude);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    // const dto = plainToInstance<GetByIdResponseDto, any>(GetByIdResponseDto, entity, { excludeExtraneousValues: true });
    await this.cacheManage.set(redisKey, JSON.stringify(entity), 'EX', 30);
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
    await this.getById(id);
    await this.repository.delete(id);
  }

  private transformToDto(res: any): any {
    if (!res) return res;
  
    // Hàm chuyển 1 Sequelize Model thành Plain Object an toàn
    const toPlain = (item: any) => 
      item && typeof item.get === 'function' ? item.get({ plain: true }) : item;
  
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
    return plainToInstance(this.getAllDtoClass, toPlain(res), {
      excludeExtraneousValues: true,
    });
  }
}

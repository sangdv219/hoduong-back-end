import { IBaseSearchParams, IPaginatedResult, IPaginationDTO } from '@shared/interface/common';
import { NotFoundException } from '@nestjs/common';
import { FindAndCountOptions, FindOptions, Includeable, Op, QueryTypes, Transaction, WhereOptions } from 'sequelize';
import { Sequelize } from "sequelize-typescript";



export interface IBaseRepository<T> {
  search(params: IBaseSearchParams, options: FindOptions<T>):Promise<IPaginatedResult<T>>;
  findWithPagination(param: IPaginationDTO, exclude: string[]): Promise<{ items: any; total: number }>;
  findByFields<K extends keyof T>(field: K, value: T[K], attributes?: string[], exclude?: string[]): Promise<any[]>;
  findAllByRaw(condition: Record<string, any>, exclude?: string[]): Promise<any[] | null>;
  findOneByField<K extends keyof T>(field: K, value: T[K], exclude: string[]): Promise<any>;
  findByPk(id: string, exclude?: string[], raw?: boolean, options?: { transaction?: Transaction } | FindOptions<T>): Promise<T | null>;
  findByOneByRaw(condition: Record<string, any>, exclude: string[]): Promise<T | null>;
  create(entity: Partial<T>, options?: { transaction?: Transaction }): Promise<void>;
  update(id: string, entity: Partial<T>): Promise<any>;
  delete(id: string): Promise<boolean>;
  bulkCreate(entities: Partial<T>[], options?: { transaction?: Transaction }): Promise<void>;
  upsert(sequelize: Sequelize, table: string, conflictFields: string[], insertValues: Record<string, any>, updateFields: string[], options?: { transaction: Transaction }): Promise<T>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(
    readonly model,
    protected searchableFields: string[] = []
  ) {}
  
  async search(params: IBaseSearchParams, options: FindOptions<T> = {}){
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;
    // 1. Xử lý Sort
    let order: any = [['created_at', 'DESC']];
    if (params.sortOrder) {
        const direction = params.sortOrder.startsWith('-') ? 'DESC' : 'ASC';
        const column = params.sortOrder.replace('-', '');
        order = [[column, direction]];
    }

    const { rows, count } = await this.model.findAndCountAll({
      ...options, // Spread options để lấy include, attributes...
      limit,
      offset,
      order: options.order || order,
    });

 
    return {
      items: rows,  
      total: count,
      page,
      limit,
      totalRecord: Math.ceil(count / limit),
    };
  }

  async findWithPagination(parameter, exclude = ['']): Promise<{ items: T; total: number }> {
    const { page = 1, limit = 100, keyword, orderBy = 'created_at', orderDirection = 'DESC', filters = {} } = parameter;

    const offset = (page - 1) * limit;

    const where: WhereOptions = this.buildWhereClause(keyword, filters);

    const options: FindAndCountOptions = {
      limit,
      offset,
      where,
      order: [[orderBy, orderDirection]],
      attributes: { exclude },
      raw: true,
    };

    const { rows: items, count: total } = await this.model.findAndCountAll(options);

    return { items, total };
  }

  private buildWhereClause(keyword?: string, filters?: Record<string, any>): WhereOptions {
    const where: WhereOptions = {};

    if (keyword && this.searchableFields.length > 0) {
      (where as any)[Op.or as any] = this.searchableFields.map((field) => ({
        [field]: { [Op.iLike]: `%${keyword}%` },
      }));
    }

    if (filters && Object.keys(filters).length > 0) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          where[key] = value;
        }
      }
    }
    
    return where;
  }

  async findByFields<K extends keyof T>(field: K, value: T[K], attributes?: string[], exclude = ['']): Promise<any[]> {
    const records = await this.model.findAll({
      where: { [field as string]: value },
      raw: true,
      exclude,
      attributes: attributes
    });

    return records as unknown as T[K][];
  }

  async findOneByField<K extends keyof T>(field: K, value: T[K], exclude = ['']): Promise<any> {
    const record = await this.model.findOne({
      where: {
        [field as string]: value
      },
      raw: true,
      attributes: { exclude },
    });
    return record as unknown as T[K];
  }

  async findByPk(id: string, exclude:string[] = [], raw = false, 
    options?: { 
      transaction?: Transaction;
      include?: Includeable | Includeable[]; 
    }): Promise<T | null> {
    return this.model.findByPk(id, {
      attributes: exclude.length > 0 ? { exclude } : undefined,
      raw,
      transaction: options?.transaction,
      include: options?.include
    })
  }

  async findByOneByRaw(condition) {
    return this.model.findOne({
      ...condition,
      raw: true
    });
  }

  async findAllByRaw(condition) {
    return await this.model.findAll(
      {
        ...condition,
        raw: true
      }
    )
  }

  async create(entity, options?: { transaction?: Transaction }): Promise<any> {
    const result = await this.model.create(entity, {
      returning: true,
      transaction: options?.transaction,
    });

    return result.get({ plain: true });
  }

  async update(id: string, entity: any, options?: { transaction?: Transaction }) {
    return await this.model.update(entity, {
      where: { id },
      returning: true,
      transaction: options?.transaction,
    });
  }

  async delete(id: string) {
    const deletedRows = await this.model.destroy({
      where: { id },
      individualHooks: true
    });
    if (deletedRows === 0) {
      throw new NotFoundException('Record not found');
    }
    return Promise.resolve(true);
  }

  async upsert<T>(sequelize: Sequelize, table: string, conflictFields: string[], insertValues: Record<string, any>, updateFields: string[], options?: { transaction?: Transaction }): Promise<T> {
    const fields = Object.keys(insertValues);
    const placeholders = fields.map(f => `:${f}`).join(', ');
    const updateExpr = updateFields.map(f => `${f} = EXCLUDED.${f}`).join(', ');
    const conflictExpr = conflictFields.join(', ');
    const sql = `
    INSERT INTO ${table} (${fields.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (${conflictExpr})
    DO UPDATE SET ${updateExpr}
    RETURNING *;
  `;

    const [result] = await sequelize.query(sql, {
      replacements: insertValues,
      type: QueryTypes.INSERT,
      transaction: options?.transaction,
    });

    return result[0] as T;
  }

  async bulkCreate(entities: Partial<T>[], options?: { transaction?: Transaction }): Promise<void> {
    return this.model.bulkCreate(entities, {
      transaction: options?.transaction,
    });
  }

  async bulkUpdate(entities: (Partial<T> & { id?: string })[], options?: { transaction?: Transaction }): Promise<void> {
    const updatePromises = entities.map(entity => {
      const { id, ...updateData } = entity;
      if (!id) {
        return Promise.resolve();
      }
      return this.model.update(updateData, {
        where: { id },
        transaction: options?.transaction,
      });
    });

    await Promise.all(updatePromises);
  }
  
  async bulkDelete(ids: string[], options?: { transaction?: Transaction }): Promise<void> {
    await this.model.destroy({
      where: { id: { [Op.in]: ids } },
      transaction: options?.transaction,
    });
  } 
  
  async checkDuplicateFieldExcludeId<K extends keyof T>(field: K, value: T[K], excludeId?: string): Promise<boolean> {
    const condition: any = {
      [field]: value,
      id: { [Op.ne]: excludeId },
    };

    const brand = await this.model.findByPk({
      where: condition,
    });

    return !!brand;
  }

  async checkExistsField(fields: Record<string, { value: string; mode?: 'like' | 'equal' }>): Promise<boolean> {
    const orConditions = Object.entries(fields).map(([key, { value, mode = 'equal' }]) => ({
      [key]: mode === 'like' ? { [Op.iLike]: `%${value}%` } : value,
    }),
    );

    const exists = await this.model.findOne({
      where: { [Op.or]: orConditions },
    });

    return !!exists;
  }
}
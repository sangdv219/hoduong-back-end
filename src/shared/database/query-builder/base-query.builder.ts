import { FindOptions, Op, Order, WhereOptions } from "sequelize";

export interface QueryBuilderConfig<T> {
    sortableFields: string[];
    defaultSort: string;
    defaultDirection: "ASC" | "DESC";
    searchableFields: string[];
}

export class BaseQueryBuilder<T> {
    constructor(private readonly config: QueryBuilderConfig<T>) {}

    build(params: Record<string, any>): FindOptions<T> {

        const {
            page = 1,
            limit = 10,
            keyword,
            sortBy,
            sortOrder,
            ...filters
        } = params;
        console.log('params builder', params)
        const where: WhereOptions = {};

        Object.entries(filters).forEach(([key, value]) => {

            if (value !== undefined && value !== null && value !== "") {
                where[key] = value;
            }

        });

        if ( keyword && this.config.searchableFields?.length) {
            (where as any)[Op.or] =
                this.config.searchableFields.map(field => ({
                    [field]: {
                        [Op.iLike]: `%${keyword}%`
                    }
                }));

        }

        const order = this.buildOrder(sortBy,sortOrder);

        return {
            where,
            limit: Number(limit),
            offset: (page - 1) * limit,
            order,
        };

    }

    private buildOrder(
        sortBy?,
        sortOrder?,
    ): Order {

        const column = this.config.sortableFields.includes(sortBy) ? sortBy : this.config.defaultSort;

        const direction = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : this.config.defaultDirection;

        return [[ column, direction ]];

    }

}
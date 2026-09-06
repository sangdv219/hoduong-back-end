import { Injectable, Logger } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";

@Injectable()
export class BaseTransactionService{
    private readonly logger = new Logger(BaseTransactionService.name);
    constructor(private readonly sequelize: Sequelize){}

    async runInTransaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
        Logger.log('runInTransaction')
        return this.sequelize.transaction(async (t1) => {
            try {
                return await fn(t1);
            } catch (error) {
                this.logger.error('[base.transaction.service:14] error');
                throw error;
            };
        });
    }

    async runInSavepoint<T>(
        parent: Transaction,
        fn:(transaction: Transaction) => Promise<T>,
    ): Promise<T>{
        const t2 = await this.sequelize.transaction({ transaction: parent });
        try {
            const result = await fn(t2);
            await t2.commit();
            return result;
        } catch (error) {
            this.logger.error('[base.transaction.service:26] message');
            await t2.rollback();
            throw error;
        }
    }
}

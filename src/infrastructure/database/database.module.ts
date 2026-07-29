import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BaseTransactionService } from './transaction.service';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: true,
        timezone: '+07:00', // Ép buộc Sequelize format dạng '+07:00' thay vì 'GMT+0700'
        dialectOptions: {
          useUTC: false,    // Không bắt buộc ép về UTC gốc
        },
        logging: (sql, timing) => {console.log(`[DEBUG SQL] (${timing}ms): ${sql}`)},
        benchmark: true
      }),
    }),
  ],
  providers: [DatabaseService, BaseTransactionService],
  exports: [DatabaseService, BaseTransactionService],
})
export class DatabaseModule { }

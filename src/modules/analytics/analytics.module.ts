import { RedisModule } from '@redis/redis.module';
import { RedisService } from '@redis/redis.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefaultTokenSecretResolverStrategy } from '../../core/strategies/default-token-secret-resolver.strategy';
import { UserEntity } from '../../infrastructure/models/user.model';
import { PostgresAnalyticsRepository } from './infrastructure/repository/postgres-analytics.repository';
// import { AnalyticsService } from './services/analytics.service';

@Module({
  imports: [SequelizeModule.forFeature([UserEntity]), RedisModule ],
  controllers: [],
  providers: [
    PostgresAnalyticsRepository,
    // AnalyticsService,
    JwtModule,
    RedisService,
    {
      provide: 'TokenSecretResolver',
      useClass: DefaultTokenSecretResolverStrategy,
    },
    // {
    //   provide: 'IAnalyticsCheckerService',
    //   useClass: AnalyticsService,
    // }
  ],
  exports: [PostgresAnalyticsRepository, 'IAnalyticsCheckerService'],
})
export class AnalyticsModule {}

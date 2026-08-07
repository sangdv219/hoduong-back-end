import { AuditModule } from '@audit/audit.module'
import { BullModule } from '@bull/bull.module'
import { AuthModule } from '@modules/auth/auth.module'
import { RolesModule } from '@modules/roles/roles.module'
import { UserModule } from '@modules/users/user.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { RedisModule } from '@redis/redis.module'
import { ClsModule } from 'nestjs-cls'
// import { AnalyticsModule } from '@modules/analytics/analytics.module'
import { DatabaseModule } from '@infrastructure/database/database.module'
import { DatabaseService } from '@infrastructure/database/database.service'
import { AssociationsModule } from '@modules/associations/associations.module'
import { PermissionsModule } from '@modules/permissions/permissions.module'
import { McpController } from 'mcp.controller'
import { FamilyMembersModule } from '@modules/family-members/family-members.module'
import { CouplesModule } from './modules/couples/couples.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }, // auto bind context cho mỗi request
    }),
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_SECRET ??
        (() => {
          throw new Error('Missing JWT_SECRET')
        })(),
      signOptions: { expiresIn: '1h' },
    }),
    RedisModule.forRootAsync(),
    DatabaseModule,
    FamilyMembersModule,
    UserModule,
    CouplesModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    BullModule,
    // AnalyticsModule,
    AssociationsModule,
    AuditModule,
  ],
  controllers: [McpController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}

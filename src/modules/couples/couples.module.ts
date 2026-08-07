import { Module } from '@nestjs/common';
import { UserModel } from '@infrastructure/models/user.model';
import { CouplesRepository } from '@modules/couples/repository/couples.repository';
import { CoupleService } from '@modules/couples/services/couples.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { CouplesQueryBuilder } from '@modules/couples/query/couples.query.builder';
import { CouplesController } from './controller/couples.controller';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';

@Module({
  imports: [SequelizeModule.forFeature([CouplesModel, UserModel, FamilyMembersModel])],
  providers: [
    CouplesRepository,
    PostgresUserRepository,
    CoupleService,
    CouplesQueryBuilder,
    UserQueryBuilder
  ],
  controllers: [CouplesController],
  exports: [CouplesRepository, CoupleService],
})
export class CouplesModule {}

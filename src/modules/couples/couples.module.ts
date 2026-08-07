import { Module } from '@nestjs/common';
import { UserModel } from '@infrastructure/models/user.model';
import { CouplesRepository } from '@modules/couples/repository/couples.repository';
import { CoupleService } from '@modules/couples/services/couples.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';
import { CouplesQueryBuilder } from '@modules/couples/query/couples.query.builder';
import { CouplesController } from '@modules/couples/controller/couples.controller';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { FamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { FamilyMembersQueryBuilder } from '@modules/family-members/query/family-members.query.builder';

@Module({
  imports: [SequelizeModule.forFeature([CouplesModel, UserModel, FamilyMembersModel])],
  providers: [
    FamilyMembersRepository,
    FamilyMembersQueryBuilder,
    CoupleService,
    CouplesRepository,
    CouplesQueryBuilder,
    UserQueryBuilder
  ],
  controllers: [CouplesController],
  exports: [CouplesRepository, CoupleService],
})
export class CouplesModule {}

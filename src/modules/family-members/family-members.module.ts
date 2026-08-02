import { Module } from '@nestjs/common';
import { CoupleModel } from '@infrastructure/models/couple.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { PostgresFamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { FamilyMembersController } from './controller/family-members.controller';
import { FamilyMembersQueryBuilder } from './query/family-members.query.builder';
import { UserQueryBuilder } from '../users/query/user.query.builder';

@Module({
  imports: [SequelizeModule.forFeature([FamilyMembersModel, CoupleModel, UserModel])],
  providers: [
    PostgresFamilyMembersRepository,
    PostgresCoupleRepository,
    PostgresUserRepository,
    FamilyMemberService,
    FamilyMembersQueryBuilder,
    UserQueryBuilder
  ],
  controllers: [FamilyMembersController],
  exports: [PostgresFamilyMembersRepository, PostgresCoupleRepository, FamilyMemberService],
})
export class FamilyMembersModule {}

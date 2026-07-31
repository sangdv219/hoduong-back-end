import { CoupleModel } from '@infrastructure/models/couple.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { PostgresCoupleRepository } from '@modules/couples/repository/postgres-couple.repository';
import { PostgresFamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { family_memberservice } from '@modules/family-members/services/family-members.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { UserQueryBuilder } from '../users/query/user.query.builder';
import { FamilyMembersController } from './controller/family-members.controller';

@Module({
  imports: [SequelizeModule.forFeature([FamilyMembersModel, CoupleModel, UserModel])],
  providers: [
    PostgresFamilyMembersRepository,
    PostgresCoupleRepository,
    PostgresUserRepository,
    family_memberservice,
    UserQueryBuilder,
  ],
  controllers: [FamilyMembersController],
  exports: [PostgresFamilyMembersRepository, PostgresCoupleRepository, family_memberservice],
})
export class FamilyMembersModule {}

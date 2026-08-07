import { Module } from '@nestjs/common';
import { CouplesModel } from '@/infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import { CouplesRepository } from '@/modules/couples/repository/couples.repository';
import { FamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostgresUserRepository } from '@modules/users/repository/user.admin.repository';
import { FamilyMembersController } from '@modules/family-members/controller/family-members.controller';
import { FamilyMembersQueryBuilder } from '@modules/family-members/query/family-members.query.builder';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';

@Module({
  imports: [SequelizeModule.forFeature([FamilyMembersModel, CouplesModel, UserModel])],
  providers: [
    FamilyMembersRepository,
    CouplesRepository,
    PostgresUserRepository,
    FamilyMemberService,
    FamilyMembersQueryBuilder,
    UserQueryBuilder
  ],
  controllers: [FamilyMembersController],
  exports: [FamilyMembersRepository, CouplesRepository, FamilyMemberService],
})
export class FamilyMembersModule {}

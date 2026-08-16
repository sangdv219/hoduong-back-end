import { Module } from '@nestjs/common';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { FamilyMembersController } from '@modules/family-members/controller/family-members.controller';
import { FamilyMembersQueryBuilder } from '@modules/family-members/query/family-members.query.builder';
import { CouplesModel } from '@infrastructure/models/couples.model';
import { CouplesRepository } from '@modules/couples/repository/couples.repository';
import { CouplesQueryBuilder } from '@modules/couples/query/couples.query.builder';
import { FamilyMembersRepository } from '@/modules/family-members/repository/family-members.repository';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRepository } from '@modules/users/repository/user.admin.repository';
import { UserModel } from '@infrastructure/models/user.model';
import { UserQueryBuilder } from '@modules/users/query/user.query.builder';

@Module({
  imports: [SequelizeModule.forFeature([FamilyMembersModel, CouplesModel, UserModel])],
  providers: [
    FamilyMembersRepository,
    CouplesRepository,
    UserRepository,
    FamilyMemberService,
    FamilyMembersQueryBuilder,
    UserQueryBuilder,
    CouplesQueryBuilder,
  ],
  controllers: [FamilyMembersController],
  exports: [FamilyMembersRepository, CouplesRepository, FamilyMemberService],
})
export class FamilyMembersModule {}

import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { PostgresUserRolesRepository } from '@modules/associations/repositories/user-roles.repository';
import { family_memberservice } from '@modules/family-members/services/family-members.service';
// import { toSafeUserResponse } from '@modules/users/helpers/user-response.helper';
import { UserService } from '@modules/users/services/user.service';
import { Injectable } from '@nestjs/common';
import { CreatedUserAdminRequestDto } from '@modules/users/dto/user.admin.request.dto';
import { toSafeUserResponse } from '@modules/users/helpers/user-response.helper';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly userRolesRepository: PostgresUserRolesRepository,
    private readonly family_memberservice: family_memberservice,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async execute(dto: CreatedUserAdminRequestDto): Promise<any> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const user = await this.userService.createMember(dto, transaction);
      const roleId = await this.userService.resolveRoleId();
      await this.userRolesRepository.assignRole(user.id as string, roleId, transaction);
      const tree = await this.family_memberservice.attachMemberToTree(
        user.id as string,
        dto.parentUserId,
        transaction,
      );
      return toSafeUserResponse(user, roleId, tree);
    });
  }
}

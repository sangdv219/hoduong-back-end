import { BaseTransactionService } from '@/infrastructure/database/transaction.service';
import { PostgresUserRolesRepository } from '@modules/associations/repositories/user-roles.repository';
import { NodeService } from '@modules/nodes/services/node.service';
import { CreateMemberRequestDto } from '@modules/users/dto/create-member.request.dto';
import { CreateMemberResponseDto } from '@modules/users/dto/create-member.response.dto';
import { toSafeUserResponse } from '@modules/users/helpers/user-response.helper';
import { UserService } from '@modules/users/services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly userRolesRepository: PostgresUserRolesRepository,
    private readonly nodeService: NodeService,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async execute(dto: CreateMemberRequestDto): Promise<CreateMemberResponseDto> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const user = await this.userService.createMember(dto, transaction);
      const roleId = await this.userService.resolveRoleId(dto.roleId);
      await this.userRolesRepository.assignRole(user.id as string, roleId, transaction);
      const tree = await this.nodeService.attachMemberToTree(
        user.id as string,
        dto.parentUserId,
        transaction,
      );
      return toSafeUserResponse(user, roleId, tree);
    });
  }
}

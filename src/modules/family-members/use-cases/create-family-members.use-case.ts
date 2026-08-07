import { Injectable } from '@nestjs/common';
import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
// import { toSafefamily-memberResponse } from '@modules/family-members/helpers/family-member-response.helper';
import { CreatedFamilyMembersRequestDto } from '@modules/family-members/dto/family-members.request.dto';
import { FamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { CoupleService } from '@modules/couples/services/couples.service';
// import { toSafefamily-memberResponse } from '@modules/family-members/helpers/family-members-response.helper';

@Injectable()
export class CreateFamilyMemberUseCase {
  constructor(
    private readonly familyMemberService: FamilyMemberService,
    private readonly coupleService:CoupleService,
    private readonly familyMembersRepository: FamilyMembersRepository,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async execute(dto: CreatedFamilyMembersRequestDto): Promise<any> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
    //   const familyMember = await this.familyMemberService.createFamilyMember(dto, transaction);
    //   const roleId = await this.coupleService.create(dto);
    //   await this.familyMembersRepository.assignRole(family-member.id as string, userId, transaction);
    //   const tree = await this.familyMemberService.attachMemberToTree(
    //     family-member.id as string,
    //     dto.parentfamily-memberId,
    //     transaction,
    //   );
    //   return toSafefamily-memberResponse(family-member, roleId, tree);
    });
  }
}

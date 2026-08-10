import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
// import { toSafeCoupleResponse } from '@modules/couples/helpers/couple-response.helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CoupleService } from '@modules/couples/services/couples.service';
import { CreatedCouplesRequestDto } from '@modules/couples/dto/couples.request.dto';
import { FamilyMembersRepository } from '@modules/family-members/repository/postgres-family-members.repository';
import { COUPLE_ERROR } from '@modules/couples/constants/couple.constant';


@Injectable()
export class CreateCoupleUseCase {
  constructor(
    private readonly coupleService: CoupleService,
    // private readonly familyMemberService: FamilyMemberService,
    private readonly familyMemberRepository: FamilyMembersRepository,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async execute(dto: CreatedCouplesRequestDto): Promise<any> {
    return this.baseTransactionService.runInTransaction(async (transaction) => {
      const {partner_1_id, partner_2_id} = dto;
        if(partner_1_id === partner_2_id) throw new BadRequestException(COUPLE_ERROR.CANNOT_SET_RELATION_MARRIE_WITH_YOUSELF);
        const partner1Family = await this.familyMemberRepository.findOneByField('user_id', partner_1_id)
        const partner2Family = await this.familyMemberRepository.findOneByField('user_id', partner_2_id)
        const [sorted_partner_1, sorted_partner_2] = [partner1Family.id, partner2Family.id].sort()
        
        await this.coupleService.create({
          ...dto,
          partner_1_id: sorted_partner_1,
          partner_2_id: sorted_partner_2,
        }, transaction);
    
      // const roleId = await this.coupleService.resolveRoleId();
      // await this.coupleRolesRepository.assignRole(couple.id as string, roleId, transaction);
      // const tree = await this.FamilyMemberService.attachMemberToTree(
      //   couple.id as string,
      //   dto.parentCoupleId,
      //   transaction,
      // );
      // return toSafeCoupleResponse(couple, roleId, tree);
    });
  }
}

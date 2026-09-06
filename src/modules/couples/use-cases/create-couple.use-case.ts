import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { COUPLE_ERROR } from '@modules/couples/constants/couple.constant';
import { CreatedCouplesRequestDto } from '@modules/couples/dto/couples.request.dto';
import { CoupleService } from '@modules/couples/services/couples.service';
import { FamilyMembersRepository } from '@modules/family-members/repository/family-members.repository';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

export class CreateCoupleUseCase {
  constructor(
    private readonly coupleService: CoupleService,
    private readonly familyMemberRepository: FamilyMembersRepository,
    private readonly baseTransactionService: BaseTransactionService,
    private readonly familyMemberService: FamilyMemberService,
  ) {}

  async execute(dto: CreatedCouplesRequestDto): Promise<any> {
    Logger.log('create couples')
    try {
      return this.baseTransactionService.runInTransaction(async (transaction) => {
        const {partner_1_id, partner_2_id} = dto;
          if(partner_1_id === partner_2_id) throw new BadRequestException(COUPLE_ERROR.CANNOT_SET_RELATION_MARRIE_WITH_YOUSELF);
          const partner1Family = await this.familyMemberRepository.findOneByField('user_id', partner_1_id)
          const partner2Family = await this.familyMemberRepository.findOneByField('user_id', partner_2_id)
          if(!partner1Family) throw new BadRequestException('Người đăng ký kết hôn không có trong gia phả, nên không được phép chọn.');
          if(!partner2Family) throw new BadRequestException('Đối tượng kết hôn không có trong gia phả, nên không được phép chọn.');
          const [sorted_partner_1, sorted_partner_2] = [partner1Family.id, partner2Family.id].sort()
          
          const coupleResponse = await this.coupleService.create({
            ...dto,
            partner_1_id: sorted_partner_1,
            partner_2_id: sorted_partner_2,
          }, transaction);
      
          // await this.familyMemberService.updateFamilyMembers(sorted_partner_1, {parent_couple_id: coupleResponse.id});
        return coupleResponse;
      });
    } catch (error) {
      Logger.error('error', error)
    }
  }
}

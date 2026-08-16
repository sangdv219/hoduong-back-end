import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CoupleService } from '@modules/couples/services/couples.service';
import { CreatedCouplesRequestDto } from '@modules/couples/dto/couples.request.dto';
import { FamilyMembersRepository } from '@/modules/family-members/repository/family-members.repository';
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
        if(!partner1Family) throw new BadRequestException('Người đăng ký kết hôn không có trong gia phả, nên không được phép chọn.');
        if(!partner2Family) throw new BadRequestException('Đối tượng kết hôn không có trong gia phả, nên không được phép chọn.');
        const [sorted_partner_1, sorted_partner_2] = [partner1Family.id, partner2Family.id].sort()
        
        const couple =  await this.coupleService.create({
          ...dto,
          partner_1_id: sorted_partner_1,
          partner_2_id: sorted_partner_2,
        }, transaction);
    
      return couple;
    });
  }
}

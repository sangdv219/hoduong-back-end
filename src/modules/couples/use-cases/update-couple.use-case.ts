import { BaseTransactionService } from '@infrastructure/database/transaction.service';
import { FamilyMemberService } from '@modules/family-members/services/family-members.service';
// import { toSafeCoupleResponse } from '@modules/couples/helpers/couple-response.helper';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CoupleService } from '@modules/couples/services/couples.service';
import { CreatedCouplesRequestDto, UpdatedCouplesRequestDto } from '@modules/couples/dto/couples.request.dto';
import { FamilyMembersRepository } from '@/modules/family-members/repository/family-members.repository';
import { COUPLE_ERROR } from '@modules/couples/constants/couple.constant';
import { CouplesRepository } from '../repository/couples.repository';
import { Transaction } from 'sequelize';


@Injectable()
export class UpdateCoupleUseCase {
  constructor(
    private readonly coupleService: CoupleService,
    // private readonly familyMemberService: FamilyMemberService,
    private readonly couplesRepository: CouplesRepository,
    private readonly familyMemberRepository: FamilyMembersRepository,
    private readonly baseTransactionService: BaseTransactionService,
  ) {}

  async execute(id:string, dto: UpdatedCouplesRequestDto): Promise<any> {
    return this.baseTransactionService.runInTransaction(async (transaction: Transaction) => {
      const {partner_1_id, partner_2_id} = dto;
      const coupleEntity = await this.couplesRepository.findByPk(id, [], false, {
        include: [
          {
            association: 'partner_1',
            include: ['user'], // Eager load UserModel cho partner_1
          },
          {
            association: 'partner_2',
            include: ['user'], // Eager load UserModel cho partner_2
          },
        ],
        transaction,
      });
      const couple = coupleEntity?.toJSON()
      if(!couple) throw new NotFoundException('Id couple không tìm thấy !')
      let finalPartner1FamilyId = couple.partner_1_id;
      if (partner_1_id !== undefined) {
        const partner1Family = await this.familyMemberRepository.findOneByField('user_id', partner_1_id);
        if (!partner1Family) {
          throw new BadRequestException('Người đăng ký kết hôn không có trong gia phả, nên không được phép chọn.');
        }
        finalPartner1FamilyId = partner1Family.id;
      }

      let finalPartner2FamilyId = couple.partner_2_id;
      if (partner_2_id !== undefined) {
        const partner2Family = await this.familyMemberRepository.findOneByField('user_id', partner_2_id);
        if (!partner2Family) {
          throw new BadRequestException('Đối tượng kết hôn không có trong gia phả, nên không được phép chọn.');
        }
        finalPartner2FamilyId = partner2Family.id;
      }

      if (finalPartner1FamilyId === finalPartner2FamilyId) {
        throw new BadRequestException(COUPLE_ERROR.CANNOT_SET_RELATION_MARRIE_WITH_YOUSELF);
      }

      const [sorted_partner_1, sorted_partner_2] = [finalPartner1FamilyId, finalPartner2FamilyId].sort()

      const updated = await this.coupleService.updateCouples(
          id,
          {
            ...dto,
            partner_1_id: sorted_partner_1,
            partner_2_id: sorted_partner_2,
          }, 
          couple,
          transaction
      );
        
        return updated;
    });
  }
}

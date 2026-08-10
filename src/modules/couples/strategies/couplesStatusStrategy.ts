import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { CouplesModel, EMarriageStatus } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { IUser } from '@/infrastructure/models/user.model';
import { COUPLE_ERROR } from '../constants/couple.constant';
import { IMarriageStatus } from '../dto/couples.request.dto';

/**
 * Interface chứa DTO dữ liệu cập nhật cặp đôi
 */

/**
 * 1. Interface chung cho tất cả Marriage Status Strategies
 */
export interface IMarriageStatusStrategy {
  validateTransition(context: IMarriageStatus): void;
  handleLogic( couple: CouplesModel, context: IMarriageStatus, transaction?: Transaction ): Promise<void>;
}

/**
 * 2. Strategy cho trạng thái SINGLE (Độc thân / Hủy quan hệ hôn nhân)
 */
export class SingleMarriageStatusStrategy implements IMarriageStatusStrategy {
  validateTransition(context: IMarriageStatus): void {
    const { couple } = context;
    if (couple.marriage_status === EMarriageStatus.SINGLE) {
      throw new BadRequestException('Couple marriage status is already SINGLE.');
    }
  }

  async handleLogic( couple: CouplesModel, context: IMarriageStatus, _transaction?: Transaction ): Promise<void> {
    // Khi đưa về SINGLE: Xóa các mốc ngày cưới và ly hôn
    couple.marriage_status = EMarriageStatus.SINGLE;
    couple.marriage_date = null as unknown as Date;
    couple.divorce_date = null as unknown as Date;
  }
}

/**
 * 3. Strategy cho trạng thái MARRIED (Đã kết hôn)
 */
export class MarriedMarriageStatusStrategy implements IMarriageStatusStrategy {
  validateTransition(context: IMarriageStatus): void {
    const { couple } = context;
    if (couple.marriage_status === EMarriageStatus.MARRIED) {
      throw new BadRequestException('Couple is already registered as MARRIED.');
    }
  }

  async handleLogic( couple: CouplesModel, context: IMarriageStatus, _transaction?: Transaction ): Promise<void> {
    const { dto } = context;

    // Xác định ngày kết hôn từ DTO hoặc giữ nguyên/mặc định thời điểm hiện tại
    const targetMarriageDate = dto?.marriage_date || couple.marriage_date || new Date();

    couple.marriage_status = EMarriageStatus.MARRIED;
    couple.marriage_date = targetMarriageDate;
    couple.divorce_date = null as unknown as Date; // Xóa ngày ly hôn nếu có trước đó (trường hợp tái hôn)
  }
}

/**
 * 4. Strategy cho trạng thái DIVORCED (Đã ly hôn)
 */
export class DivorcedMarriageStatusStrategy implements IMarriageStatusStrategy {
  validateTransition(context: IMarriageStatus): void {
    const { couple } = context;
    // Chỉ cho phép chuyển sang DIVORCED từ trạng thái MARRIED
    if (couple.marriage_status !== EMarriageStatus.MARRIED) {
      throw new BadRequestException(
        `Cannot transition to DIVORCED from status ${couple.marriage_status}. Couple must be MARRIED first.`,
      );
    }
  }

  async handleLogic( couple: CouplesModel, context: IMarriageStatus, _transaction?: Transaction ): Promise<void> {
    const { dto } = context;
    const divorceDate = dto?.divorce_date || new Date();

    // Ràng buộc logic: Ngày ly hôn không được trước ngày kết hôn
    if (couple.marriage_date && new Date(divorceDate) < new Date(couple.marriage_date)) {
      throw new BadRequestException('Divorce date cannot be earlier than marriage date.');
    }

    couple.marriage_status = EMarriageStatus.DIVORCED;
    couple.divorce_date = divorceDate;
  }
}

export class WidowedMarriageStatusStrategy implements IMarriageStatusStrategy {
  validateTransition(context: IMarriageStatus): void {
    const { couple } = context;
    // Chỉ cho phép góa khi cuộc hôn nhân đang trong trạng thái MARRIED
    if (couple.marriage_status !== EMarriageStatus.MARRIED) {
      throw new BadRequestException(
        `Cannot transition to WIDOWED from status ${couple.marriage_status}. Couple must be MARRIED.`,
      );
    }
  }

  async handleLogic( couple: CouplesModel, context: IMarriageStatus, _transaction?: Transaction ): Promise<void> {
    const { partner1, partner2 } = context;

    if (!partner1 || !partner2) {
      throw new BadRequestException(
        'Partner information must be loaded to validate WIDOWED status.',
      );
    }
    const checkIsDeceased = (user?: IUser): boolean => {
      if (!user) return false; // Nếu không có thông tin user liên kết, không thể xác định là đã mất
      return Boolean(user.year_of_death) || user.life_status === 0;
    };

    const isPartner1Deceased = checkIsDeceased(partner1.user);
    const isPartner2Deceased = checkIsDeceased(partner2.user);

    // Bắt buộc ít nhất 1 trong 2 người phải được hệ thống ghi nhận đã mất
    if (!isPartner1Deceased && !isPartner2Deceased)  throw new BadRequestException(COUPLE_ERROR.CANNOT_SET_STATUS_TO_WIDOWED);

    couple.marriage_status = EMarriageStatus.WIDOWED;
  }
}

@Injectable()
export class MarriageStatusStrategyFactory {
  getStrategy(targetStatus?: EMarriageStatus): IMarriageStatusStrategy {
    switch (targetStatus) {
      case EMarriageStatus.SINGLE:
        return new SingleMarriageStatusStrategy();
      case EMarriageStatus.MARRIED:
        return new MarriedMarriageStatusStrategy();
      case EMarriageStatus.DIVORCED:
        return new DivorcedMarriageStatusStrategy();
      case EMarriageStatus.WIDOWED:
        return new WidowedMarriageStatusStrategy();
      default:
        throw new NotImplementedException(
          `Strategy for marriage status '${targetStatus}' is not implemented.`,
        );
    }
  }
}
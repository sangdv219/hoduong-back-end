import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { Status, UserModel } from '@/infrastructure/models/user.model';
import { Transaction } from 'sequelize';

// 1. Định nghĩa Interface chung cho tất cả các Strategy
export interface IUserStatusStrategy {
  /**
   * Kiểm tra xem trạng thái hiện tại có được phép chuyển sang trạng thái của Strategy này không
   */
  validateTransition(currentStatus: Status): void;

  /**
   * Xử lý logic nghiệp vụ (side-effects) khi chuyển trạng thái
   */
  handleLogic(user: UserModel, transaction?: Transaction): Promise<void>;
}

// 2. Triển khai Strategy cho trạng thái ACTIVE
export class ActiveStatusStrategy implements IUserStatusStrategy {
  validateTransition(currentStatus: Status): void {
    const allowedPreviousStates = [Status.PENDING, Status.INACTIVE, Status.SUSPENDED];
    if (!allowedPreviousStates.includes(currentStatus)) {
      throw new BadRequestException(`Cannot activate user from ${currentStatus} status.`);
    }
  }

  async handleLogic(user: UserModel, transaction?: Transaction): Promise<void> {
    // Logic ví dụ: Gửi email Welcome (nếu từ Pending) hoặc Gửi email khôi phục tài khoản
    // EmailService.sendUserActivatedEmail(user.email);
  }
}

// 3. Triển khai Strategy cho trạng thái INACTIVE
export class InactiveStatusStrategy implements IUserStatusStrategy {
  validateTransition(currentStatus: Status): void {
    const allowedPreviousStates = [Status.ACTIVE];
    if (!allowedPreviousStates.includes(currentStatus)) {
      throw new BadRequestException(`Cannot deactivate user from ${currentStatus} status.`);
    }
  }

  async handleLogic(user: UserModel, transaction?: Transaction): Promise<void> {
    // Logic: Xóa token đăng nhập, force logout...
  }
}

// 4. Triển khai Strategy cho trạng thái SUSPENDED (Đình chỉ)
export class SuspendedStatusStrategy implements IUserStatusStrategy {
  validateTransition(currentStatus: Status): void {
    // Chỉ được đình chỉ những user đang Active
    const allowedPreviousStates = [Status.ACTIVE];
    if (!allowedPreviousStates.includes(currentStatus)) {
      throw new BadRequestException(`Cannot suspend user from ${currentStatus} status. User must be ACTIVE.`);
    }
  }

  async handleLogic(user: UserModel, transaction?: Transaction): Promise<void> {
    // Logic: Gửi cảnh báo vi phạm, thu hồi quyền hạn, ngắt kết nối session...
  }
}

// 5. Triển khai Strategy cho trạng thái ARCHIVED (Lưu trữ)
export class ArchivedStatusStrategy implements IUserStatusStrategy {
  validateTransition(currentStatus: Status): void {
    // Không cho phép Archive nếu đã Archived
    if (currentStatus === Status.ARCHIVED) {
      throw new BadRequestException('User is already archived.');
    }
  }

  async handleLogic(user: UserModel, transaction?: Transaction): Promise<void> {
    // Logic: Xóa dữ liệu nhạy cảm (GDPR), gỡ avatar_file_id...
  }
}


@Injectable()
export class UserStatusStrategyFactory {
  // Có thể inject các service khác (EmailService, RedisService...) vào Factory này 
  // và truyền chúng vào constructor của các class Strategy nếu cần.

  getStrategy(targetStatus: Status): IUserStatusStrategy {
    switch (targetStatus) {
      case Status.ACTIVE:
        return new ActiveStatusStrategy();
      case Status.INACTIVE:
        return new InactiveStatusStrategy();
      case Status.SUSPENDED:
        return new SuspendedStatusStrategy();
      case Status.ARCHIVED:
        return new ArchivedStatusStrategy();
      case Status.PENDING:
        throw new NotImplementedException('Cannot manually transition back to PENDING');
      default:
        throw new NotImplementedException(`Strategy for status ${targetStatus} is not implemented.`);
    }
  }
}
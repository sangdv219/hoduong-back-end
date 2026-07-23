// import { TreeAttachmentResult } from '@modules/nodes/services/node.service';
// import { CreatedUserAdminRequestDto } from '../dto/user.admin.request.dto';

import { Status } from "@/infrastructure/models/user.model";
import { TreeAttachmentResult } from "@modules/nodes/services/node.service";
import { CreatedUserAdminRequestDto } from "@modules/users/dto/user.admin.request.dto";

const SENSITIVE_USER_FIELDS = [
  'password_hash',
  'password',
  'failed_login_attempts',
  'last_failed_login_at',
  'locked_until',
  'deleted_by',
  'deleted_at',
] as const;

export function toSafeUserResponse(
  user: Record<string, unknown>,
  roleId?: string,
  tree?: TreeAttachmentResult | null,
): CreatedUserAdminRequestDto {
  const safe = { ...user };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete safe[field];
  }

  return {
    // id: safe.id,
    fullname: safe.fullname as string,
    password: safe.password as string,
    // ascii_name: safe.ascii_name as string,
    other_name: safe.other_name as string,
    email: safe.email as string,
    phone: safe.phone as string,
    gender: safe.gender as number,
    age: safe.age as number,
    life_status: safe.life_status as 0 | 1,
    address: safe.address as string,
    birth_date: safe.birth_date as Date,
    year_of_death: safe.year_of_death as Date,
    biography: safe.biography as string,
    burial_place: safe.burial_place as string,
    is_root: safe.is_root as boolean,
    // status: safe.status as Status,
    roleId: safe.roleId as string,
    // nodeId: tree?.nodeId,
    // coupleId: tree?.coupleId,
    // couple_order: tree?.couple_order,
    // parentNodeId: tree?.parentNodeId,
    parentUserId: safe.parentUserId as string,
    // created_at: safe.created_at as Date,
    // updated_at: safe.updated_at as Date,
  };
}

export function prepareSearchParams(rawInput: string) {
  const cleanInput = rawInput.trim();

  // 1. Chuẩn hóa cho Phone: Bỏ toàn bộ ký tự không phải số
  const phoneKeyword = cleanInput.replace(/\D/g, '');

  // 2. Chuẩn hóa cho Ascii Name (Chuyển tiếng Việt có dấu -> không dấu -> thay khoảng trắng thành dấu gạch ngang '-')
  const asciiKeyword = cleanInput
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // 3. Tạo pattern linh hoạt cho Ascii Name (thay khoảng trắng bằng '%') phòng trường hợp format khác nhau
  const flexibleAsciiPattern = cleanInput
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '%');

  return {
    rawInput,
    phoneKeyword,
    asciiKeyword,
    flexibleAsciiPattern,
  };
}
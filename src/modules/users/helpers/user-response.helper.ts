// import { TreeAttachmentResult } from '@modules/nodes/services/node.service';
// import { CreatedUserAdminRequestDto } from '../dto/user.admin.request.dto';

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
    gender: safe.gender as string,
    age: safe.age as number,
    status: safe.status as number,
    address: safe.address as string,
    birth_date: safe.birth_date as Date,
    year_of_death: safe.year_of_death as Date,
    biography: safe.biography as string,
    burial_place: safe.burial_place as string,
    is_root: safe.is_root as boolean,
    is_active: safe.is_active as boolean,
    roleId: safe.roleId as string,
    // nodeId: tree?.nodeId,
    // coupleId: tree?.coupleId,
    // level: tree?.level,
    // parentNodeId: tree?.parentNodeId,
    parentUserId: safe.parentUserId as string,
    // created_at: safe.created_at as Date,
    // updated_at: safe.updated_at as Date,
  };
}

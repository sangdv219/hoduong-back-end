import { CreateMemberResponseDto } from '@modules/users/dto/create-member.response.dto';
import { TreeAttachmentResult } from '@modules/nodes/services/node.service';

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
): CreateMemberResponseDto {
  const safe = { ...user };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete safe[field];
  }

  return {
    id: safe.id as string,
    fullname: safe.fullname as string,
    ascii_name: safe.ascii_name as string,
    email: safe.email as string,
    phone: safe.phone as string,
    gender: safe.gender as string | undefined,
    age: safe.age as number | undefined,
    is_root: safe.is_root as boolean,
    is_active: safe.is_active as boolean,
    avatar: safe.avatar as string | undefined,
    roleId,
    nodeId: tree?.nodeId,
    coupleId: tree?.coupleId,
    level: tree?.level,
    parentNodeId: tree?.parentNodeId,
    parentUserId: tree?.parentUserId,
    created_at: safe.created_at as Date,
    updated_at: safe.updated_at as Date,
  };
}

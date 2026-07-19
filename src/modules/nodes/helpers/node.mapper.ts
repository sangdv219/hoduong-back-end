import { CoupleModel } from '@/infrastructure/models/couple.model';
import { NodeModel } from '@/infrastructure/models/node.model';
import { UserEntity } from '@/infrastructure/models/user.model';
import {
  CoupleGetVModel,
  NodeGetVModel,
  NodeTreeVModel,
  NodeUserVModel,
} from '@modules/nodes/dto/node.dto';

export function mapUserToVModel(user: UserEntity | Record<string, unknown>): NodeUserVModel {
  const u = user as UserEntity;
  return {
    id: u.id,
    fullname: u.fullname,
    otherName: u.other_name,
    gender: u.gender,
    yearOfBirth: u.birth_date,
    yearOfDeath: u.year_of_death,
    burialPlace: u.burial_place,
    address: u.address,
    biography: u.biography,
    status: u.status,
    email: u.email || '',
    is_active: u.is_active,
    createdAt: u.created_at,
    updatedBy: u.updated_by,
  };
}

export function mapCoupleToVModel(couple: CoupleModel, user?: UserEntity): CoupleGetVModel {
  return {
    id: couple.id,
    level: couple.level,
    userId: couple.user_id,
    createdAt: couple.created_at,
    createdBy: couple.created_by,
    is_active: couple.is_active,
    nodeId: couple.node_id,
    user: user ? mapUserToVModel(user) : undefined,
  };
}

export function mapEntityToVModel(entity: NodeModel | Record<string, unknown>): NodeGetVModel {
  const node = entity as NodeModel;
  return {
    nodeId: node.id,
    userId: node.user_id,
    parentId: node.parent_id ?? undefined,
    createdAt: node.created_at,
    createdBy: node.created_by ?? undefined,
    updatedAt: node.updated_at,
    updatedBy: node.updated_by ?? undefined,
    is_active: node.is_active,
    members: node.members,
    user: node.user ? mapUserToVModel(node.user) : undefined,
    parent: node.parent?.user ? mapUserToVModel(node.parent.user) : undefined,
  };
}

export function mapEntityToTree(
  entity: NodeModel,
  allNodes: NodeModel[],
  userMap: Map<string, UserEntity>,
): NodeTreeVModel {
  const userEntity = userMap.get(entity.user_id);
  const userModel = userEntity ? mapUserToVModel(userEntity) : undefined;

  const children = allNodes
    .filter((node) => node.parent_id === entity.id)
    .map((child) => mapEntityToTree(child, allNodes, userMap))
    .filter((childTree) => childTree.user?.is_active !== false);

  return {
    id: entity.id,
    userId: entity.user_id,
    parentId: entity.parent_id ?? undefined,
    createdAt: entity.created_at,
    createdBy: entity.created_by ?? undefined,
    updatedAt: entity.updated_at,
    updatedBy: entity.updated_by ?? undefined,
    is_active: entity.is_active,
    members: entity.members,
    children,
    user: userModel,
  };
}

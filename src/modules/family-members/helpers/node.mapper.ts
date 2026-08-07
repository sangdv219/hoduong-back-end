import { CouplesModel } from '@infrastructure/models/couples.model';
import { FamilyMembersModel } from '@infrastructure/models/family-members.model';
import { UserModel } from '@infrastructure/models/user.model';
import {
  CoupleGetVModel,
  FamilyMembersGetVModel,
  NodeTreeVModel,
  NodeUserVModel,
} from '@modules/family-members/dto/family-members.request.dto';

export function mapUserToVModel(user: UserModel | Record<string, unknown>): NodeUserVModel {
  const u = user as UserModel;
  console.log('u',u)
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
    life_status: u.life_status,
    email: u.email || '',
    status: u.status,
    createdAt: u.created_at,
    updatedBy: u.updated_by,
  };
}

export function mapCoupleToVModel(couple: CouplesModel, user?: UserModel): CoupleGetVModel {
  return {
    id: couple.id,
    couple_order: couple.couple_order,
    // userId: couple.user_id,
    createdAt: couple.created_at,
    createdBy: couple.created_by,
    nodeId: couple.partner_1_id,
    user: user ? mapUserToVModel(user) : undefined,
  };
}

export function mapEntityToVModel(entity: FamilyMembersModel | Record<string, unknown>): FamilyMembersGetVModel {
  const node = entity as FamilyMembersModel;
  return {
    nodeId: node.id,
    userId: node.user_id,
    parent_couple_id: node.parent_couple_id ?? undefined,
    createdAt: node.created_at,
    createdBy: node.created_by ?? undefined,
    updatedAt: node.updated_at,
    updatedBy: node.updated_by ?? undefined,
    child_order: node.child_order,
    user: node.user ? mapUserToVModel(node.user) : undefined,
    // father: node.parent_couple_id?.user ? mapUserToVModel(node.father.user) : undefined,
  };
}

export function mapEntityToTree(
  entity: FamilyMembersModel,
  allfamily_members: FamilyMembersModel[],
  userMap: Map<string, UserModel>,
): NodeTreeVModel {
  // const userEntity = userMap.get(entity.user_id);
  // const userModel = userEntity ? mapUserToVModel(userEntity) : undefined;

  const children = allfamily_members
    .filter((node) => node.parent_couple_id === entity.id)
    .map((child) => mapEntityToTree(child, allfamily_members, userMap))
    .filter((childTree) => childTree.user?.status !== 'active');

  return {
    id: entity.id,
    userId: entity.user_id,
    parent_couple_id: entity.parent_couple_id ?? undefined,
    createdAt: entity.created_at,
    createdBy: entity.created_by ?? undefined,
    updatedAt: entity.updated_at,
    updatedBy: entity.updated_by ?? undefined,
    child_order: entity.child_order,
    children,
    // user: userModel,
  };
}

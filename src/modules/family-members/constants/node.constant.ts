export const NODE_ENTITY = {
  NAME: 'Node',
  TABLE_NAME: 'family_members',
};

export const NODE_ERROR = {
  PARENT_USER_NOT_FOUND: 'Parent user not found',
  PARENT_NODE_NOT_FOUND: 'Parent user is not connected to the family tree',
  PARENT_ALREADY_HAS_CHILD: 'Parent node already has a direct child in the tree',
  CANNOT_ATTACH_TO_SELF: 'A user cannot be attached to themselves',
  USER_ALREADY_HAS_NODE: 'User already belongs to a family tree node',
  NODE_NOT_FOUND: 'Node not found',
  USER_NOT_FOUND: 'User not found',
  CANNOT_DELETE_NODE_WITH_CHILDREN: 'Delete all child family_members before deleting this node',
  CANNOT_DELETE_ROOT_NODE: 'Root node cannot be deleted',
  MEMBER_ORDER_ALREADY_EXISTS: 'Member order already exists among sibling family_members',
  CANNOT_PROVIDE_MEMBERS_WITHOUT_PARENT: 'Cannot provide member order without a parent node',
  ROOT_NODE_ALREADY_EXISTS: 'Family tree root already exists',
  COUPLE_USER_ALREADY_HAS_NODE: 'Spouse user already belongs to a family tree node',
};

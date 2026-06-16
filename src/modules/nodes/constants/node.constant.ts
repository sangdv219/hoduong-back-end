export const NODE_ENTITY = {
  NAME: 'Node',
  TABLE_NAME: 'nodes',
};

export const NODE_ERROR = {
  PARENT_USER_NOT_FOUND: 'Parent user not found',
  PARENT_NODE_NOT_FOUND: 'Parent user is not connected to the family tree',
  PARENT_ALREADY_HAS_CHILD: 'Parent node already has a direct child in the tree',
  CANNOT_ATTACH_TO_SELF: 'A user cannot be attached to themselves',
  USER_ALREADY_HAS_NODE: 'User already belongs to a family tree node',
};

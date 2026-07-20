import { ROOT_TREE_LEVEL } from '@modules/couples/constants/couple.constant';
import { NODE_ERROR } from '@modules/nodes/constants/node.constant';
import { NodeService } from '@modules/nodes/services/node.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('NodeService.attachMemberToTree', () => {
  const transaction = {} as any;

  const nodeRepository = {
    findByUserId: jest.fn(),
    findByParentId: jest.fn(),
    create: jest.fn(),
    incrementMembers: jest.fn(),
  };

  const coupleRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
  };

  const userRepository = {
    findByPk: jest.fn(),
  };

  let service: NodeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NodeService(
      nodeRepository as any,
      coupleRepository as any,
      userRepository as any,
    );
  });

  it('returns null when parentUserId is not provided', async () => {
    const result = await service.attachMemberToTree('new-user-id', undefined, transaction);

    expect(result).toBeNull();
    expect(nodeRepository.create).not.toHaveBeenCalled();
  });

  it('creates node and couple under parent user', async () => {
    userRepository.findByPk.mockResolvedValue({ id: 'parent-user-id' });
    nodeRepository.findByUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'parent-node-id' });
    nodeRepository.findByParentId.mockResolvedValue(null);
    coupleRepository.findByUserId.mockResolvedValue({ level: 1 });
    nodeRepository.create.mockResolvedValue({ id: 'child-node-id' });
    coupleRepository.create.mockResolvedValue({ id: 'couple-id' });

    const result = await service.attachMemberToTree(
      'new-user-id',
      'parent-user-id',
      transaction,
    );

    expect(nodeRepository.create).toHaveBeenCalledWith(
      {
        user_id: 'new-user-id',
        father_id: 'parent-node-id',
        members: 1,
        is_active: true,
      },
      { transaction },
    );
    expect(coupleRepository.create).toHaveBeenCalledWith(
      {
        user_id: 'new-user-id',
        node_id: 'child-node-id',
        level: 2,
        is_active: true,
      },
      { transaction },
    );
    expect(nodeRepository.incrementMembers).toHaveBeenCalledWith('parent-node-id', transaction);
    expect(result).toEqual({
      nodeId: 'child-node-id',
      coupleId: 'couple-id',
      level: 2,
      parentNodeId: 'parent-node-id',
      parentUserId: 'parent-user-id',
    });
  });

  it('uses ROOT_TREE_LEVEL when parent couple is missing', async () => {
    userRepository.findByPk.mockResolvedValue({ id: 'parent-user-id' });
    nodeRepository.findByUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'parent-node-id' });
    nodeRepository.findByParentId.mockResolvedValue(null);
    coupleRepository.findByUserId.mockResolvedValue(null);
    nodeRepository.create.mockResolvedValue({ id: 'child-node-id' });
    coupleRepository.create.mockResolvedValue({ id: 'couple-id' });

    const result = await service.attachMemberToTree(
      'new-user-id',
      'parent-user-id',
      transaction,
    );

    expect(result?.level).toBe(ROOT_TREE_LEVEL + 1);
  });

  it('rejects attaching to self', async () => {
    await expect(
      service.attachMemberToTree('same-id', 'same-id', transaction),
    ).rejects.toThrow(new BadRequestException(NODE_ERROR.CANNOT_ATTACH_TO_SELF));
  });

  it('rejects when parent user not found', async () => {
    userRepository.findByPk.mockResolvedValue(null);

    await expect(
      service.attachMemberToTree('new-user-id', 'missing-parent', transaction),
    ).rejects.toThrow(new NotFoundException(NODE_ERROR.PARENT_USER_NOT_FOUND));
  });

  it('rejects when parent has no node (BR-072)', async () => {
    userRepository.findByPk.mockResolvedValue({ id: 'parent-user-id' });
    nodeRepository.findByUserId.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    await expect(
      service.attachMemberToTree('new-user-id', 'parent-user-id', transaction),
    ).rejects.toThrow(new NotFoundException(NODE_ERROR.PARENT_NODE_NOT_FOUND));
  });

  it('rejects when parent already has a direct child', async () => {
    userRepository.findByPk.mockResolvedValue({ id: 'parent-user-id' });
    nodeRepository.findByUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'parent-node-id' });
    nodeRepository.findByParentId.mockResolvedValue({ id: 'existing-child-node' });

    await expect(
      service.attachMemberToTree('new-user-id', 'parent-user-id', transaction),
    ).rejects.toThrow(new ConflictException(NODE_ERROR.PARENT_ALREADY_HAS_CHILD));
  });

  it('rejects when new user already has a node (BR-001)', async () => {
    userRepository.findByPk.mockResolvedValue({ id: 'parent-user-id' });
    nodeRepository.findByUserId.mockResolvedValueOnce({ id: 'existing-node' });

    await expect(
      service.attachMemberToTree('new-user-id', 'parent-user-id', transaction),
    ).rejects.toThrow(new ConflictException(NODE_ERROR.USER_ALREADY_HAS_NODE));
  });
});

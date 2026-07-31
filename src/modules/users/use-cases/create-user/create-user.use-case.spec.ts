import { CreateUserUseCase } from '@modules/users/use-cases/create-user/create-user.use-case';
import { CreatedUserAdminRequestDto } from '@modules/users/dto/create-member.request.dto';
import { USER_ERROR } from '@modules/users/constants/user.constant';
import { ConflictException } from '@nestjs/common';

describe('CreateUserUseCase', () => {
  const dto: CreatedUserAdminRequestDto = {
    fullname: 'Nguyen Van A',
    email: 'member@example.com',
    password: 'secret123',
    phone: '0919528956',
  };

  const createdUser = {
    id: 'user-uuid',
    fullname: dto.fullname,
    ascii_name: 'nguyen-van-a',
    email: dto.email,
    phone: dto.phone,
    password_hash: 'hashed-value',
    is_root: false,
    status: true,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  };

  const treeAttachment = {
    nodeId: 'node-uuid',
    coupleId: 'couple-uuid',
    couple_order: 2,
    parentNodeId: 'parent-node-uuid',
    parentUserId: 'parent-user-uuid',
  };

  const userService = {
    createMember: jest.fn(),
    resolveRoleId: jest.fn(),
  };

  const userRolesRepository = {
    assignRole: jest.fn(),
  };

  const family_memberservice = {
    attachMemberToTree: jest.fn(),
  };

  const baseTransactionService = {
    runInTransaction: jest.fn(async (fn) => fn({})),
  };

  let useCase: CreateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateUserUseCase(
      userService as any,
      userRolesRepository as any,
      family_memberservice as any,
      baseTransactionService as any,
    );
    userService.createMember.mockResolvedValue(createdUser);
    userService.resolveRoleId.mockResolvedValue('role-uuid');
    userRolesRepository.assignRole.mockResolvedValue(undefined);
    family_memberservice.attachMemberToTree.mockResolvedValue(null);
  });

  it('creates member, assigns role, and returns safe response without password fields', async () => {
    const result = await useCase.execute(dto);

    expect(userService.createMember).toHaveBeenCalledWith(dto, expect.any(Object));
    expect(userService.resolveRoleId).toHaveBeenCalledWith(undefined);
    expect(userRolesRepository.assignRole).toHaveBeenCalledWith('user-uuid', 'role-uuid', expect.any(Object));
    expect(family_memberservice.attachMemberToTree).toHaveBeenCalledWith('user-uuid', undefined, expect.any(Object));
    expect(result).toMatchObject({
      id: 'user-uuid',
      fullname: dto.fullname,
      email: dto.email,
      roleId: 'role-uuid',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('password_hash');
  });

  it('attaches member to family tree when parentUserId is provided', async () => {
    family_memberservice.attachMemberToTree.mockResolvedValue(treeAttachment);

    const result = await useCase.execute({ ...dto, parentUserId: 'parent-user-uuid' });

    expect(family_memberservice.attachMemberToTree).toHaveBeenCalledWith(
      'user-uuid',
      'parent-user-uuid',
      expect.any(Object),
    );
    expect(result).toMatchObject({
      nodeId: 'node-uuid',
      coupleId: 'couple-uuid',
      couple_order: 2,
      parentNodeId: 'parent-node-uuid',
      parentUserId: 'parent-user-uuid',
    });
  });

  it('uses provided roleId when supplied', async () => {
    await useCase.execute({ ...dto, roleId: 'custom-role-id' });

    expect(userService.resolveRoleId).toHaveBeenCalledWith('custom-role-id');
    expect(userRolesRepository.assignRole).toHaveBeenCalledWith('user-uuid', 'role-uuid', expect.any(Object));
  });

  it('propagates conflict when email already exists', async () => {
    userService.createMember.mockRejectedValue(new ConflictException(USER_ERROR.EMAIL_EXISTS));

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(userRolesRepository.assignRole).not.toHaveBeenCalled();
    expect(family_memberservice.attachMemberToTree).not.toHaveBeenCalled();
  });
});

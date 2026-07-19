import { UserService } from '@modules/users/services/user.service';
import { CreatedUserAdminRequestDto } from '@modules/users/dto/create-member.request.dto';
import { USER_ERROR } from '@modules/users/constants/user.constant';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UserService.createMember (PR-081)', () => {
  const dto: CreatedUserAdminRequestDto = {
    fullname: 'Nguyen Van A',
    email: 'member@example.com',
    password: 'secret123',
    phone: '0919528956',
  };

  const userRepository = {
    existsByEmail: jest.fn(),
    existsByPhone: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findByOneByRaw: jest.fn(),
    update: jest.fn(),
    checkExistsField: jest.fn(),
  };

  const passwordService = {
    hashPassword: jest.fn(),
  };

  const roleRepository = {
    findOneByField: jest.fn(),
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new UserService(
      {} as any,
      userRepository as any,
      {} as any,
      userRepository as any,
      { delCache: jest.fn(), get: jest.fn(), set: jest.fn() } as any,
      passwordService as any,
      roleRepository as any,
    );

    userRepository.existsByEmail.mockResolvedValue(false);
    userRepository.existsByPhone.mockResolvedValue(false);
    passwordService.hashPassword.mockResolvedValue('argon2-hashed-password');
    userRepository.create.mockResolvedValue({
      id: 'user-uuid',
      fullname: dto.fullname,
      ascii_name: 'nguyen-van-a',
      email: dto.email,
      phone: dto.phone,
      password_hash: 'argon2-hashed-password',
      is_root: false,
      is_active: true,
    });
  });

  it('hashes password before persisting (PR-081)', async () => {
    await service.createMember(dto);

    expect(passwordService.hashPassword).toHaveBeenCalledWith('secret123');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullname: dto.fullname,
        ascii_name: 'nguyen-van-a',
        password_hash: 'argon2-hashed-password',
      }),
      expect.any(Object),
    );

    const persistedPayload = userRepository.create.mock.calls[0][0];
    expect(persistedPayload).not.toHaveProperty('password');
    expect(persistedPayload.password_hash).not.toBe('secret123');
  });

  it('stores hash verifiable by argon2', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    passwordService.hashPassword.mockImplementation(async (password: string) => argon2.hash(password));

    await service.createMember(dto);

    const hash = userRepository.create.mock.calls[0][0].password_hash;
    await expect(argon2.verify(hash, dto.password)).resolves.toBe(true);
  });

  it('throws conflict when email exists', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(service.createMember(dto)).rejects.toThrow(
      new ConflictException(USER_ERROR.EMAIL_EXISTS),
    );
    expect(passwordService.hashPassword).not.toHaveBeenCalled();
  });

  it('throws conflict when phone exists', async () => {
    userRepository.existsByPhone.mockResolvedValue(true);

    await expect(service.createMember(dto)).rejects.toThrow(
      new ConflictException(USER_ERROR.PHONE_EXISTS),
    );
    expect(passwordService.hashPassword).not.toHaveBeenCalled();
  });
});

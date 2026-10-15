import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterServiceImpl from './register.service.impl.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import User from '../../models/user.model.js';
import UserRole from '../../models/enum/userRole.js';

const mockRepo: UserRepository = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findByCuit: vi.fn(),
  updatePassword: vi.fn(),
};

const validData = {
  name: 'Juan',
  lastName: 'Perez',
  dni: '12345678',
  email: 'juan@test.com',
  password: '123456',
};

function makeUser(id?: number): User {
  return new User(
    id ?? 1,
    'Juan',
    'Perez',
    '12345678',
    'juan@test.com',
    'hashed',
    UserRole.USER,
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  );
}

describe('RegisterServiceImpl', () => {
  let service: RegisterServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RegisterServiceImpl(mockRepo);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepo.create).mockResolvedValue(makeUser());

      const result = await service.register(validData);

      expect(result).toEqual({
        id: 1,
        name: 'Juan',
        lastName: 'Perez',
        email: 'juan@test.com',
        role: UserRole.USER,
      });
    });

    it('should throw if name is too short', async () => {
      await expect(service.register({ ...validData, name: 'A' }))
        .rejects.toThrow('Name must be at least 2 characters');
    });

    it('should throw if lastName is too short', async () => {
      await expect(service.register({ ...validData, lastName: 'B' }))
        .rejects.toThrow('Last name must be at least 2 characters');
    });

    it('should throw if email format is invalid', async () => {
      await expect(service.register({ ...validData, email: 'invalido' }))
        .rejects.toThrow('Invalid email format');
    });

    it('should throw if password is too short', async () => {
      await expect(service.register({ ...validData, password: '123' }))
        .rejects.toThrow('Password must be at least 6 characters');
    });

    it('should throw if DNI is not 7 or 8 digits', async () => {
      await expect(service.register({ ...validData, dni: '123' }))
        .rejects.toThrow('DNI must be 7 or 8 digits');
    });

    it('should throw if CUIT format is invalid', async () => {
      await expect(service.register({ ...validData, cuit: '123' }))
        .rejects.toThrow('Invalid CUIT format');
    });

    it('should throw if email already exists', async () => {
      vi.mocked(mockRepo.findByEmail).mockResolvedValue(makeUser());

      await expect(service.register(validData))
        .rejects.toThrow('Email already registered');
    });

    it('should throw if CUIT already exists', async () => {
      vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepo.findByCuit).mockResolvedValue(makeUser());

      await expect(service.register({ ...validData, cuit: '20-12345678-1' }))
        .rejects.toThrow('CUIT already registered');
    });
  });
});

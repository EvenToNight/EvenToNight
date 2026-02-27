import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/tickets/application/services/user.service';
import { USER_REPOSITORY } from 'src/tickets/domain/repositories/user.repository.interface';
import { UserNotFoundException } from 'src/tickets/domain/exceptions/user-not-found.exception';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<{ findById: jest.Mock }>;

  beforeEach(async () => {
    repository = { findById: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: repository },
      ],
    }).compile();
    service = module.get(UserService);
  });

  describe('getUserLanguage', () => {
    describe('Given the user does not exist', () => {
      it('throws UserNotFoundException (covers line 21)', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
          service.getUserLanguage('non-existent-user'),
        ).rejects.toThrow(UserNotFoundException);
      });
    });
  });
});

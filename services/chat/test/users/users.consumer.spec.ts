import 'reflect-metadata';
import { UserConsumer } from '../../src/users/consumers/users.consumer';

describe('UserConsumer', () => {
  let usersService: {
    upsertUser: jest.Mock;
    updateUser: jest.Mock;
    deleteUser: jest.Mock;
  };
  let participantModel: {
    updateMany: jest.Mock;
  };
  let consumer: UserConsumer;

  const ack = jest.fn();
  const nack = jest.fn();

  const createContext = (routingKey?: string) => {
    const message = { fields: { routingKey } };
    return {
      getChannelRef: () => ({ ack, nack }),
      getMessage: () => message,
    } as never;
  };

  beforeEach(() => {
    ack.mockReset();
    nack.mockReset();

    usersService = {
      upsertUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    participantModel = {
      updateMany: jest.fn(),
    };

    consumer = new UserConsumer(
      usersService as never,
      participantModel as never,
    );
  });

  it('handles user.created and acknowledges message', async () => {
    const payload = {
      payload: {
        id: 'u1',
        role: 'member',
        name: 'Alice',
        avatar: 'a.jpg',
      },
    };

    await consumer.handleEvent(payload, createContext('user.created'));

    expect(usersService.upsertUser).toHaveBeenCalledWith(payload.payload);
    expect(ack).toHaveBeenCalledTimes(1);
    expect(nack).not.toHaveBeenCalled();
  });

  it('handles user.updated and updates participant names when name exists', async () => {
    usersService.updateUser.mockResolvedValue({ id: 'u1' });

    const payload = {
      payload: {
        id: 'u1',
        name: 'Alice Updated',
        avatar: 'new.jpg',
      },
    };

    await consumer.handleEvent(payload, createContext('user.updated'));

    expect(usersService.updateUser).toHaveBeenCalledWith('u1', {
      name: 'Alice Updated',
      avatar: 'new.jpg',
    });
    expect(participantModel.updateMany).toHaveBeenCalledWith(
      { userId: 'u1' },
      { $set: { userName: 'Alice Updated' } },
    );
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('handles user.updated without name and skips participant update', async () => {
    usersService.updateUser.mockResolvedValue({ id: 'u1' });

    const payload = {
      payload: {
        id: 'u1',
        avatar: 'new.jpg',
      },
    };

    await consumer.handleEvent(payload, createContext('user.updated'));

    expect(usersService.updateUser).toHaveBeenCalledWith('u1', {
      avatar: 'new.jpg',
    });
    expect(participantModel.updateMany).not.toHaveBeenCalled();
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('handles user.deleted and acknowledges message', async () => {
    await consumer.handleEvent(
      { payload: { id: 'u1' } },
      createContext('user.deleted'),
    );

    expect(usersService.deleteUser).toHaveBeenCalledWith('u1');
    expect(ack).toHaveBeenCalledTimes(1);
  });

  it('acknowledges and returns for unknown routing key', async () => {
    await consumer.handleEvent(
      { payload: { id: 'u1' } },
      createContext('other'),
    );

    expect(ack).toHaveBeenCalledTimes(1);
    expect(usersService.upsertUser).not.toHaveBeenCalled();
    expect(usersService.updateUser).not.toHaveBeenCalled();
    expect(usersService.deleteUser).not.toHaveBeenCalled();
  });

  it('nacks message when handler throws', async () => {
    await consumer.handleEvent(
      { payload: { role: 'member' } },
      createContext('user.created'),
    );

    expect(nack).toHaveBeenCalledTimes(1);
    expect(nack).toHaveBeenCalledWith(
      expect.objectContaining({ fields: { routingKey: 'user.created' } }),
      false,
      false,
    );
  });
});

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const setupTestDatabase = async (): Promise<string> => {
  mongod = await MongoMemoryServer.create();
  return mongod.getUri();
};

export const teardownTestDatabase = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop();
  }
};

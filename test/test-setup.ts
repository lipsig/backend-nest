import { MongoMemoryServer } from 'mongodb-memory-server';

// Increase timeout for database operations
jest.setTimeout(30000);

let mongod: MongoMemoryServer;

// Global test setup
beforeAll(async () => {
  // Start single MongoDB instance for all tests
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
});

afterAll(async () => {
  // Cleanup MongoDB instance
  if (mongod) {
    await mongod.stop();
  }
});

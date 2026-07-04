// Global Jest setup
import 'reflect-metadata';
import 'jest-extended';

// Set default test timeout
jest.setTimeout(10000);

// You can add global mocks or configurations here

// Provide a default DATABASE_URL for integration tests when not set in CI/dev
if (!process.env.DATABASE_URL) {
	// Use a file-based SQLite DB for tests to allow Prisma client initialization
	process.env.DATABASE_URL = 'file:./prisma-test.db';
}

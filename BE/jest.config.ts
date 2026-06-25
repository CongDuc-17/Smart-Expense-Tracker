// export default {
//   preset: 'ts-jest',           // Dùng ts-jest để hiểu TypeScript
//   testEnvironment: 'node',     // Môi trường Node.js
//   testMatch: ['**/tests/**/*.spec.ts'], // Nơi chứa các file test
//   moduleNameMapper: {
//     '^src/(.*)$': '<rootDir>/src/$1',   // Cho phép import ngắn gọn: import {...} from 'src/...'
//   },
// };

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  
  // Module paths
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.ts',
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
  ],
  
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Transform
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // Clear mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  verbose: true,
};

export default config;
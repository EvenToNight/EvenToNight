/** @type {import('jest').Config} */
module.exports = {
  projects: [
    '<rootDir>/test/unit/jest-unit.json',
    '<rootDir>/test/integration/jest-integration.json',
    '<rootDir>/test/e2e/jest-e2e.json',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/tickets/application/constants.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  testTimeout: 30000,
};

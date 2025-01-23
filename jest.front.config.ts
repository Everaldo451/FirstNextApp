import type {Config} from 'jest';
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/__tests__/api']
};

export default createJestConfig(config);

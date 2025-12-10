import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/components/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageProvider: 'v8',
  // see: https://jestjs.io/docs/next/configuration#extensionstotreatasesm-arraystring
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jest-environment-jsdom',
};

export default createJestConfig(customJestConfig);

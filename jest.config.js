module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  setupFiles: ['react-app-polyfill/jsdom', './src/setupTests.ts'],
  setupFilesAfterEnv: ['./src/setupTestsAfterEnv.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(gql|graphql)$': 'jest-transform-graphql',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
}

module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist",
    "<rootDir>/cypress",
  ],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
  preset: "@shelf/jest-mongodb",
  transform: { "\\.ts$": ["ts-jest"], "\\.tsx$": ["ts-jest"] },
  testTimeout: 20000,
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["/node_modules/(?!@etherdata-blockchain)"],
};

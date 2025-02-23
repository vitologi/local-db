/* eslint-disable */
// See: https://jestjs.io/docs/en/configuration.html

export default {
    collectCoverage: true,
    collectCoverageFrom: [
        "src/{models,utils}/**/*.ts",
        "!src/**/index.ts"
    ],
    coverageThreshold: {
        global: { lines: 50 },  // TODO: set 90+
    },
    preset: "ts-jest",
    testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
    setupFiles:['<rootDir>/jest.setup.js'],
    verbose: true
};
// TODO: find out how testMatch works

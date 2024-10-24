module.exports = {
    transform: {
      "^.+\\.(js|jsx|mjs)$": "jest-esm-transformer", // Use the transformer for JS and JSX files
    },
    testEnvironment: "jsdom",
  };
  
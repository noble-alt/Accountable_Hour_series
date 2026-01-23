const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3000',
  },
  reporter: [['list']],
});

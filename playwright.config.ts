import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './src/utils/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'services',
      testMatch: /tests\/student\/service\/.*\.spec\.ts/,
      testIgnore: [/.*application-status\.spec\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/student.json',
      },
    },
    {
      name: 'service-status',
      testMatch: /tests\/student\/service\/application-status\.spec\.ts/,
      dependencies: ['services'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/student.json',
      },
    },
    {
      name: 'student',
      testMatch: /tests\/student\/(?!service\/).*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/student.json',
      },
    },
    {
      name: 'chromium',
      testIgnore: [/tests\/student\/.*\.spec\.ts/, /.*\.setup\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

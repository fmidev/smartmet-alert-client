import { type PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Put your chromium-specific args here
          args: ['--disable-web-security', '--allow-file-access-from-files'],
        },
      },
    },
  ],
};
export default config;


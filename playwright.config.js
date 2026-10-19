import { defineConfig } from "@playwright/test";

const chrome = "/usr/bin/google-chrome";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:8741",
    launchOptions: { executablePath: chrome, args: ["--no-sandbox"] },
  },
  webServer: {
    command: "python3 -m http.server 8741 --bind 127.0.0.1",
    url: "http://127.0.0.1:8741",
    reuseExistingServer: true,
    timeout: 20000,
  },
});

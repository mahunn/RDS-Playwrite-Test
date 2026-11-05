import fs from 'fs';
import path from 'path';
import { test as setup } from '../src/fixtures/base';
import { Browser } from '@playwright/test';
import { RdsLoginPage } from '../src/pages/RdsLoginPage';
import { BASE_URL } from '../src/utils/config';
import studentData from './data/rds-student-data.json';
import testUsers from './data/test-users.json';

const authDir = path.resolve('playwright/.auth');
const MAX_SESSION_AGE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Checks whether an existing storageState session is still valid and fresh.
 * If fresh (< 5 mins) and active, skips re-login.
 * If absent, stale, or expired, performs a fresh login and saves the state.
 */
async function ensureAuthenticated(
  browser: Browser,
  user: { username: string; password: string; twofaCode?: string },
  authFileName: string,
  extraCopies: string[] = []
): Promise<void> {
  const authFilePath = path.join(authDir, authFileName);

  if (fs.existsSync(authFilePath)) {
    try {
      const stats = fs.statSync(authFilePath);
      const isFresh = Date.now() - stats.mtimeMs < MAX_SESSION_AGE_MS;

      if (isFresh) {
        const probeContext = await browser.newContext({
          storageState: authFilePath,
          baseURL: BASE_URL,
        });
        const probePage = await probeContext.newPage();
        await probePage.goto('students/landing', { timeout: 10000 });
        await probePage.waitForLoadState('domcontentloaded');

        if (probePage.url().includes('students/landing')) {
          // Session is already authenticated and actively valid!
          await probePage.close();
          await probeContext.close();

          for (const copyName of extraCopies) {
            fs.copyFileSync(authFilePath, path.join(authDir, copyName));
          }
          return;
        }
        await probePage.close();
        await probeContext.close();
      }
    } catch {
      // Probe failed, fall through to login
    }
  }

  // Not cached or session expired: perform fresh login
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  const loginPage = new RdsLoginPage(page);
  await loginPage.goto();
  await loginPage.loginAsStudent(user);
  await context.storageState({ path: authFilePath });
  await context.close();

  for (const copyName of extraCopies) {
    fs.copyFileSync(authFilePath, path.join(authDir, copyName));
  }
}

setup('authenticate student sessions globally', async ({ browser }) => {
  setup.slow();

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Verify and reuse existing sessions, only logging in when needed
  await Promise.all([
    ensureAuthenticated(browser, studentData.student, 'student.json'),
    ensureAuthenticated(browser, studentData.eligibleExclusionStudent, 'senior-student.json'),
    ensureAuthenticated(browser, studentData.eligibleInclusionStudent, 'inclusion-student.json', [
      'leave-student.json',
      'semester-drop-student.json',
    ]),
    ensureAuthenticated(browser, studentData.unlockIdStudent, 'unlock-student.json'),
    ensureAuthenticated(
      browser,
      { username: testUsers.student.username, password: testUsers.student.password },
      'profile-student.json'
    ),
  ]);
});

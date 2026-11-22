import { test, expect } from '../src/fixtures/base';
import { LoginPage } from '../src/pages/LoginPage';

test.describe('RDS Portal Environment Baseline @smoke', () => {
  test('NSU RDS login portal loads and displays sign-in controls', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify page title and header
    await expect(page).toHaveTitle(/NSU Portal/);
    await expect(loginPage.brandHeading).toBeVisible();

    // Verify authentication form controls
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEmpty();
    await expect(loginPage.nextButton).toBeVisible();
    await expect(loginPage.nextButton).toBeDisabled();

    // Verify entering username enables the next button
    await loginPage.fillUsername('2421354');
    await expect(loginPage.nextButton).toBeEnabled();

    // Verify auxiliary elements
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.serverTime).toBeVisible();
  });
});

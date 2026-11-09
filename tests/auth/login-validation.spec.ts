import { test, expect } from '../../src/fixtures/base';
import { LoginPage } from '../../src/pages/LoginPage';
import { BASE_URL } from '../../src/utils/config';

test.describe('RDS Authentication Validation & Navigation', () => {
  test('empty username triggers required field constraint and keeps submit disabled @validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify username input is required and empty by default
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEmpty();

    const isRequired = await loginPage.usernameInput.evaluate(
      (el: HTMLInputElement) => el.required
    );
    expect(isRequired).toBe(true);

    const isValueMissing = await loginPage.usernameInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing
    );
    expect(isValueMissing).toBe(true);

    // Next button is disabled when username is empty to prevent invalid submission
    await expect(loginPage.nextButton).toBeDisabled();

    // Verify URL remains on the login page without navigating away
    await expect(page).toHaveURL(new RegExp(BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  test('navigates to forgot password page @navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.forgotPasswordLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Verify destination URL
    await expect(page).toHaveURL(/forgetPassword/);
  });
});

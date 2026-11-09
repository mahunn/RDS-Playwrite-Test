import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { RdsFacultyDashboardPage } from './RdsFacultyDashboardPage';
import { RdsStudentLandingPage } from './RdsStudentLandingPage';

export class RdsLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly nextButton: Locator;
  readonly passwordInput: Locator;
  readonly twoFaInput: Locator;
  readonly loginButton: Locator;
  readonly takeoverYesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page
      .getByRole('textbox', { name: /NSU ID|username/i })
      .or(this.page.getByPlaceholder(/enter (your )?(nsu id|username)/i));
    this.nextButton = this.page.getByRole('button', { name: /Next/i });
    this.passwordInput = this.page
      .getByLabel(/^Password$/i)
      .or(this.page.getByPlaceholder(/enter (your )?password/i));
    this.twoFaInput = this.page.getByPlaceholder(/enter (authentication code|verification code|2fa)/i);
    this.loginButton = this.page.getByRole('button', { name: /Login/i });
    this.takeoverYesButton = this.page.getByRole('button', { name: /Yes/i }).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('');
    await this.waitForReady();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.nextButton.click();
    await this.passwordInput.waitFor({ state: 'visible' });
  }

  async enterPasswordAndSubmit(password: string, twofaCode?: string): Promise<void> {
    await this.passwordInput.fill(password);
    if (twofaCode !== undefined && (await this.twoFaInput.isVisible())) {
      await this.twoFaInput.fill(twofaCode);
    }
    await this.loginButton.click();
    await this.waitForReady();

    // If duplicate session takeover prompt appears (either via modal or confirmTakeover route)
    try {
      const reachedTakeover = await Promise.race([
        this.page.waitForURL(/confirmTakeover/, { timeout: 3000 }).then(() => true).catch(() => false),
        this.takeoverYesButton.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
      ]);

      if (reachedTakeover || this.page.url().includes('confirmTakeover') || (await this.takeoverYesButton.isVisible())) {
        await this.takeoverYesButton.click();
        await this.waitForReady();
      }
    } catch {
      // Continue if no takeover prompt appears
    }
  }

  async loginAsFaculty(user: { username: string; password: string }): Promise<RdsFacultyDashboardPage> {
    await this.enterUsername(user.username);
    await this.enterPasswordAndSubmit(user.password);
    return new RdsFacultyDashboardPage(this.page);
  }

  async loginAsStudent(user: {
    username: string;
    password: string;
    twofaCode?: string;
  }): Promise<RdsStudentLandingPage> {
    await this.enterUsername(user.username);
    await this.enterPasswordAndSubmit(user.password, user.twofaCode);
    return new RdsStudentLandingPage(this.page);
  }

  async loginAs(user: { username: string; password: string }): Promise<RdsFacultyDashboardPage> {
    return this.loginAsFaculty(user);
  }
}

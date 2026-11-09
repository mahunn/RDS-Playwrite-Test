import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly nextButton: Locator;
  readonly brandHeading: Locator;
  readonly brandSubtitle: Locator;
  readonly forgotPasswordLink: Locator;
  readonly serverTime: Locator;

  readonly passwordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly sessionOverrideYesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page
      .getByRole('textbox', { name: /NSU ID|username/i })
      .or(page.getByPlaceholder(/enter (your )?(nsu id|username)/i));
    this.nextButton = page.getByRole('button', { name: /Next/i });
    this.brandHeading = page.getByRole('heading', { name: /North South University|RDS/i });
    this.brandSubtitle = page.getByText(/Online Portal \(RDS\)/i);
    this.forgotPasswordLink = page.getByRole('link', { name: /Forgot (your )?password\??/i }).first();
    this.serverTime = page.locator('.auth-meta__time, [data-auth-clock], #txt').first();
    this.passwordInput = page
      .getByLabel(/^Password$/i)
      .or(page.getByPlaceholder(/enter (your )?password/i));
    this.loginSubmitButton = page.getByRole('button', { name: /Login/i });
    this.sessionOverrideYesButton = page.getByRole('button', { name: /Yes/i }).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('');
    await this.waitForReady();
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
    await this.waitForReady();
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginSubmitButton.click();
    await this.waitForReady();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.clickNext();
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.fillPassword(password);
    await this.clickLogin();

    try {
      const reachedTakeover = await Promise.race([
        this.page.waitForURL(/confirmTakeover/, { timeout: 3000 }).then(() => true).catch(() => false),
        this.sessionOverrideYesButton.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
      ]);

      if (reachedTakeover || this.page.url().includes('confirmTakeover') || (await this.sessionOverrideYesButton.isVisible())) {
        await this.sessionOverrideYesButton.click();
        await this.waitForReady();
      }
    } catch {
      // Continue if no session override prompt appears
    }
  }
}

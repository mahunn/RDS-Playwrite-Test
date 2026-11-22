import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Step 1: Username & Portal Elements
  readonly brandLogo: Locator;
  readonly brandHeading: Locator;
  readonly brandSubtitle: Locator;
  readonly usernameInput: Locator;
  readonly nextButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly serverTime: Locator;

  // Step 2: Password & Authentication Elements
  readonly welcomeHeading: Locator;
  readonly usernameDisplay: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly sessionOverrideYesButton: Locator;

  constructor(page: Page) {
    super(page);

    // Brand and card headers
    this.brandLogo = page.getByText(/^RDS$/i).first();
    this.brandHeading = page
      .getByRole('heading', { name: /NSU Portal : Login|North South University|RDS/i })
      .or(page.getByText(/NSU Portal : Login/i))
      .or(page.getByText(/^RDS$/i));
    this.brandSubtitle = page
      .getByText(/Online Portal \(RDS\)/i)
      .or(page.getByText(/NSU Portal : Login/i));

    // Step 1 locators (Screenshot 1)
    this.usernameInput = page
      .getByLabel(/^Username$/i)
      .or(page.getByPlaceholder(/Please enter your username/i))
      .or(page.getByRole('textbox', { name: /NSU ID|username/i }));
    this.nextButton = page.getByRole('button', { name: /^Next$/i });

    // Step 2 locators (Screenshot 2)
    this.welcomeHeading = page
      .getByRole('heading', { name: /^Welcome$/i })
      .or(page.getByText(/^Welcome$/i));
    this.usernameDisplay = page
      .locator('.welcome-user, .user-id, [data-user-id]')
      .or(page.getByText(/^\d{7,10}$/));
    this.passwordInput = page
      .getByLabel(/^Password$/i)
      .or(page.getByPlaceholder(/Please enter your password/i))
      .or(page.getByPlaceholder(/enter (your )?password/i));
    this.loginSubmitButton = page.getByRole('button', { name: /^Login$/i });

    // Footer & Auxiliary elements
    this.forgotPasswordLink = page
      .getByRole('link', { name: /Forgot (your )?password\??/i })
      .or(page.getByText(/Forgot (your )?password\??/i))
      .first();
    this.serverTime = page
      .getByText(/Current Server Time:/i)
      .or(page.locator('.auth-meta__time, [data-auth-clock], #txt'))
      .first();

    // Session takeover
    this.sessionOverrideYesButton = page.getByRole('button', { name: /^Yes$/i }).first();
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

  /**
   * Completes the 2-step login flow:
   * 1. Enters username -> clicks Next
   * 2. Waits for password input on Step 2
   * 3. Enters password -> clicks Login
   * 4. Handles session takeover if prompted
   */
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

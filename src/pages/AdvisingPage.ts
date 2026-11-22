import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdvisingPage extends BasePage {
  readonly systemHeading: Locator;
  readonly countdownTimer: Locator;
  readonly logoutLink: Locator;

  // Student Info Bar
  readonly studentName: Locator;
  readonly cgpaValue: Locator;

  // Course Taking Input & Form Controls
  readonly courseInputField: Locator;
  readonly saveButton: Locator;
  readonly discardButton: Locator;

  // Saved Courses & Offerings Tables
  readonly savedCoursesTable: Locator;
  readonly totalCreditsSummary: Locator;
  readonly advisingRules: Locator;
  readonly droppingPolicyNotice: Locator;
  readonly sectionChangePolicyNotice: Locator;
  readonly courseOfferingsTable: Locator;

  // Save Confirmation Dialog / Modal Elements
  readonly successMessageModal: Locator;
  readonly modalOkButton: Locator;

  // Drop Confirmation Modals (3-step flow from UI)
  readonly dropModal: Locator;
  readonly yesDropItButton: Locator;
  readonly pleaseConfirmModal: Locator;
  readonly confirmDropYesButton: Locator;
  readonly confirmationMessageModal: Locator;
  readonly confirmationOkButton: Locator;

  constructor(page: Page) {
    super(page);

    this.systemHeading = page.getByText('North South University Online Advising System');
    this.countdownTimer = page.locator('#clockBlock');
    this.logoutLink = page.locator('#topicons a').filter({ hasText: 'Log Out' });

    this.studentName = page.locator('#studentName').or(page.locator('.student-name, [data-student-id]')).first();
    this.cgpaValue = page.locator('#crcgpa').or(page.getByText(/CGPA:/i)).first();

    this.courseInputField = page.locator('#searchText, input[type="text"]').first();
    this.saveButton = page.locator('input[value="Save"], button:has-text("Save")').first();
    this.discardButton = page.locator('input[value="Discard Changes"], button:has-text("Discard Changes")').first();

    this.savedCoursesTable = page.locator('table').first();
    this.totalCreditsSummary = page.locator('tr:has-text("Total:"), td:has-text("Total:")').first();
    this.advisingRules = page.locator('.body, div').filter({ hasText: /Dropping is ALLOWED/i }).first();
    this.droppingPolicyNotice = page.getByText(/Dropping is ALLOWED/i).first();
    this.sectionChangePolicyNotice = page.getByText(/Section change is ALLOWED/i).first();
    this.courseOfferingsTable = page.locator('table').last();

    this.successMessageModal = page
      .locator('.modal, .swal2-popup, .alert, [role="dialog"], #msgBox, div')
      .filter({ hasText: /advising.*save.*success|saved successfully|successfully/i })
      .first();
    this.modalOkButton = page
      .getByRole('button', { name: /^OK$/i })
      .or(page.locator('.swal2-confirm, input[value="OK"], button:has-text("OK"), .modal-footer button'))
      .first();

    // 1. "Drop this course?" -> "Yes, drop it!"
    this.dropModal = page
      .locator('.modal, .swal2-popup, [role="dialog"], div')
      .filter({ hasText: /Drop this course\?/i })
      .first();
    this.yesDropItButton = page
      .getByRole('button', { name: /Yes,\s*drop\s*it!/i })
      .or(page.locator('button:has-text("Yes, drop it!")'))
      .first();

    // 2. "Please Confirm" -> "Yes"
    this.pleaseConfirmModal = page
      .locator('.modal, .swal2-popup, [role="dialog"], div')
      .filter({ hasText: /Please Confirm/i })
      .first();
    this.confirmDropYesButton = page
      .getByRole('button', { name: /^Yes$/i })
      .or(page.locator('button:has-text("Yes")'))
      .first();

    // 3. "Confirmation Message" -> "OK"
    this.confirmationMessageModal = page
      .locator('.modal, .swal2-popup, [role="dialog"], div')
      .filter({ hasText: /Confirmation Message|Advising saved Successfully/i })
      .first();
    this.confirmationOkButton = page
      .getByRole('button', { name: /^OK$/i })
      .or(page.locator('button:has-text("OK")'))
      .first();
  }

  async goto(): Promise<void> {
    await this.page.goto('students/advising');
    await this.waitForReady();
  }

  async searchCourse(courseCode: string): Promise<void> {
    await this.courseInputField.fill(courseCode);
    await this.waitForReady();
  }

  /**
   * Returns locator for a specific course offering item in the right panel (e.g. 'ACT201.1').
   */
  getOfferingItem(courseWithSection: string): Locator {
    return this.page
      .locator('tr, li, div')
      .filter({ hasText: new RegExp(`^\\s*${courseWithSection.replace('.', '\\.')}\\b`) })
      .or(this.page.getByText(courseWithSection))
      .first();
  }

  /**
   * Clicks on a course section from the offerings list to take/select it.
   */
  async selectOffering(courseWithSection: string): Promise<void> {
    const item = this.getOfferingItem(courseWithSection);
    await item.click();
    await this.waitForReady();
  }

  /**
   * Returns the table row representing a taken/advised course in the saved courses slip.
   */
  getSavedCourseRow(courseWithSection: string): Locator {
    return this.savedCoursesTable
      .locator('tr')
      .filter({ hasText: courseWithSection })
      .first();
  }

  /**
   * Returns the drop/delete button (red cross icon) for a taken course row.
   */
  getDropButton(courseWithSection: string): Locator {
    const row = this.getSavedCourseRow(courseWithSection);
    return row
      .locator('img[src*="cross"], img[src*="del"], img[src*="drop"], img[src*="remove"], [title*="Drop"], [title*="Delete"]')
      .or(row.locator('td').last().locator('a, button, input, img'))
      .or(row.locator('a, button').filter({ hasText: /x/i }))
      .first();
  }

  /**
   * Drops a course by clicking its delete/cross icon, then executes the 3-step confirmation popups:
   * 1. Clicks "Yes, drop it!" on "Drop this course?" modal
   * 2. Clicks "Yes" on "Please Confirm" modal ("All courses will be dropped...")
   * 3. Clicks "OK" on "Confirmation Message" modal ("Advising saved Successfully")
   */
  async dropSavedCourse(courseWithSection: string): Promise<void> {
    const dropBtn = this.getDropButton(courseWithSection);
    await dropBtn.click();

    // 1. Click "Yes, drop it!" on "Drop this course?" popup
    await this.yesDropItButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.yesDropItButton.click();

    // 2. Click "Yes" on "Please Confirm" popup ("All courses will be dropped...")
    try {
      if (await this.confirmDropYesButton.isVisible({ timeout: 5000 })) {
        await this.confirmDropYesButton.click();
      }
    } catch {
      // Continue if intermediate modal is not triggered
    }

    // 3. Click "OK" on "Confirmation Message" popup ("Advising saved Successfully")
    try {
      await this.confirmationOkButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmationOkButton.click();
    } catch {
      // In case dismissed or handled
    }

    await this.waitForReady();
  }

  /**
   * Clicks Discard Changes to revert unsaved course selections.
   */
  async clickDiscard(): Promise<void> {
    await this.discardButton.click();
    await this.waitForReady();
  }

  /**
   * Clicks Save button to confirm course advising selections.
   * Automatically accepts any confirmation/success dialog if prompted.
   */
  async clickSave(): Promise<void> {
    const dialogPromise = this.page
      .waitForEvent('dialog', { timeout: 2000 })
      .then(async (d) => {
        await d.accept();
      })
      .catch(() => {});

    await this.saveButton.click();
    await dialogPromise;
    await this.waitForReady();
  }

  /**
   * Clicks Save button and explicitly waits until the "advising save successfully" message arrives
   * (handles both native browser alert and DOM modal), verifies/captures the message,
   * clicks OK, and confirms completion.
   */
  async clickSaveAndWaitForSuccess(timeoutMs = 30000): Promise<string> {
    let capturedMessage = '';

    // 1. Prepare promise to catch native window.alert / window.confirm
    const dialogPromise = this.page
      .waitForEvent('dialog', { timeout: timeoutMs })
      .then(async (dialog) => {
        capturedMessage = dialog.message();
        await dialog.accept(); // Clicks OK button on browser dialog
        return capturedMessage;
      })
      .catch(() => null);

    // 2. Prepare promise to catch DOM modal / alert dialog
    const domModalPromise = this.successMessageModal
      .waitFor({ state: 'visible', timeout: timeoutMs })
      .then(async () => {
        const text = await this.successMessageModal.innerText();
        if (await this.modalOkButton.isVisible()) {
          await this.modalOkButton.click(); // Clicks OK button in DOM modal
        }
        return text;
      })
      .catch(() => null);

    // 3. Click Save button
    await this.saveButton.click();

    // 4. Wait until EITHER native dialog OR DOM modal message appears
    const result = await Promise.race([dialogPromise, domModalPromise]);
    capturedMessage = result || capturedMessage;

    await this.waitForReady();
    return capturedMessage;
  }

  /**
   * Alias for clickSaveAndWaitForSuccess.
   */
  async clickSaveAndConfirm(timeoutMs = 30000): Promise<string> {
    return this.clickSaveAndWaitForSuccess(timeoutMs);
  }
}

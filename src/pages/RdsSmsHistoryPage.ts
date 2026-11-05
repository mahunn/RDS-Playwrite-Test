import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RdsSmsHistoryPage extends BasePage {
  readonly pageHeading: Locator;
  readonly studentInfoParagraph: Locator;
  readonly historyTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly searchInput: Locator;
  readonly entriesSelect: Locator;
  readonly emptyStateMessage: Locator;
  readonly tableInfo: Locator;
  readonly paginationNextButton: Locator;
  readonly paginationPreviousButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page.getByRole('heading', { name: /SMS History/i });
    this.studentInfoParagraph = this.page.locator('.page-content p').first();
    this.historyTable = this.page.locator('#facultyData');
    this.tableHeaders = this.page.locator('#facultyData th');
    this.tableRows = this.page.locator('#facultyData tbody tr');
    this.searchInput = this.page.locator('#facultyData_filter input, input[type="search"]');
    this.entriesSelect = this.page.locator('select[name="facultyData_length"]');
    this.emptyStateMessage = this.page.locator('#facultyData td:has-text("No Faculty Data Found"), #facultyData td:has-text("No records available")');
    this.tableInfo = this.page.locator('#facultyData_info');
    this.paginationNextButton = this.page.locator('#facultyData_next');
    this.paginationPreviousButton = this.page.locator('#facultyData_previous');
  }

  async goto(): Promise<void> {
    await this.page.goto('students/sms_history');
    await this.waitForReady();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForReady();
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.waitForReady();
  }

  async selectEntriesPerPage(count: string): Promise<void> {
    await this.entriesSelect.selectOption(count);
    await this.waitForReady();
  }

  async getHeaderTexts(): Promise<string[]> {
    return await this.tableHeaders.allInnerTexts();
  }

  async getStudentInfoText(): Promise<string> {
    return (await this.studentInfoParagraph.innerText()).trim();
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async isEmptyState(): Promise<boolean> {
    return await this.emptyStateMessage.first().isVisible();
  }
}


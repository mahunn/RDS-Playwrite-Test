import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import { RdsSmsHistoryPage } from '../../../src/pages/RdsSmsHistoryPage';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student SMS History Service', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to SMS History under Services, verifies table structure, student metadata, and search filter @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let smsHistoryPage: RdsSmsHistoryPage;
    await test.step('Navigate to Services -> SMS History', async () => {
      smsHistoryPage = await studentLandingPage.navigateToSmsHistory();
      await expect(page).toHaveURL(/students\/sms_history/);
      await expect(smsHistoryPage.pageHeading).toBeVisible();
      await expect(smsHistoryPage.pageHeading).toContainText(/SMS History/i);
    });

    await test.step('Verify student metadata information', async () => {
      await expect(smsHistoryPage.studentInfoParagraph).toBeVisible();
      await expect(smsHistoryPage.studentInfoParagraph).toContainText(studentData.student.username);
    });

    await test.step('Verify SMS History data table and required column headers', async () => {
      await expect(smsHistoryPage.historyTable).toBeVisible();
      const headers = await smsHistoryPage.getHeaderTexts();
      expect(headers).toContain('No.');
      expect(headers).toContain('Semester');
      expect(headers).toContain('Faculty Code');
      expect(headers).toContain('Send To');
      expect(headers).toContain('Content');
      expect(headers).toContain('Sending Time');
    });

    await test.step('Verify table controls and search filter functionality', async () => {
      await expect(smsHistoryPage.searchInput).toBeVisible();
      await expect(smsHistoryPage.entriesSelect).toBeVisible();

      // Test searching with a query
      await smsHistoryPage.search('TEST_FILTER_QUERY');
      const rowCountAfterSearch = await smsHistoryPage.getRowCount();
      expect(rowCountAfterSearch).toBeGreaterThanOrEqual(1);

      // Clear search to restore default state
      await smsHistoryPage.clearSearch();
      await expect(smsHistoryPage.historyTable).toBeVisible();
    });
  });
});


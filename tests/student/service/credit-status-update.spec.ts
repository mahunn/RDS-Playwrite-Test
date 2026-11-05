import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import creditData from '../../data/credit-status-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Credit/Non-Credit Status Update', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to Credit/Non-Credit under Services, fills and submits form, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let creditStatusPage: any;
    await test.step('Navigate to Services -> Credit/Non Credit Status Update', async () => {
      creditStatusPage = await studentLandingPage.navigateToCreditStatusUpdate();
      await expect(page).toHaveURL(/CreditNonCreditStatusUpdate/);
      await expect(creditStatusPage.pageHeading).toBeVisible();
      await expect(creditStatusPage.creditToNonCreditRadio).toBeVisible();
      await expect(creditStatusPage.nonCreditToCreditRadio).toBeVisible();
    });

    await test.step('Select purpose and wait for courses to populate', async () => {
      await creditStatusPage.selectPurpose(creditData.purpose as 'Credit to Non Credit');
      await expect(creditStatusPage.coursesSelect).toBeVisible();
      const optionsCount = await creditStatusPage.coursesSelect.locator('option').count();
      expect(optionsCount).toBeGreaterThan(0);
    });

    await test.step('Select course and upload signature', async () => {
      const selectedCourse = await creditStatusPage.selectFirstAvailableCourse();
      expect(selectedCourse).not.toBe('');

      const absoluteSigPath = path.resolve(creditData.signatureFile);
      await creditStatusPage.uploadSignature(absoluteSigPath);
      await expect(creditStatusPage.submitButton).toBeVisible();
    });

    await test.step('Submit form and verify response banner', async () => {
      await creditStatusPage.submitForm();
      await expect(page).toHaveURL(/store_request/);
      await expect(creditStatusPage.submissionResponseAlert).toBeVisible();
    });
  });
});

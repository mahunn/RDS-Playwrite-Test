import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import waiverData from '../../data/waiver-course-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Waiver Course Issue Service', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to Waiver Course Issue under Services, fills and submits request form, and verifies response confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let waiverPage: any;
    await test.step('Navigate to Services -> Waiver Course Issue', async () => {
      waiverPage = await studentLandingPage.navigateToWaiverCourse();
      await expect(page).toHaveURL(/studentGeneralRequest/);
      await expect(waiverPage.requestPurposeSelect).toBeVisible();
      await expect(waiverPage.briefDescriptionInput).toBeVisible();
      await expect(waiverPage.signatureInput).toBeVisible();
      await expect(waiverPage.submitButton).toBeVisible();
    });

    await test.step('Fill Waiver Course Issue form and upload signature', async () => {
      await waiverPage.selectRequestPurpose(waiverData.requestType);
      await waiverPage.fillBriefDescription(waiverData.briefDescription);
      await expect(waiverPage.briefDescriptionInput).toHaveValue(waiverData.briefDescription);

      const absoluteSigPath = path.resolve(waiverData.signatureFile);
      await waiverPage.uploadSignature(absoluteSigPath);
    });

    await test.step('Submit form and verify confirmation alert', async () => {
      await waiverPage.submitForm();
      await expect(page).toHaveURL(/store_request/);
      await expect(waiverPage.submissionResponseAlert).toBeVisible();
      await expect(waiverPage.submissionResponseAlert).toContainText(
        /Please wait until all procedures are completed|already in pending Status/i
      );
    });
  });
});

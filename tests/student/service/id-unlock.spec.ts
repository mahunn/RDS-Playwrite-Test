import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import idUnlockData from '../../data/id-unlock-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student ID Unlock Application', () => {
  test.use({ storageState: 'playwright/.auth/unlock-student.json' });

  test('navigates to ID Unlock under Services, fills and submits form, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.unlockIdStudent);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let idUnlockPage: any;
    let isFormAvailable = false;
    await test.step('Navigate to Services -> ID Unlock and verify view state', async () => {
      idUnlockPage = await studentLandingPage.navigateToIdUnlock();
      await expect(page).toHaveURL(/unlockId/);

      const headingOrPending = idUnlockPage.pageHeading.or(idUnlockPage.pendingAlert);
      await expect(headingOrPending.first()).toBeVisible();
      const isPending = await idUnlockPage.pendingAlert.isVisible();
      isFormAvailable = !isPending && (await idUnlockPage.submitButton.isVisible());
    });

    if (isFormAvailable) {
      await test.step('Select ID Unlock For option', async () => {
        await expect(idUnlockPage.unlockTypeSelect).toBeVisible();
        await idUnlockPage.selectUnlockType(idUnlockData.unlockType);
        await expect(idUnlockPage.unlockTypeSelect).toHaveValue(idUnlockData.unlockType);
      });

      await test.step('Fill Brief Description and upload signature', async () => {
        await idUnlockPage.fillDescription(idUnlockData.description);
        await expect(idUnlockPage.briefDescriptionInput).toHaveValue(idUnlockData.description);

        const absoluteSigPath = path.resolve(idUnlockData.signatureFile);
        await idUnlockPage.uploadSignature(absoluteSigPath);
        await expect(idUnlockPage.submitButton).toBeVisible();
      });

      await test.step('Submit form and verify confirmation banner', async () => {
        await idUnlockPage.submitForm();
        await expect(page).toHaveURL(/store_request/);
        await expect(idUnlockPage.confirmationMessage).toBeVisible();
      });
    } else {
      await test.step('Verify existing pending request banner', async () => {
        await expect(idUnlockPage.pendingAlert).toBeVisible();
      });
    }
  });
});

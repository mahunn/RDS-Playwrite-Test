import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import forgotIdData from '../../data/forgot-id-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Forgot RFID Application', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to Forgot RFID under Services, fills and submits form, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let forgotIdPage: any;
    let isFormAvailable = false;
    await test.step('Navigate to Services -> Forgot RFID and verify view state', async () => {
      forgotIdPage = await studentLandingPage.navigateToForgotId();
      await expect(page).toHaveURL(/forgotId/);

      const headingOrPending = forgotIdPage.pageHeading.or(forgotIdPage.pendingAlert);
      await expect(headingOrPending.first()).toBeVisible();
      const isPending = await forgotIdPage.pendingAlert.isVisible();
      isFormAvailable = !isPending && (await forgotIdPage.submitButton.isVisible());
    });

    if (isFormAvailable) {
      await test.step('Select Reason for applying', async () => {
        await expect(forgotIdPage.reasonCombobox).toBeVisible();
        await forgotIdPage.selectReason(forgotIdData.reason);
        const selectedReason = await forgotIdPage.getSelectedReason();
        expect(selectedReason).toContain(forgotIdData.reason);
      });

      await test.step('Fill Description', async () => {
        await forgotIdPage.fillDescription(forgotIdData.description);
        await expect(forgotIdPage.descriptionInput).toHaveValue(forgotIdData.description);
        await expect(forgotIdPage.submitButton).toBeVisible();
      });

      await test.step('Submit form and verify confirmation banner', async () => {
        await forgotIdPage.submitForm();
        await expect(page).toHaveURL(/store_request/);
        await expect(forgotIdPage.confirmationMessage).toBeVisible();
      });
    } else {
      await test.step('Verify existing pending request banner', async () => {
        await expect(forgotIdPage.pendingAlert).toBeVisible();
      });
    }
  });
});

import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import semesterDropData from '../../data/semester-drop-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Semester Drop Application', () => {
  test.use({ storageState: 'playwright/.auth/inclusion-student.json' });

  test('navigates to Semester Drop under Services, fills and submits form, and verifies response @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.eligibleInclusionStudent);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let semesterDropPage: any;
    let isFormAvailable = false;
    await test.step('Navigate to Services -> Semester Drop and verify view state', async () => {
      semesterDropPage = await studentLandingPage.navigateToSemesterDrop();
      await expect(page).toHaveURL(/semesterDrop/);

      const headingOrPending = semesterDropPage.pageHeading.or(semesterDropPage.pendingAlert);
      await expect(headingOrPending.first()).toBeVisible();
      const isPending = await semesterDropPage.pendingAlert.isVisible();
      isFormAvailable = !isPending && (await semesterDropPage.submitButton.isVisible());
    });

    if (isFormAvailable) {
      await test.step('Select Semester and Type of Drop', async () => {
        await expect(semesterDropPage.semesterContainer).toBeVisible();
        await semesterDropPage.selectSemester(semesterDropData.semester);
        await expect(semesterDropPage.semesterContainer).toContainText(semesterDropData.semester);

        await expect(semesterDropPage.dropTypeContainer).toBeVisible();
        await semesterDropPage.selectDropType(semesterDropData.dropType);
        await expect(semesterDropPage.dropTypeContainer).toContainText(semesterDropData.dropType);
      });

      await test.step('Fill Reason to Drop and upload signature', async () => {
        await semesterDropPage.fillReason(semesterDropData.reason);
        await expect(semesterDropPage.reasonTextarea).toHaveValue(semesterDropData.reason);

        const absoluteSigPath = path.resolve(semesterDropData.signatureFile);
        await semesterDropPage.uploadSignature(absoluteSigPath);
        await expect(semesterDropPage.submitButton).toBeVisible();
      });

      await test.step('Submit form and verify confirmation banner', async () => {
        await semesterDropPage.submitForm();
        await expect(page).toHaveURL(/store_request/);
        await expect(semesterDropPage.submissionResponseAlert).toBeVisible();
      });
    } else {
      await test.step('Verify existing pending request banner', async () => {
        await expect(semesterDropPage.pendingAlert).toBeVisible();
      });
    }
  });
});

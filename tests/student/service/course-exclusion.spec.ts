import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import exclusionData from '../../data/course-exclusion-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Course Exclusion Request', () => {
  test.use({ storageState: 'playwright/.auth/senior-student.json' });

  test('navigates to Course Exclusion under Services, fills and submits request form, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.eligibleExclusionStudent);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let courseExclusionPage: any;
    await test.step('Navigate to Services -> Course Exclusion', async () => {
      courseExclusionPage = await studentLandingPage.navigateToCourseExclusion();
      await expect(page).toHaveURL(/CourseExclusion/);
      await expect(courseExclusionPage.pageHeading).toBeVisible();
    });

    let selectedCourseName = '';
    await test.step('Select course to exclude and verify selection badge', async () => {
      await expect(courseExclusionPage.coursesSearchInput).toBeVisible();
      selectedCourseName = await courseExclusionPage.selectCourse(exclusionData.courseCode);
      expect(selectedCourseName).toContain(exclusionData.courseCode);

      const courseBadge = courseExclusionPage.getSelectedCourseBadge(selectedCourseName);
      await expect(courseBadge).toBeVisible();
    });

    await test.step('Fill Brief Description and upload signature', async () => {
      await courseExclusionPage.fillDescription(exclusionData.description);
      await expect(courseExclusionPage.briefDescriptionInput).toHaveValue(exclusionData.description);

      const absoluteSigPath = path.resolve(exclusionData.signatureFile);
      await courseExclusionPage.uploadSignature(absoluteSigPath);
      await expect(courseExclusionPage.submitButton).toBeVisible();
    });

    await test.step('Submit form and verify confirmation banner', async () => {
      await courseExclusionPage.submitForm();
      await expect(page).toHaveURL(/store_request/);
      await expect(courseExclusionPage.confirmationMessage).toBeVisible();
    });
  });
});

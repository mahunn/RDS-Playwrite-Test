import path from 'path';
import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import inclusionData from '../../data/course-inclusion-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Course Inclusion Request', () => {
  test.use({ storageState: 'playwright/.auth/inclusion-student.json' });

  test('navigates to Course Inclusion under Services, fills and submits request form, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.eligibleInclusionStudent);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let courseInclusionPage: any;
    await test.step('Navigate to Services -> Course Inclusion', async () => {
      courseInclusionPage = await studentLandingPage.navigateToCourseInclusion();
      await expect(page).toHaveURL(/CourseInclusion/);
      await expect(courseInclusionPage.pageHeading).toBeVisible();
    });

    let selectedCourseName = '';
    await test.step('Select course to include and verify selection badge', async () => {
      await expect(courseInclusionPage.coursesSearchInput).toBeVisible();
      selectedCourseName = await courseInclusionPage.selectCourse(inclusionData.courseCode);
      expect(selectedCourseName).toContain(inclusionData.courseCode);

      const courseBadge = courseInclusionPage.getSelectedCourseBadge(selectedCourseName);
      await expect(courseBadge).toBeVisible();
    });

    await test.step('Fill Brief Description and upload signature', async () => {
      await courseInclusionPage.fillDescription(inclusionData.description);
      await expect(courseInclusionPage.briefDescriptionInput).toHaveValue(inclusionData.description);

      const absoluteSigPath = path.resolve(inclusionData.signatureFile);
      await courseInclusionPage.uploadSignature(absoluteSigPath);
      await expect(courseInclusionPage.submitButton).toBeVisible();
    });

    await test.step('Submit form and verify confirmation banner', async () => {
      await courseInclusionPage.submitForm();
      await expect(page).toHaveURL(/store_request/);
      await expect(courseInclusionPage.confirmationMessage).toBeVisible();
    });
  });
});

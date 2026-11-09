import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import { RdsCourseRequestPage } from '../../../src/pages/RdsCourseRequestPage';
import studentData from '../../data/rds-student-data.json';
import courseRequestData from '../../data/course-request-data.json';

test.describe('NSU RDS Student Course Request Service', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to Course Request under Services, verifies form layout and validation, and submits course request @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let courseRequestPage: RdsCourseRequestPage;
    await test.step('Navigate to Services -> Course Request', async () => {
      courseRequestPage = await studentLandingPage.navigateToCourseRequest();
      await expect(page).toHaveURL(/common\/feedback\/RequestCourse/);
      await expect(courseRequestPage.pageHeading).toBeVisible();
      await expect(courseRequestPage.pageHeading).toContainText(courseRequestData.expectedHeading);
    });

    await test.step('Verify pre-advised course notice and required form fields', async () => {
      await expect(courseRequestPage.preAdvisedNotice).toBeVisible();
      await expect(courseRequestPage.preAdvisedNotice).toContainText(courseRequestData.expectedNotice);
      await expect(courseRequestPage.courseSelectLabel).toBeVisible();
      await expect(courseRequestPage.courseSelect).toBeVisible();
      const isRequired = await courseRequestPage.isCourseSelectRequired();
      expect(isRequired).toBe(true);
      await expect(courseRequestPage.submitButton).toBeVisible();
    });

    await test.step('Select course and submit course request', async () => {
      const selectedCourse = await courseRequestPage.selectFirstAvailableCourse(
        courseRequestData.testCourseCode
      );
      expect(selectedCourse).not.toBe('');

      await courseRequestPage.submitRequest();
      await expect(page).toHaveURL(/common\/feedback\/SaveRequestedCourses/);
      await expect(courseRequestPage.successAlert).toBeVisible();
      await expect(courseRequestPage.successAlert).toContainText(
        new RegExp(`Your request for the courses ${selectedCourse} will be submitted to your department`, 'i')
      );
    });
  });
});

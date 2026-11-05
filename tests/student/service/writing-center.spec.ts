import { test, expect } from '../../../src/fixtures/base';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import bookingData from '../../data/writing-center-data.json';
import studentData from '../../data/rds-student-data.json';

test.describe('NSU RDS Student Writing Center Service', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test('navigates to NSU Writing Center under Services, books an appointment slot, and verifies confirmation @smoke @critical', async ({
    page,
  }) => {
    test.slow();

    const studentLandingPage = new RdsStudentLandingPage(page);

    await test.step('Navigate to student dashboard', async () => {
      await studentLandingPage.goto(studentData.student);
      await expect(page).toHaveURL(/students\/landing/);
      await expect(studentLandingPage.welcomeHeading).toBeVisible();
    });

    let writingCenterPage: any;
    await test.step('Navigate to Services -> NSU Writing Center', async () => {
      writingCenterPage = await studentLandingPage.navigateToWritingCenter();
      await expect(page).toHaveURL(/writing-centers/);
      await expect(writingCenterPage.pageHeading).toBeVisible();
      await expect(writingCenterPage.appointmentDateInput).toBeVisible();
    });

    await test.step('Select available appointment date and time slot', async () => {
      const selectedDate = await writingCenterPage.selectFirstAvailableDate();
      expect(selectedDate).not.toBe('');

      await expect(writingCenterPage.slotSelect).toBeEnabled();
      const selectedSlot = await writingCenterPage.selectFirstAvailableSlot();
      expect(selectedSlot).not.toBe('');
    });

    await test.step('Select course and assignment type', async () => {
      await writingCenterPage.selectCourse(bookingData.courseName);
      await writingCenterPage.selectAssignmentType(bookingData.assignmentType);
      await expect(writingCenterPage.submitButton).toBeVisible();
    });

    await test.step('Submit appointment booking and verify confirmation', async () => {
      await writingCenterPage.submitBooking();
      await expect(page).toHaveURL(/writing-center-bookings/);
      await expect(writingCenterPage.successAlert).toBeVisible();
      await expect(writingCenterPage.successAlert).toContainText(
        /Your appointment is successfully made|already|booked|pending/i
      );
    });
  });
});

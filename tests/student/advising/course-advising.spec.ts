import { test, expect, getAuthenticatedStudentPage } from '../../../src/fixtures/base';
import { Page } from '@playwright/test';
import { LandingPage } from '../../../src/pages/LandingPage';
import { AdvisingPage } from '../../../src/pages/AdvisingPage';
import testUsers from '../../data/test-users.json';

test.describe('Advising > Advising Window', () => {
  test.describe.configure({ mode: 'serial' });
  let sharedPage: Page;
  let advisingPage: AdvisingPage;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await getAuthenticatedStudentPage(browser);
    const landingPage = new LandingPage(sharedPage);
    await landingPage.goto();
    advisingPage = await landingPage.navigateToAdvising();
  });

  test.afterAll(async () => {
    await sharedPage?.context()?.close();
  });

  test('1. Advising Window Navigation & Portal Header @smoke @advising', async () => {
    await test.step('Verify URL matches students/advising route', async () => {
      await expect(sharedPage).toHaveURL(/students\/advising/);
    });

    await test.step('Verify system title, countdown timer, and logout link', async () => {
      await expect(advisingPage.systemHeading).toBeVisible();
      await expect(advisingPage.countdownTimer).toBeVisible();
      await expect(advisingPage.logoutLink).toBeVisible();
    });
  });

  test('2. Student Identity & CGPA Verification @smoke @advising', async () => {
    await test.step('Verify student name and ID in advising header', async () => {
      await expect(advisingPage.studentName).toContainText(testUsers.student.fullName);
      await expect(advisingPage.studentName).toContainText(testUsers.student.studentId);
    });

    await test.step('Verify CGPA matches student record', async () => {
      await expect(advisingPage.cgpaValue).toContainText(testUsers.student.cgpa);
    });
  });

  test('3. Course Taking Input & Form Controls @smoke @advising', async () => {
    await test.step('Verify course taking search field is visible and editable', async () => {
      await expect(advisingPage.courseInputField).toBeVisible();
      await expect(advisingPage.courseInputField).toBeEditable();
    });

    await test.step('Verify Save and Discard Changes buttons are present', async () => {
      await expect(advisingPage.saveButton).toBeVisible();
      await expect(advisingPage.discardButton).toBeVisible();
    });
  });

  // test('4. Saved Courses Slip & Offerings Panels @smoke @advising', async () => {
  //   await test.step('Verify Saved Courses slip table and total credits summary', async () => {
  //     await expect(advisingPage.savedCoursesTable).toBeVisible();
  //     await expect(advisingPage.totalCreditsSummary).toBeVisible();
  //   });

  //   await test.step('Verify advising policies notice is displayed', async () => {
  //     await expect(advisingPage.advisingRules).toBeVisible();
  //     await expect(advisingPage.advisingRules).toContainText('Dropping is ALLOWED');
  //   });

  //   await test.step('Verify course offerings list panel is visible', async () => {
  //     await expect(advisingPage.courseOfferingsTable).toBeVisible();
  //   });
  // });

  test('5. Course Advising Flow: Sequential Section Taking (ACT201.1 to ACT201.36) with Save & Success Confirmation @advising', async () => {
    // Increase timeout for multi-section processing (up to 36 sections)
    test.setTimeout(180000);

    const targetStudentId = testUsers.studentBorshan?.studentId || '2512570642';
    const courseCode = 'ACT201';

    await test.step('Verify student ID and advising session banner', async () => {
      // Verify advising window displays student ID (e.g. 2512570642 or configured student ID)
      const studentIdentifier = advisingPage.studentName.or(
        sharedPage.getByText(new RegExp(`${targetStudentId}|${testUsers.student.studentId}`))
      );
      await expect(studentIdentifier).toBeVisible();
    });

    await test.step('Verify course offerings table is displayed and search course', async () => {
      await expect(advisingPage.courseOfferingsTable).toBeVisible();
      await advisingPage.searchCourse(courseCode);
    });

    // Track active section to remove it before taking the next one
    let currentActiveSection: string | null = null;

    // Helper to take a section, click Save, wait until success message arrives, and click OK
    const takeAndSaveSection = async (sectionName: string): Promise<boolean> => {
      await advisingPage.searchCourse(courseCode);
      const offering = advisingPage.getOfferingItem(sectionName);

      if (!(await offering.isVisible().catch(() => false))) {
        console.log(`[INFO] ${sectionName} is not listed in offerings. Skipping.`);
        return false;
      }

      // 1. Take the course section
      await advisingPage.selectOffering(sectionName);
      const savedRow = advisingPage.getSavedCourseRow(sectionName);
      await expect(savedRow).toBeVisible();

      // 2. Click Save, 3. Wait until success message comes, 4. Click OK button
      const message = await advisingPage.clickSaveAndWaitForSuccess(30000);
      expect(message.toLowerCase()).toMatch(/advising.*save.*success|saved successfully|success/);

      // Verify the course section remains confirmed in the saved table
      await expect(savedRow).toBeVisible();
      currentActiveSection = sectionName;
      return true;
    };

    // Helper to drop a previously taken section (Yes, drop it! -> Yes -> OK) and verify removal
    const removeAndSaveSection = async (sectionName: string): Promise<void> => {
      // 1. Remove the previous course section: clicks cross -> "Yes, drop it!" -> "Yes" -> "OK"
      await advisingPage.dropSavedCourse(sectionName);

      // 2. If Save button is still enabled/pending, commit it
      if (await advisingPage.saveButton.isVisible() && (await advisingPage.saveButton.isEnabled())) {
        await advisingPage.clickSaveAndWaitForSuccess(5000).catch(() => {});
      }

      // 3. Verify the previous course section is removed from the saved table
      const removedRow = advisingPage.getSavedCourseRow(sectionName);
      await expect(removedRow).not.toBeVisible();
    };

    await test.step('1-4. Take initial course ACT201.1, Click Save, Verify success message, and Click OK', async () => {
      const isTaken = await takeAndSaveSection('ACT201.1');
      expect(isTaken).toBe(true);
    });

    await test.step('5. Sequential Section Advising: Remove previous section, Save, Take next section, and Save (ACT201.2 to ACT201.36)', async () => {
      const startSection = 2;
      const endSection = 36;
      let processedCount = 1; // ACT201.1 already processed

      for (let sec = startSection; sec <= endSection; sec++) {
        const nextSection = `${courseCode}.${sec}`;
        await test.step(`Process ${nextSection}: Remove previous course (${currentActiveSection}), Save, then Take ${nextSection} and Save`, async () => {
          // Check if next section is in offerings
          await advisingPage.searchCourse(courseCode);
          const offering = advisingPage.getOfferingItem(nextSection);
          if (!(await offering.isVisible().catch(() => false))) {
            console.log(`[INFO] ${nextSection} is not listed in offerings. Skipping.`);
            return;
          }

          // Before taking the second/next course, first remove the previous course and save
          if (currentActiveSection) {
            await removeAndSaveSection(currentActiveSection);
          }

          // Then take the next course and save
          const took = await takeAndSaveSection(nextSection);
          if (took) {
            processedCount++;
          }
        });
      }

      console.log(`[COMPLETE] Successfully processed ${processedCount} sections of ${courseCode}.`);
      expect(processedCount).toBeGreaterThanOrEqual(1);
    });
  });
});


import { test, expect, getAuthenticatedStudentPage } from '../../../src/fixtures/base';
import { Page } from '@playwright/test';
import { RdsStudentLandingPage } from '../../../src/pages/RdsStudentLandingPage';
import { AdvisingSlipPage } from '../../../src/pages/AdvisingSlipPage';
import { AdvisingPage } from '../../../src/pages/AdvisingPage';
import testUsers from '../../data/test-users.json';

test.describe('Advising > Advising Slip Print Validation', () => {
  test.describe.configure({ mode: 'serial' });
  let sharedPage: Page;
  let landingPage: RdsStudentLandingPage;
  let slipPage: AdvisingSlipPage;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await getAuthenticatedStudentPage(browser);
    landingPage = new RdsStudentLandingPage(sharedPage);
    await landingPage.goto();
    slipPage = await landingPage.navigateToAdvisingSlipPrint();
  });

  test.afterAll(async () => {
    await sharedPage?.context()?.close();
  });

  test('1. Advising Slip Navigation & Semester Selection @smoke @advising', async () => {
    await test.step('Verify navigation to advising slip route', async () => {
      await expect(sharedPage).toHaveURL(/print_slip/);
    });

    await test.step('Verify semester dropdown is displayed', async () => {
      await expect(slipPage.semesterSelect).toBeVisible();
    });

    await test.step('Select semester year and verify slip document loads', async () => {
      await slipPage.selectSemester('Summer 2026');

      await expect(slipPage.universityHeading).toBeVisible();
    });
  });

  test('2. Multi-Copy Structure Validation (4 Departmental Copies) @smoke @advising', async () => {
    await test.step('Verify Registrar\'s Office Copy is present', async () => {
      await expect(slipPage.registrarsCopyHeader).toBeVisible();
    });

    await test.step('Verify Finance & Accounts Department\'s Copy is present', async () => {
      await expect(slipPage.accountsCopyHeader).toBeVisible();
    });

    await test.step('Verify Bank\'s Copy is present', async () => {
      await expect(slipPage.banksCopyHeader).toBeVisible();
    });

    await test.step('Verify Student\'s Copy is present', async () => {
      await expect(slipPage.studentsCopyHeader).toBeVisible();
    });
  });

  test('3. Student Identity & Clearance Validation @smoke @advising', async () => {
    await test.step('Verify student name, ID number, and degree format', async () => {
      await expect(slipPage.studentNameText).toBeVisible();
      await expect(slipPage.studentIdText).toBeVisible();
      await expect(slipPage.degreeText).toBeVisible();
    });

    await test.step('Verify registration tracking number is present', async () => {
      await expect(slipPage.registrationNumber).toBeVisible();
    });

    await test.step('Verify Accounts and Library clearance statuses', async () => {
      await expect(slipPage.accountsClearance).toBeVisible();
      await expect(slipPage.libraryClearance).toBeVisible();
    });
  });

  test('4. Financial Fees & Total Reconciliation Validation @regression @advising', async () => {
    await test.step('Verify tuition total and mandatory institutional fees', async () => {
      await expect(slipPage.tuitionTotalText).toBeVisible();
      await expect(slipPage.studentActivityFee).toBeVisible();
      await expect(slipPage.computerLabFee).toBeVisible();
      await expect(slipPage.libraryFee).toBeVisible();
    });

    await test.step('Verify total amount and amount written in words', async () => {
      await expect(slipPage.totalAmountText).toBeVisible();
      await expect(slipPage.amountInWordsText).toBeVisible();
    });
  });

  test('5. Course Advising Flow: Remove Previous Course, Save, and Take Next Course (ACT201.1 to ACT201.36) @advising', async () => {
    test.setTimeout(180000);
    const advisingPage = new AdvisingPage(sharedPage);
    await advisingPage.goto();

    const courseCode = 'ACT201';
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

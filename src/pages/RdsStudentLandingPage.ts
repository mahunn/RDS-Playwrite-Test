import * as path from 'path';
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { RdsLoginPage } from './RdsLoginPage';
import { RdsCarParkingPage } from './RdsCarParkingPage';
import { RdsCreditStatusUpdatePage } from './RdsCreditStatusUpdatePage';
import { RdsCourseExclusionPage } from './RdsCourseExclusionPage';
import { RdsCourseInclusionPage } from './RdsCourseInclusionPage';
import { RdsForgotIdPage } from './RdsForgotIdPage';
import { RdsIdUnlockPage } from './RdsIdUnlockPage';
import { RdsLeavePage } from './RdsLeavePage';
import { RdsSemesterDropPage } from './RdsSemesterDropPage';
import { StudentProfilePage } from './StudentProfilePage';
import { ChangePasswordPage } from './ChangePasswordPage';
import { MajorDeclarationPage } from './MajorDeclarationPage';
import { AdvisingPage } from './AdvisingPage';
import { AdvisingSlipPage } from './AdvisingSlipPage';
import { PreAdvisingPage } from './PreAdvisingPage';
import { PreAdvisedCoursesPage } from './PreAdvisedCoursesPage';
import { RdsWaiverCoursePage } from './RdsWaiverCoursePage';
import { RdsWritingCenterPage } from './RdsWritingCenterPage';
import { RdsApplicationStatusPage } from './RdsApplicationStatusPage';
import { RdsSmsHistoryPage } from './RdsSmsHistoryPage';
import { RdsCourseRequestPage } from './RdsCourseRequestPage';
import { RdsGradeHistoryPage } from './RdsGradeHistoryPage';
import { RdsCourseWiseMarksPage } from './RdsCourseWiseMarksPage';
import { RdsAttendancePage } from './RdsAttendancePage';
import { RdsFacultyEvaluationPage } from './RdsFacultyEvaluationPage';
import studentData from '../../tests/data/rds-student-data.json';

export class RdsStudentLandingPage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly activityStatusHeading: Locator;
  readonly servicesMenuLink: Locator;
  readonly carParkingSubmenuLink: Locator;
  readonly creditStatusUpdateSubmenuLink: Locator;
  readonly courseExclusionSubmenuLink: Locator;
  readonly courseInclusionSubmenuLink: Locator;
  readonly forgotIdSubmenuLink: Locator;
  readonly idUnlockSubmenuLink: Locator;
  readonly leaveRequestSubmenuLink: Locator;
  readonly semesterDropSubmenuLink: Locator;
  readonly waiverCourseSubmenuLink: Locator;
  readonly writingCenterSubmenuLink: Locator;
  readonly applicationStatusSubmenuLink: Locator;
  readonly smsHistorySubmenuLink: Locator;
  readonly courseRequestSubmenuLink: Locator;

  readonly profileDropdown: Locator;
  readonly studentInfoLink: Locator;
  readonly changePasswordLink: Locator;
  readonly majorDeclarationLink: Locator;

  readonly advisingDropdown: Locator;
  readonly advisingWindowLink: Locator;
  readonly advisingSlipPrintLink: Locator;
  readonly preAdvisingLink: Locator;
  readonly preAdvisedCoursesLink: Locator;

  readonly gradesDropdown: Locator;
  readonly gradeHistorySubmenuLink: Locator;
  readonly courseWiseMarksSubmenuLink: Locator;
  readonly attendanceMenuLink: Locator;
  readonly facultyEvaluationMenuLink: Locator;

  readonly userGreeting: Locator;
  readonly cgpaIndicator: Locator;
  readonly creditsIndicator: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = this.page.getByRole('heading', { name: /Welcome/i }).first();
    this.activityStatusHeading = this.page.getByRole('heading', { name: /Activity Status/i });
    this.servicesMenuLink = this.page.getByRole('link', { name: 'Services' });
    this.carParkingSubmenuLink = this.page.getByRole('link', { name: 'Car Parking' });
    this.creditStatusUpdateSubmenuLink = this.page.getByRole('link', { name: /credit.*non.*credit/i });
    this.courseExclusionSubmenuLink = this.page.getByRole('link', { name: 'Course Exclusion' });
    this.courseInclusionSubmenuLink = this.page.getByRole('link', { name: 'Course Inclusion' });
    this.forgotIdSubmenuLink = this.page.getByRole('link', { name: /forgot rfid|forgot id/i });
    this.idUnlockSubmenuLink = this.page.getByRole('link', { name: 'ID Unlock' });
    this.leaveRequestSubmenuLink = this.page.getByRole('link', { name: /leave request|application for leave/i });
    this.semesterDropSubmenuLink = this.page.getByRole('link', { name: 'Semester Drop' });
    this.waiverCourseSubmenuLink = this.page.getByRole('link', { name: 'Waiver Course Issue' });
    this.writingCenterSubmenuLink = this.page.getByRole('link', { name: 'NSU Writing Center' });
    this.applicationStatusSubmenuLink = this.page.getByRole('link', { name: 'Application Status' });
    this.smsHistorySubmenuLink = this.page.locator('a[href*="students/sms_history"]').first();
    this.courseRequestSubmenuLink = this.page.locator('a[href*="common/feedback/RequestCourse"]').first();

    this.profileDropdown = page.locator('a.dropdown-toggle').filter({ hasText: 'Profile' }).first();
    this.studentInfoLink = page.getByRole('link', { name: 'Student Information' });
    this.changePasswordLink = page.getByRole('link', { name: 'Change Password' });
    this.majorDeclarationLink = page.getByRole('link', { name: 'Major Declaration' });

    this.advisingDropdown = page.locator('a.dropdown-toggle').filter({ hasText: 'Advising' }).first();
    this.advisingWindowLink = page.getByRole('link', { name: 'Advising Window' });
    this.advisingSlipPrintLink = page.getByRole('link', { name: /advising slip print|print slip/i });
    this.preAdvisingLink = page.getByRole('link', { name: /Pre-advising/i });
    this.preAdvisedCoursesLink = page.getByRole('link', { name: /pre advised courses/i });

    this.gradesDropdown = page.locator('a.dropdown-toggle').filter({ hasText: 'Grades' }).first();
    this.gradeHistorySubmenuLink = page.getByRole('link', { name: 'Grade History' });
    this.courseWiseMarksSubmenuLink = page.getByRole('link', { name: 'Course Wise Marks' });
    this.attendanceMenuLink = this.page.getByRole('link', { name: /Attendance/i });
    this.facultyEvaluationMenuLink = this.page.getByRole('link', { name: /Faculty Evaluation/i });

    this.userGreeting = page.locator('h3, h4, .blue, .page-header').first();
    this.cgpaIndicator = page.locator('div:has-text("CGPA")').last();
    this.creditsIndicator = page.locator('div:has-text("Credits passed")').last();
    this.logoutLink = this.page.getByRole('link', { name: 'Logout' });
  }

  async goto(user?: { username: string; password: string; twofaCode?: string }): Promise<void> {
    await this.page.goto('students/landing');
    await this.waitForReady();

    // If redirected to login due to session timeout or server-side invalidation
    if (!this.page.url().includes('students/landing')) {
      const userToLogin = user || studentData.student;
      const loginPage = new RdsLoginPage(this.page);
      await loginPage.loginAsStudent(userToLogin);
      await this.waitForReady();

      try {
        let authFileName = 'student.json';
        if (userToLogin.username === studentData.eligibleExclusionStudent.username) {
          authFileName = 'senior-student.json';
        } else if (userToLogin.username === studentData.eligibleInclusionStudent.username) {
          authFileName = 'inclusion-student.json';
        } else if (userToLogin.username === studentData.unlockIdStudent.username) {
          authFileName = 'unlock-student.json';
        }
        const authPath = path.resolve('playwright/.auth', authFileName);
        await this.page.context().storageState({ path: authPath });
      } catch {
        // storageState sync is best effort
      }
    }
  }

  async openProfileMenu(): Promise<void> {
    await this.profileDropdown.click();
  }

  async navigateToStudentProfile(): Promise<StudentProfilePage> {
    await this.openProfileMenu();
    await this.studentInfoLink.click();
    await this.waitForReady();
    return new StudentProfilePage(this.page);
  }

  async navigateToChangePassword(): Promise<ChangePasswordPage> {
    await this.openProfileMenu();
    await this.changePasswordLink.click();
    await this.waitForReady();
    return new ChangePasswordPage(this.page);
  }

  async navigateToMajorDeclaration(): Promise<MajorDeclarationPage> {
    await this.openProfileMenu();
    await this.majorDeclarationLink.click();
    await this.waitForReady();
    return new MajorDeclarationPage(this.page);
  }

  async openAdvisingMenu(): Promise<void> {
    await this.advisingDropdown.click();
  }

  async navigateToAdvising(): Promise<AdvisingPage> {
    await this.openAdvisingMenu();
    await this.advisingWindowLink.click();
    await this.waitForReady();
    return new AdvisingPage(this.page);
  }

  async navigateToAdvisingSlipPrint(): Promise<AdvisingSlipPage> {
    await this.openAdvisingMenu();
    await this.advisingSlipPrintLink.click();
    await this.waitForReady();
    return new AdvisingSlipPage(this.page);
  }

  async navigateToPreAdvising(): Promise<PreAdvisingPage> {
    await this.openAdvisingMenu();
    await this.preAdvisingLink.click();
    await this.waitForReady();
    return new PreAdvisingPage(this.page);
  }

  async navigateToPreAdvisedCourses(): Promise<PreAdvisedCoursesPage> {
    await this.openAdvisingMenu();
    await this.preAdvisedCoursesLink.click();
    await this.waitForReady();
    return new PreAdvisedCoursesPage(this.page);
  }

  async openGradesMenu(): Promise<void> {
    await this.gradesDropdown.click();
  }

  async navigateToGradeHistory(): Promise<RdsGradeHistoryPage> {
    await this.openGradesMenu();
    await Promise.all([
      this.page.waitForURL(/grade_history/, { timeout: 10000 }),
      this.gradeHistorySubmenuLink.click({ force: true }),
    ]);
    await this.waitForReady();
    return new RdsGradeHistoryPage(this.page);
  }

  async navigateToCourseWiseMarks(): Promise<RdsCourseWiseMarksPage> {
    await this.openGradesMenu();
    await Promise.all([
      this.page.waitForURL(/exam_marks/, { timeout: 10000 }),
      this.courseWiseMarksSubmenuLink.click({ force: true }),
    ]);
    await this.waitForReady();
    return new RdsCourseWiseMarksPage(this.page);
  }

  async navigateToCarParking(): Promise<RdsCarParkingPage> {
    await this.servicesMenuLink.click();
    await this.carParkingSubmenuLink.click();
    await this.waitForReady();
    return new RdsCarParkingPage(this.page);
  }

  async navigateToCreditStatusUpdate(): Promise<RdsCreditStatusUpdatePage> {
    await this.servicesMenuLink.click();
    await this.creditStatusUpdateSubmenuLink.click();
    await this.waitForReady();
    return new RdsCreditStatusUpdatePage(this.page);
  }

  async navigateToCourseExclusion(): Promise<RdsCourseExclusionPage> {
    await this.servicesMenuLink.click();
    await this.courseExclusionSubmenuLink.click();
    await this.waitForReady();
    return new RdsCourseExclusionPage(this.page);
  }

  async navigateToCourseInclusion(): Promise<RdsCourseInclusionPage> {
    await this.servicesMenuLink.click();
    await this.courseInclusionSubmenuLink.click();
    await this.waitForReady();
    return new RdsCourseInclusionPage(this.page);
  }

  async navigateToForgotId(): Promise<RdsForgotIdPage> {
    await this.servicesMenuLink.click();
    await this.forgotIdSubmenuLink.click();
    await this.waitForReady();
    return new RdsForgotIdPage(this.page);
  }

  async navigateToIdUnlock(): Promise<RdsIdUnlockPage> {
    await this.servicesMenuLink.click();
    await this.idUnlockSubmenuLink.click();
    await this.waitForReady();
    return new RdsIdUnlockPage(this.page);
  }

  async navigateToLeave(): Promise<RdsLeavePage> {
    await this.servicesMenuLink.click();
    await this.leaveRequestSubmenuLink.click();
    await this.waitForReady();
    return new RdsLeavePage(this.page);
  }

  async navigateToSemesterDrop(): Promise<RdsSemesterDropPage> {
    await this.servicesMenuLink.click();
    await this.semesterDropSubmenuLink.click();
    await this.waitForReady();
    return new RdsSemesterDropPage(this.page);
  }

  async navigateToWaiverCourse(): Promise<RdsWaiverCoursePage> {
    await this.servicesMenuLink.click();
    await this.waiverCourseSubmenuLink.click({ force: true });
    await this.waitForReady();
    return new RdsWaiverCoursePage(this.page);
  }

  async navigateToWritingCenter(): Promise<RdsWritingCenterPage> {
    await this.servicesMenuLink.click();
    await this.writingCenterSubmenuLink.click({ force: true });
    await this.waitForReady();
    return new RdsWritingCenterPage(this.page);
  }

  async navigateToApplicationStatus(): Promise<RdsApplicationStatusPage> {
    await this.servicesMenuLink.click();
    await Promise.all([
      this.page.waitForURL(/applied_applications/, { timeout: 5000 }).catch(async () => {
        await this.page.goto('bpm/applied_applications');
      }),
      this.applicationStatusSubmenuLink.click({ force: true }),
    ]);
    await this.waitForReady();
    return new RdsApplicationStatusPage(this.page);
  }

  async navigateToSmsHistory(): Promise<RdsSmsHistoryPage> {
    await this.servicesMenuLink.click();
    await this.smsHistorySubmenuLink.click({ force: true });
    await this.waitForReady();
    return new RdsSmsHistoryPage(this.page);
  }

  async navigateToCourseRequest(): Promise<RdsCourseRequestPage> {
    await this.servicesMenuLink.click();
    await this.courseRequestSubmenuLink.click({ force: true });
    await this.waitForReady();
    return new RdsCourseRequestPage(this.page);
  }

  async navigateToAttendance(): Promise<RdsAttendancePage> {
    await Promise.all([
      this.page.waitForURL(/studentAttendanceLanding/, { timeout: 10000 }),
      this.attendanceMenuLink.click(),
    ]);
    await this.waitForReady();
    return new RdsAttendancePage(this.page);
  }

  async navigateToFacultyEvaluation(): Promise<RdsFacultyEvaluationPage> {
    await Promise.all([
      this.page.waitForURL(/FacultyEvaluation/, { timeout: 10000 }),
      this.facultyEvaluationMenuLink.click(),
    ]);
    await this.waitForReady();
    return new RdsFacultyEvaluationPage(this.page);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.waitForReady();
  }
}

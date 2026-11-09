# RDS Automation Memory Bank

> **Quick-Reference Single Source of Truth** for AI Agents and Developers working on NSU RDS Automation.
> Consult this file first before analyzing codebase files.

---

## 1. System & Environment
- **Live Portal Base URL:** `http://10.102.11.254/rds_live_php84/`
- **Framework:** Playwright (`@playwright/test`) + TypeScript
- **Test Runner Config:** `playwright.config.ts` (Workers: 1, setup dependency: `tests/auth.setup.ts`)
- **CI / GitHub Actions:** Auto-runs on push/PR disabled in `.github/workflows/playwright.yml` (intranet IP `10.102.11.254` unreachable by GitHub cloud runners). Manual run only via `workflow_dispatch`.

---

## 2. Test User & Credentials (Single Unified Account Architecture)
> **Rule:** Log in **ONCE** globally using the single primary student account. Do not log into multiple accounts or spawn redundant browser tabs.
| Role / Persona | Username | Password | Purpose / Data |
|---|---|---|---|
| **Primary Student Account** | `2421354` | `123` | Unified for all student suites: Profile, Advising Window, Advising Slip, Pre-advising, Grades (40 Cr, CGPA 1.79), Course Marks, Attendance, Faculty Evaluation, and Services. Full Name: `Sabiha Hossain Shifa` |
| **Faculty** | `johndoe` | `password` | Faculty Dashboard & grading |

---

## 3. Storage State Paths
Authentication is performed **once** in `tests/auth.setup.ts` using `2421354` and saved to `playwright/.auth/student.json`.
To guarantee 100% compatibility across legacy spec paths, the single session is mirrored to:
- `student.json` (Primary Playwright storage state)
- `profile-student.json`
- `senior-student.json`
- `inclusion-student.json`
- `leave-student.json`
- `semester-drop-student.json`
- `unlock-student.json`

---

## 4. Test Directory Architecture
Tests are grouped under `tests/student/` mirroring RDS portal menus:
```
tests/student/
├── profile/             # Profile, Change Password, Major Declaration
├── advising/            # Advising Window, Advising Slip, Pre-advising, Pre-advised Courses
├── grades/              # Grade History, Course Wise Marks
├── attendance/          # Student attendance records (Landing, Semester Selection, Details & Lecture Logs)
├── faculty-evaluation/  # Faculty Evaluation schedule window & notification alerts
├── service/             # Car Parking, Credit Status, Inclusion, Exclusion, Unlock, Leave, Drop, Waiver, Writing Center, App Status
├── home/                # Home dashboard
├── payments/            # Tuition & fee payments
├── degree/              # Degree audit & graduation
├── course-drop/         # Course drop requests
├── sms-history/         # SMS logs
├── course-request/      # Manual course add requests
├── user-guides/         # RDS manuals
└── logout/              # Session logout
```

---

## 5. Page Objects Index (`src/pages/`)
| Page Object | Corresponding Route | Primary Purpose |
|---|---|---|
| `BasePage.ts` | Shared base | `waitForReady()`, `page` wrapper |
| `RdsLoginPage.ts` / `LoginPage.ts` | `/` | Two-step student/faculty login with session takeover |
| `RdsStudentLandingPage.ts` | `students/landing` | Main navbar menu navigation for all student portals |
| `StudentProfilePage.ts` | `students/profile` | Personal info, contact details, academic standing |
| `ChangePasswordPage.ts` | `students/change_password` | Password change form |
| `MajorDeclarationPage.ts`| `students/major` | Major declaration & 66-credits requirement alert |
| `AdvisingPage.ts` | `students/advising` | Advising window course selection |
| `AdvisingSlipPage.ts` | `students/print_slip/printSlipIndex` | Semester selector & 4-copy advising slip |
| `PreAdvisingPage.ts` | `students/preadvising` | Quiz questionnaire & course selection |
| `PreAdvisedCoursesPage.ts`| `students/preadvising/preAdvisingSlip` | Chosen pre-advised courses slip |
| `RdsGradeHistoryPage.ts` | `students/grade_history` | Summary (CGPA/Credits), Waiver, Transfer, Semester Grade tables, Print button |
| `RdsCourseWiseMarksPage.ts`| `students/grade_history/exam_marks` | Semester dropdown filter, See Marks button, Course/Section tables & breakdown |
| `RdsAttendancePage.ts` | `attendance/attendance/studentAttendanceLanding` | Semester selector, course table, Check Attendance detail view & lecture logs, Back button |
| `RdsFacultyEvaluationPage.ts` | `students/FacultyEvaluation` | Schedule window alert notification & footer brand notice |
| `RdsCourseRequestPage.ts` | `common/feedback/RequestCourse` | Pre-advised course request dropdown & department submission (`SaveRequestedCourses`) |
| `Rds*ServicePage.ts` | `bpm/*` | Parking, Credit Status, Inclusions, Drop, Leave, Waiver, Writing Center, App Status |

---

## 6. Strict Rules & Conventions
1. **Imports:** Always import `test` and `expect` from `src/fixtures/base` (relative path like `../../../src/fixtures/base`), NEVER directly from `@playwright/test`.
2. **Page Objects:** Element locators and actions only. **NO `expect()` inside Page Objects.**
3. **Locators Hierarchy:**
   1. `getByRole` with accessible name
   2. `getByLabel`
   3. `getByPlaceholder`
   4. `getByTestId`
   5. `getByText` for static text
   6. CSS/XPath only when accessible locators cannot match legacy markup.
4. **Assertions:** Web-first assertions only (`await expect(locator).toBeVisible()`). No arbitrary `page.waitForTimeout()` sleeps.

---

## 7. Common Test Commands & Reports
- `npm run test:attendance` — Run student attendance suite
- `npm run test:faculty-eval` — Run faculty evaluation suite
- `npm run test:grades` — Run all grade tests
- `npm run test:grade-history` — Grade history spec
- `npm run test:course-marks` — Course wise marks spec
- `npm run test:profile` — Student profile suite
- `npm run test:slip` — Advising slip suite
- `npm run test:preadvising` — Pre-advising suite
- `npm run test:sms-history` — SMS history service spec
- `npm run test:course-request` — Course request service spec
- `npm run test:service` — All student service request tests
- `npm run report` — Serve native Playwright HTML report (`playwright-report/index.html`)
- Standalone HTML Report: `playwright-report/report.html` (double-clickable directly on `file://` without server)
- `npx tsc --noEmit` — TypeScript typecheck

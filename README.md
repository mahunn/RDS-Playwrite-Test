# NSU RDS Playwright Test Automation
> **Autonomous End-to-End Test Suite for North South University (NSU) RDS Portal**  
> **Target Environment:** `http://10.102.11.254/rds_live_php84/` (Local Intranet Test Server)  
> **Contributors:** Mahin (@mahunn) & Borshon (@Borshan2004)  
> **Current Test Status:** **All Tests Passing (100% Green)**

---

## 📚 Essential Documentation

* 📖 **[System & Test Execution Runbook](docs/SYSTEM_AND_EXECUTION_GUIDE.md)**: Full architecture guide, session management, Windows execution tips, and complete test inventory.
* 🤝 **[Team Collaboration Guide](docs/TEAM_COLLABORATION_GUIDE.md)**: Git branching strategy, dedicated student account matrix, and PR review workflow.
* 🗺️ **[Portal Structure Catalog](docs/PORTAL_STRUCTURE.md)**: 60-route offline DOM catalog with exact input IDs, buttons, and alert texts.
* **Target URL:** `http://10.102.11.254/rds_live_php84/`
* **Framework:** Playwright Test (`@playwright/test`)
* **Language:** TypeScript
* **Design Pattern:** Page Object Model (POM) + Web-First Auto-Waiting Assertions

---

## ⚡ Quick Test Commands

### 1. Watch a Test Run in the Browser (Headed Mode)
```powershell
# Advising Window (Headed)
npm.cmd run test:advising:headed

# Change Password (Headed)
npm.cmd run test:password:headed

# Major Declaration (Headed)
npm.cmd run test:major:headed

# Car Parking (Headed)
npx.cmd playwright test tests/student/service/car-parking.spec.ts --headed

# SMS History (Headed)
npx.cmd playwright test tests/student/sms-history/sms-history.spec.ts --headed
```

### 2. Fast Headless Runs (Individual Modules)
```powershell
npm.cmd run test:advising       # Advising Window & Course Slip
npm.cmd run test:slip           # Advising Print Slip (4-part layout, fees, clearances)
npm.cmd run test:preadvising    # Pre-Advising (Academic Probation Quiz & Courses)
npm.cmd run test:pre-courses    # Pre Advised Courses Slip & Schedule Details
npm.cmd run test:profile        # Student Information (General & Personal)
npm.cmd run test:password       # Change Password & OTP Modal
npm.cmd run test:major          # Major Declaration Prerequisite
npm.cmd run test:services       # All Student Service Submissions & Application Status Audit
npm.cmd run test:status         # Application Status Verification Audit
npm.cmd run test:parking        # Car Parking Service
npm.cmd run test:exclusion      # Course Exclusion (Senior Student)
npm.cmd run test:inclusion      # Course Inclusion Request
npm.cmd run test:credit-status  # Credit / Non-Credit Status Update
npm.cmd run test:forgot-id      # Forgot RFID Application
npm.cmd run test:unlock-id      # ID Unlock Request
npm.cmd run test:leave          # Application for Leave
npm.cmd run test:drop           # Semester Drop Application
npm.cmd run test:waiver         # Waiver Course Issue Service
npm.cmd run test:writing-center # NSU Writing Center Appointment Booking
npm.cmd run test:sms-history    # SMS History Service & Filter Audit
npm.cmd run test:faculty        # Faculty Exam Marks Batch Entry
```

### 3. Run the Entire Suite
```powershell
npx.cmd playwright test
```

### 4. Interactive Debugging & HTML Reports
```powershell
# Interactive Playwright Desktop UI
npx.cmd playwright test --ui

# Open the HTML Test Report
npx.cmd playwright show-report --port 9324
```

### 5. Pull Latest Team Updates
```powershell
npm.cmd run sync
```

---

## 🚀 Git Workflow: Updating & Pushing Code

Follow this workflow to update, commit, and push your code to the team repository (**`mahunn/RDS-Playwrite-Test`**):

### 1. Working on an Existing Feature Branch
If you are already on your feature branch (e.g. `feature/borshon-sms-history`) and have modified or added tests:

```powershell
# Check which files have changed
git status

# Stage all changes
git add .

# Commit using Conventional Commits
git commit -m "feat(services): describe what was added or updated"

# Push to both your personal fork (origin) and upstream repository (mahunn)
git push origin feature/borshon-sms-history
git push mahunn feature/borshon-sms-history
```

### 2. Starting a Brand New Feature (Feature-Branch PR Workflow)
Always branch off the latest `main` before starting work on a new feature:

```powershell
# 1. Switch to main and pull the latest code from upstream
git checkout main
git pull mahunn main

# 2. Create and switch to a descriptive feature branch
git checkout -b feature/borshon-<feature-name>

# 3. Implement Page Objects in src/pages/ and specs in tests/student/
# 4. Verify tests pass locally on the intranet portal
npx.cmd playwright test tests/student/service/<test-file>.spec.ts

# 5. Stage and commit
git add .
git commit -m "feat(student): implement <feature-name> page object and spec"

# 6. Push your branch to GitHub
git push -u origin feature/borshon-<feature-name>
git push -u mahunn feature/borshon-<feature-name>
```

Open your Pull Request for Mahin to review and merge:  
👉 **`https://github.com/mahunn/RDS-Playwrite-Test/pull/new/feature/borshon-<feature-name>`**

### 3. Syncing `main` After a PR is Merged
Once the Pull Request has been approved and merged into `main`:

```powershell
# Switch to main, pull the merged updates, and update your personal fork
git checkout main
git pull mahunn main
git push origin main
```

### 📌 Remote Configuration Reference
| Remote Name | Repository URL | Purpose |
|---|---|---|
| `mahunn` | `https://github.com/mahunn/RDS-Playwrite-Test.git` | Team Shared Upstream Repository |
| `origin` | `https://github.com/Borshan2004/NSURDSSCRIPT.git` | Personal GitHub Fork |

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    Setup["tests/auth.setup.ts<br>(Pre-authenticates student sessions)"]
    Storage["playwright/.auth/<br>(student.json, profile-student.json, etc.)"]
    POM["src/pages/RdsStudentLandingPage.ts<br>(Unified POM + Session Self-Healing)"]
    Specs["tests/student/**/*.spec.ts<br>(Passing Spec Files)"]

    Setup --> Storage
    Storage --> POM
    POM --> Specs
```

* **Session Isolation:** NSU RDS allows only one active login per ID. Accounts are separated by module (`2421354` for Profile/Advising; `2512560`, `2231451`, `2421226`, `2425471` for Services).
* **Self-Healing Sessions:** [`RdsStudentLandingPage.goto()`](src/pages/RdsStudentLandingPage.ts) detects expired or superseded sessions and re-authenticates automatically.
* **Strict Locator Hierarchy:** Accessible locators (`getByRole`, `getByLabel`, `getByPlaceholder`) take priority over raw CSS/XPath.
* **Web-First Assertions:** Zero arbitrary sleeps (`waitForTimeout`); only auto-waiting web assertions (`expect(locator).toBeVisible()`).

---

## 🛠️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/mahunn/RDS-Playwrite-Test.git
cd RDS-Playwrite-Test

# 2. Install dependencies
npm install

# 3. Install Playwright browser binaries
npx playwright install chromium

# 4. Create your local .env from template
cp .env.example .env
```

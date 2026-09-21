# EDUFLOW — EXISTING SAAS CODE AUDIT, BUG FIX & ADVANCED FEATURE ENHANCEMENT

You are acting as a Senior Software Architect, Full-Stack Engineer, Database Engineer, UI/UX Engineer, Security Engineer, QA Engineer, and SaaS Product Engineer.

I already have an existing School Management SaaS application called **EduFlow**.

DO NOT rebuild the project from scratch.

Your primary responsibility is to:

1. Analyze the existing codebase.
2. Understand the current architecture.
3. Identify broken, incomplete, duplicated, or poorly implemented functionality.
4. Fix existing issues without unnecessarily breaking working features.
5. Improve the Fee Management system.
6. Improve the Teacher Salary system.
7. Improve Student Dashboard.
8. Improve Teacher Dashboard.
9. Improve related backend APIs, database logic, validation, UI, and state management.
10. Test every changed feature.
11. Preserve all existing working functionality.

---

# IMPORTANT DEVELOPMENT RULE

Before changing ANY code:

### STEP 1 — ANALYZE THE ENTIRE PROJECT

Inspect:

* frontend
* backend
* database
* API routes
* controllers
* services
* repositories
* middleware
* authentication
* authorization
* database schema
* migrations
* models
* components
* screens/pages
* hooks
* state management
* API services
* file upload system
* notification system
* PDF generation
* dashboard logic

Determine:

* Current architecture
* Frameworks
* Libraries
* Database technology
* Authentication implementation
* Role system
* Tenant system
* Fee implementation
* Salary implementation
* Student dashboard implementation
* Teacher dashboard implementation

DO NOT assume the existing architecture.

Read the actual source code.

---

# STEP 2 — CREATE CODEBASE AUDIT

Before making modifications, create an internal audit containing:

## Architecture

* Frontend structure
* Backend structure
* Database structure
* API architecture
* Authentication flow
* Authorization flow
* Tenant isolation

## Feature Status

For every major feature classify it as:

* WORKING
* PARTIALLY WORKING
* BROKEN
* MISSING
* DUPLICATED
* NEEDS IMPROVEMENT

Pay special attention to:

* Fees
* Payments
* Fee reminders
* Payment screenshots
* Student dashboard
* Teacher dashboard
* Teacher salaries
* Notifications
* PDF/Chalan generation
* Authentication
* Role permissions

Do not change code during the initial audit unless a critical issue prevents analysis.

---

# STEP 3 — PRESERVE EXISTING FUNCTIONALITY

The application already contains many startup-level features.

DO NOT:

* Rewrite the entire application.
* Replace the database unnecessarily.
* Replace the existing frontend framework.
* Replace the existing backend architecture without a strong technical reason.
* Remove working features.
* Create duplicate APIs.
* Create duplicate database tables.
* Create duplicate components.
* Change existing API contracts unnecessarily.

Instead:

* Reuse existing components.
* Reuse existing services.
* Reuse existing APIs where appropriate.
* Refactor only where necessary.
* Improve existing implementations.
* Maintain backward compatibility whenever possible.

---

# PRIMARY TASK 1 — PROFESSIONAL FEE MANAGEMENT

The current fee system needs improvement.

Redesign the existing fee workflow into a professional monthly fee-management system.

---

# STUDENT MONTHLY FEE SYSTEM

Each student should have a monthly fee record.

Example:

Student:

Name: Muhammad Ali
Student ID: STU-001
Class: 10
Section: A

Monthly fee:

January 2026
February 2026
March 2026
April 2026
May 2026
...

Each month must have an independent payment status.

Statuses should include:

* UNPAID
* PENDING
* PAID
* REJECTED
* OVERDUE

---

# FEE DASHBOARD

Student Dashboard should clearly display:

## Current Fee

* Current month
* Amount
* Due date
* Status
* Payment action

Example:

Current Month:
September 2026

Amount:
PKR 5,000

Status:
UNPAID

Button:

PAY FEE

---

# MONTHLY FEE REMINDER

If the current month's fee is unpaid:

Show a clear reminder on the Student Dashboard.

Example:

"September 2026 fee is due."

Display:

* Month
* Amount
* Due date
* Days remaining / overdue status
* Payment button

Do not display false reminders for months that are already paid.

---

# FIXED FEE PRICE

The system must NOT blindly use one hardcoded fee price.

Fee amount should come from the school's configured fee structure.

Possible structure:

School
→ Class
→ Fee Structure
→ Monthly Fee

Example:

Class 10:

Monthly Fee = PKR 5,000

If the admin changes the fee structure:

Future invoices should use the new configured amount.

Historical paid invoices must NOT be modified.

---

# MONTH SELECTION

When a student wants to submit a fee payment:

Show only eligible unpaid months.

Example:

January — PAID — disabled
February — PAID — disabled
March — UNPAID — selectable
April — PENDING — disabled
May — UNPAID — selectable

Paid months MUST NOT be selectable.

Pending months MUST NOT allow duplicate payment submission.

Rejected months MAY become payable again.

---

# PAYMENT SUBMISSION

Student should be able to:

1. Select specific unpaid month.
2. See exact fee amount.
3. See payment instructions.
4. Enter transaction/reference ID.
5. Upload payment screenshot.
6. Submit payment.

Required fields:

* Student ID
* Student Name
* Class
* Section
* Month
* Amount
* Transaction ID
* Payment screenshot
* Submitted date

The backend must validate all fields.

Never trust student-submitted:

* amount
* student ID
* class
* section
* tenant ID

These must be derived from the authenticated user/database wherever possible.

---

# PAYMENT SCREENSHOT

Support image upload.

Validate:

* File type
* File size
* MIME type

Allowed examples:

* JPG
* JPEG
* PNG
* WEBP

Store files using the EXISTING storage architecture.

Do not create another storage system if one already exists.

Suggested storage structure:

tenant/{tenantId}/fees/{studentId}/{year}/{month}/

---

# ADMIN FEE APPROVAL

School Admin should have a professional payment approval interface.

Display:

* Student name
* Student ID
* Class
* Section
* Month
* Amount
* Transaction ID
* Screenshot
* Submission date
* Current status

Actions:

APPROVE

REJECT

---

# APPROVAL WORKFLOW

When Admin approves:

Payment status:

PENDING → PAID

Create/confirm transaction record.

Generate unique transaction/payment ID if required.

Record:

* approved_by
* approved_at
* transaction_id
* payment reference
* amount
* month
* student
* tenant

Create audit log.

Send notification to student.

---

# REJECTION WORKFLOW

When Admin rejects:

Status:

PENDING → REJECTED

Admin should optionally provide:

Rejection reason.

Notify student.

Student can correct the issue and resubmit.

Do NOT create duplicate payment records unnecessarily.

---

# PREVENT DUPLICATE PAYMENTS

Backend must prevent:

* Two pending payments for the same student/month.
* Two successful payments for the same student/month.
* Paying an already-paid month.

Use appropriate:

* Database constraints
* Unique indexes
* Backend validation
* Transaction handling

The database must be the final protection against duplicate payments.

---

# FEE HISTORY

Student Dashboard should contain:

## Fee History

Columns:

Month
Amount
Status
Payment Date
Transaction ID
Action

Actions:

View Details
Download Chalan

---

# FEE CHALAN / PAYMENT RECEIPT

After payment approval, student must be able to download a professional PDF.

Do NOT allow downloading a "paid" receipt before approval.

PDF should contain:

School Logo

School Name

School Address

School Phone

---

Student Information:

Student ID
Student Name
Class
Section

---

Payment Information:

Fee Month
Fee Amount
Payment Status
Payment Date
Transaction ID
Payment Reference

---

System Information:

Receipt/Chalan Number
Generated Date

---

Optional:

QR Code for verification

---

PDF DESIGN

Create a professional school-fee receipt/chalan.

It should look like a real school financial document.

Include:

* Header
* School logo
* Payment information table
* Student information table
* Transaction details
* Signature area
* Footer
* Verification information

Make it printable on A4 paper.

---

# FEE API REQUIREMENTS

Review and improve existing APIs.

Expected logical endpoints may include:

GET /fees/current

GET /fees/history

GET /fees/eligible-months

POST /fees/payment

GET /fees/payments

GET /fees/payments/:id

POST /fees/payments/:id/approve

POST /fees/payments/:id/reject

GET /fees/payments/:id/receipt

Use the project's existing API naming conventions if different.

Do NOT blindly create duplicate endpoints.

---

# PRIMARY TASK 2 — PROFESSIONAL TEACHER SALARY SYSTEM

Analyze the existing Teacher Salary implementation.

Improve it into a professional payroll-style system.

---

# SALARY STRUCTURE

Each teacher may have:

* Basic Salary
* Allowances
* Bonus
* Overtime
* Deductions
* Advance
* Fine
* Net Salary

Formula:

Net Salary =
Basic Salary

* Allowances
* Bonus
* Overtime

- Deductions
- Advance
- Fine

Do not hardcode values.

---

# MONTHLY SALARY

Each teacher should have a monthly salary record.

Example:

Teacher:
Ahmed Khan

Month:
September 2026

Basic Salary:
PKR 40,000

Allowances:
PKR 5,000

Bonus:
PKR 2,000

Deductions:
PKR 1,000

Net Salary:
PKR 46,000

Status:

* DRAFT
* PENDING
* APPROVED
* PAID

---

# SALARY DASHBOARD — ADMIN

Admin should see:

Total Teachers

Total Monthly Payroll

Paid Salaries

Pending Salaries

Remaining Payroll

Salary by Month

---

# TEACHER SALARY SCREEN

Teacher should see:

Current Salary

Salary Month

Basic Salary

Allowances

Bonus

Deductions

Net Salary

Payment Status

Payment Date

Transaction/Reference ID

Salary History

---

# SALARY SLIP

Teacher should be able to download an approved salary slip.

PDF should include:

School Logo
School Name
School Address

Teacher Name
Teacher ID
Designation
Department
Month

Basic Salary
Allowances
Bonus
Overtime
Deductions
Advance
Net Salary

Payment Status
Payment Date
Salary Reference

Authorized By

Professional A4 design.

---

# SALARY WORKFLOW

Admin:

Create Salary

↓

Calculate Salary

↓

Review

↓

Approve

↓

Mark as Paid

↓

Teacher receives notification

↓

Teacher can download salary slip

---

# SALARY SECURITY

Teachers must ONLY see their own salary.

Students and parents must NEVER access salary information.

School Admin can ONLY access salaries belonging to their own school/tenant.

Super Admin can access system-wide information only where the existing permission model allows it.

---

# PRIMARY TASK 3 — STUDENT DASHBOARD ENHANCEMENT

Analyze the existing Student Dashboard and redesign it without breaking existing features.

Dashboard should contain:

## Header

* Student profile
* Student name
* Student ID
* Class
* Section
* Profile image

## Quick Statistics

* Attendance %
* Current Fee
* Pending Homework
* Upcoming Exams
* Latest Result

## Fee Card

* Current month
* Amount
* Status
* Due date
* Pay button

## Attendance

* Present
* Absent
* Leave
* Attendance percentage

## Homework

* Pending
* Submitted
* Completed
* Upcoming deadline

## Exams

* Upcoming exams
* Recent results

## Timetable

* Today's classes
* Upcoming classes

## Announcements

Latest school announcements.

## Notifications

Unread notification count.

## Quick Actions

* Pay Fee
* Submit Homework
* View Results
* View Attendance
* Download Reports
* Open Chat

Dashboard must use real API data.

No fake/mock statistics in production.

---

# PRIMARY TASK 4 — TEACHER DASHBOARD ENHANCEMENT

Improve Teacher Dashboard professionally.

Display:

## Teacher Profile

* Name
* Teacher ID
* Subjects
* Assigned classes

## Statistics

* Total Students
* Today's Attendance
* Pending Homework
* Upcoming Exams
* Classes Today

## Today's Schedule

Show:

* Time
* Class
* Section
* Subject
* Room

## Attendance Quick Action

* Select class
* Select section
* Mark attendance

## Homework

* Create homework
* Pending submissions
* Recent homework

## Exams

* Upcoming exams
* Create exam
* Generate AI exam

## Results

* Enter marks
* Pending results
* Published results

## Messages

* Unread messages
* Recent conversations

## Notifications

* Important notifications

---

# DASHBOARD REQUIREMENTS

All dashboard data must:

* Come from real backend APIs.
* Respect tenant isolation.
* Respect RBAC.
* Respect user ownership.
* Use proper loading states.
* Use empty states.
* Use error states.
* Use retry functionality.
* Use pagination where necessary.
* Use caching where appropriate.

---

# UI/UX IMPROVEMENT

Improve the existing interface while preserving the current design language.

Use:

* Modern cards
* Consistent spacing
* Professional typography
* Proper icons
* Responsive layouts
* Skeleton loaders
* Empty states
* Error states
* Confirmation dialogs
* Toast notifications
* Bottom sheets/modals where appropriate

Avoid:

* Overly complicated animations
* Unnecessary redesigns
* Huge components
* Duplicate UI logic

---

# BACKEND QUALITY

Review every changed backend module for:

* Validation
* Authorization
* Tenant isolation
* Error handling
* Logging
* Database transactions
* Race conditions
* Duplicate records
* Pagination
* Query optimization

Use database transactions for financial operations.

---

# DATABASE QUALITY

Inspect the existing schema before changing it.

If schema changes are required:

1. Create migration.
2. Preserve existing data.
3. Add indexes.
4. Add constraints.
5. Add foreign keys.
6. Avoid destructive changes.
7. Provide rollback strategy.

Never delete production data.

---

# API QUALITY

Every API must return consistent responses.

Example:

{
"success": true,
"message": "Payment submitted successfully",
"data": {}
}

Errors:

{
"success": false,
"message": "Payment already submitted for this month",
"error": {}
}

Use the project's existing response format if one already exists.

---

# AUTHORIZATION MATRIX

Verify permissions for every changed endpoint.

Super Admin:

System-level access.

School Admin:

Own school only.

Teacher:

Assigned classes/students only.

Student:

Own data only.

Parent:

Linked child data only.

Never rely only on frontend restrictions.

Authorization MUST be enforced by the backend.

---

# NOTIFICATIONS

Improve notification integration.

Fee:

* Fee due
* Payment submitted
* Payment approved
* Payment rejected

Salary:

* Salary created
* Salary approved
* Salary paid

Teacher:

* New homework
* New exam
* New announcement

Student:

* Result published
* Attendance alert

Use the existing notification system if available.

---

# AUDIT LOGGING

Financial actions must be audited.

Track:

* Payment submitted
* Payment approved
* Payment rejected
* Salary created
* Salary approved
* Salary paid
* Fee structure changed

Record:

* User
* Tenant
* Action
* Entity
* Entity ID
* Timestamp
* IP/device information if the existing architecture supports it

---

# PERFORMANCE

Do not fetch unnecessary data.

Implement:

* Pagination
* Database indexes
* Efficient joins
* React Query caching
* Redis caching where appropriate
* Lazy loading
* Image optimization

Avoid N+1 queries.

Dashboard APIs should be optimized.

---

# SECURITY

Check:

* Authentication
* Authorization
* Tenant isolation
* IDOR vulnerabilities
* File upload vulnerabilities
* SQL injection
* XSS
* Rate limiting
* Sensitive information exposure

Especially verify that a student cannot manipulate:

* student_id
* tenant_id
* amount
* payment status
* approval status
* transaction ownership

---

# TESTING

After implementation, test:

## Fee

* Student sees current fee.
* Paid month cannot be selected.
* Pending month cannot be duplicated.
* Student can select unpaid month.
* Student can submit payment.
* Screenshot uploads correctly.
* Admin sees payment.
* Admin approves payment.
* Admin rejects payment.
* Student receives notification.
* Approved payment generates PDF.
* PDF contains correct information.
* Duplicate payment is blocked.

## Salary

* Admin creates salary.
* Salary calculation is correct.
* Salary can be approved.
* Salary can be marked paid.
* Teacher sees own salary.
* Teacher cannot see another teacher's salary.
* Salary slip generates correctly.

## Student Dashboard

* Statistics are real.
* Fee information is correct.
* Attendance is correct.
* Homework is correct.
* Exams are correct.
* Notifications work.

## Teacher Dashboard

* Assigned classes are correct.
* Student count is correct.
* Attendance works.
* Homework works.
* Exams work.
* Results work.
* Notifications work.

---

# CODE QUALITY

Use:

* TypeScript
* Strict typing
* Reusable components
* Small functions
* Clean services
* Proper error classes
* Centralized validation
* Centralized API client
* Proper naming
* No dead code
* No unused imports
* No console.log in production code

Do not hide errors.

Do not use:

* any unnecessarily
* hardcoded IDs
* hardcoded tenant IDs
* hardcoded student IDs
* hardcoded fee amounts
* fake dashboard statistics
* mock production data

---

# CHANGE MANAGEMENT

Before each major modification:

Explain internally:

* Existing implementation
* Problem
* Root cause
* Proposed solution
* Files affected
* Database changes
* API changes
* Frontend changes

Then implement.

---

# REGRESSION PROTECTION

After every major module change:

Run:

* TypeScript checks
* Lint
* Unit tests
* Integration tests
* Build

Fix all errors before continuing.

Do not leave the project in a broken state.

---

# FINAL AUDIT

At the end, provide:

## 1. Fixed Issues

List every issue fixed.

## 2. New Improvements

List every enhancement.

## 3. Files Changed

Provide:

Frontend files
Backend files
Database files

## 4. Database Changes

List:

* New tables
* Modified tables
* New columns
* New indexes
* New constraints
* Migrations

## 5. API Changes

List:

* New endpoints
* Modified endpoints
* Removed endpoints, if any

## 6. Testing Results

Report:

* TypeScript
* Lint
* Unit tests
* Integration tests
* Build

## 7. Remaining Issues

Clearly identify anything that could not be fixed.

Do not claim something works unless it was actually verified.

---

# MOST IMPORTANT INSTRUCTION

This is an EXISTING production/startup SaaS.

DO NOT rebuild EduFlow.

DO NOT unnecessarily replace existing technologies.

DO NOT delete working functionality.

DO NOT create duplicate systems.

FIRST understand the existing application.

THEN identify root causes.

THEN make the smallest safe architectural changes necessary.

THEN test everything.

The final result should feel like a professional production SaaS rather than a collection of demo features.

Focus especially on:

1. Professional monthly fee management.
2. Correct month selection.
3. Payment screenshot submission.
4. Payment approval/rejection.
5. Transaction tracking.
6. Professional fee receipt/chalan PDF.
7. Professional teacher salary management.
8. Salary slips.
9. Student dashboard.
10. Teacher dashboard.
11. Notifications.
12. Security.
13. Tenant isolation.
14. Data integrity.
15. Performance.
16. Regression prevention.

Start by analyzing the existing repository and generating the codebase audit before making changes.

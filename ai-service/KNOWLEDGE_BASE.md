# Smart Campus AI Knowledge Base 2026
## Complete Feature Documentation

### SYSTEM OVERVIEW
Smart Campus is an integrated management system for NIT campus with portals for Students, Faculty, and Admins.
- **Modules**: Attendance, Academics, Library, Placements, Resources, Recommendations, Feedback, Finance, Hostel
- **Portal URL**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

---

## 1. STUDENT PORTAL FEATURES

### 1.1 Authentication & Signup
- **Student Signup**: Register with Branch (CS, IT, ECE, EE, Mechanical, Civil, Chemical) + Roll Number (Format: 2024CS001)
- **Login**: Use Roll Number or registered Email
- **Status Tracking**: Pending → Approved (by Admin) → Active
- **Routes**: 
  - Signup: `/signup/student`
  - Login: `/login/student`

### 1.2 Dashboard
- Quick stats: Attendance %, CGPA, Pending Assignments, Library Books Due
- Recent notifications and calendar events
- Quick links to all major modules

### 1.3 Academics Module
- **View Courses**: List of enrolled subjects with credits
- **Grades**: Semester results, letter grades (A, B, C, D, F)
- **CGPA Tracking**: Current CGPA, semester-wise trends
- **Course Details**: Syllabus, schedule, faculty details
- **Transcript**: Download academic transcript

### 1.4 Attendance Module
- **View Attendance**: Subject-wise percentage (attended/total classes)
- **Attendance Alerts**: Auto-notify if attendance < 75% in any subject
- **Dual Notifications**: SMS + Email to student AND parent
- **Prediction**: Days to recover attendance if bunking further
- **Report**: Export attendance summary as PDF

### 1.5 Assignments Module
- **View Assignments**: Subject-wise list with deadlines
- **Submit Assignments**: Upload files (max 10MB, supports PDF/DOC/ZIP)
- **Track Status**: Pending, Submitted, Graded, Late
- **Grades**: View marks and feedback from faculty
- **Reminders**: Email alerts 24hrs before deadline

### 1.6 Library Module
- **Search Books**: By Title, Author, ISBN
- **ISBN Integration**: Auto-fetch metadata from Open Library API
- **Book Status**: Check availability, reserve, waitlist
- **Issue/Return**: Self-service checkout and return
- **Renewals**: Renew up to 2 times per book
- **Overdue Management**:
  - Auto-calculate fines (₹10/day per book)
  - Email overdue notices
  - Fine payment tracking
- **My Books**: View currently issued books, due dates, renewal count
- **Advanced Search**: Filter by Category, Availability, Published Year

### 1.7 Hostel Module
- **Room Allocation**: Hostel assignment and room details
- **Mess Management**: Monthly mess fees and menu
- **Maintenance Requests**: File & track maintenance tickets (plumbing, electrical, etc.)
- **Visitation**: Request overnight guest visits
- **Complaints**: Lodge complaints with priority levels
- **Regulations**: Hostel rules and regulations

### 1.8 Placements Module
- **Browse Drives**: Active and upcoming company drives
- **Eligibility Filter**: Auto-filter by branch, CGPA, back-log status
- **Apply**: One-click application if eligible
- **Status Tracking**: View application status (Applied, Shortlisted, Rejected, Selected)
- **Company Details**: Role, CTC, designation, bonus details
- **Interview Schedule**: View test dates and interview slots
- **Recommendations**: Request recommendation letter from faculty for drive

### 1.9 Resources Module
- **Browse Materials**: Subject-wise study materials (PDFs, YouTube links, Notes)
- **Filter**: By Branch, Semester, Material Type
- **Download**: Direct download from repository
- **Pinned Resources**: Bookmark frequently used materials
- **Upload**: Faculty can share class notes post-lecture

### 1.10 Feedback Module
- **Submit Feedback**: Anonymous feedback for courses and campus services
- **Categories**: Teaching Quality, Course Content, Faculty, Campus Facilities, Hostel, Library, Canteen
- **Rating Scale**: 1-5 stars
- **Comments**: Free-text suggestions
- **Sentiment Analysis**: AI categorizes as Positive/Neutral/Negative
- **Track Status**: See responses to feedback

### 1.11 Recommendations Module
- **Request Letter**: Ask faculty for recommendation letter
- **Tracking**: View draft/submitted status
- **Visibility**: Recommendations locked after submission, can't be viewed
- **Use Cases**: Placement drives, higher studies, internships

### 1.12 Notifications
- **Notification Center**: Dropdown popover in top bar
- **Types**: Attendance, Assignment, Library, Finance, Academic, Hostel, Placement, Recommendation
- **Current count**: Badge shows unread count
- **Click-through routing**: Click notification to jump to relevant page
- **Mark as Read**: Auto-mark when notification is opened
- **Clear**: Clear all or individual notifications

---

## 2. FACULTY PORTAL FEATURES

### 2.1 Dashboard
- Today's schedule and upcoming classes
- Pending evaluations and grading
- Student activity overview
- Class attendance summary

### 2.2 Attendance Management
- **Mark Attendance**: Select subject and students present/absent
- **Student Monitoring**: View low-attendance warnings
- **Notification Trigger**: Auto-notify at-risk students (<75%)
- **Dual Notify**: Email sent to student & parent
- **Report Generation**: Attendance summary reports

### 2.3 Grading Module
- **Save Grades**: Subject-wise, exam-type (Quiz, Midterm, Endsem, Assignment)
- **Auto-Calculate**: Letter grades (A: 90+, B: 80-89, C: 70-79, D: 60-69, F: <60)
- **CSV Export**: Download all grades with calculations
- **Unique Index**: One entry per student+subject+exam type
- **Feedback**: Add remarks to grades

### 2.4 Resources Module
- **Share Materials**: Upload PDFs, links, lecture notes
- **Organization**: Tag by Subject, Branch, Semester
- **Pinning**: Highlight important resources for visibility
- **Management**: Edit, delete resources (auto-cleanup)

### 2.5 Recommendations Letter Management
- **Requests**: See pending recommendation requests from students
- **Draft**: Write and save recommendation letter
- **Submit**: Final submission (can't edit after)
- **Track**: View submitted letters

### 2.6 Notifications
- Recommendation requests
- Student attendance concerns
- Grade submission deadlines
- Assignment submissions

---

## 3. ADMIN PORTAL FEATURES

### 3.1 Dashboard
- Campus overview (Students, Faculty, Drivers, Books)
- Pending approvals (Signups, Complaints)
- System alerts and announcements
- Quick statistics

### 3.2 Student Signup Management
- **Pending Approvals**: List of students awaiting approval
- **Review**: Check Roll Number, Branch, Email
- **Approve**: Enable student account
- **Reject**: Reject with reason
- **Status Tracking**: Approved/Rejected history
- **Communication**: System notifies students of status

### 3.3 Placement Management
- **Create Drive**: Add company with role, CTC, CGPA cutoff, eligible branches
- **Eligibility Filter**: Auto-calculate eligible students
- **Manage Applications**: View applicants per drive
- **Student Download**: Compile application list as CSV
- **Announcements**: Notify eligible students automatically

### 3.4 Library Management
- **Add Books**: Manual entry or ISBN lookup (Open Library API)
- **Inventory**: Total copies, available copies
- **ISBN Features**: Auto-fetch title, author, cover image
- **Manage Issues**: Track issue/return dates
- **Fine Calculation**: Auto-calculate overdue fines (₹10/day)
- **Overdue Notices**: Bulk email reminders
- **Reports**: Inventory status, overdue list, circulation stats

### 3.5 Finance/Fine Management
- **Fee Tracking**: Student fee payment status
- **Fine Collection**: Library fines with payment status
- **Ledger**: Complete financial records
- **Reports**: Revenue, pending dues, collection status
- **Payment Links**: Generate payment references

### 3.6 Feedback Analytics
- **Submissions**: View all (anonymous) feedback
- **Analytics**:
  - Rating distribution (1-5 stars)
  - Category breakdown (Teaching, Facilities, etc.)
  - Trend analysis (monthly/semester)
  - Sentiment classification
- **Flagged Items**: High-risk feedback marked for review
- **Action Items**: Track resolution of complaints

### 3.7 Faculty Oversight
- **Faculty Performance**: Teaching ratings, response times
- **Course Allocations**: Manage faculty assignments
- **Review Requests**: Pending recommendation requests
- **Activity Tracking**: Faculty engagement metrics

---

## 4. BACKEND API SUMMARY

### Auth Endpoints
- `POST /api/auth/register` - Student signup (branch, rollNumber required)
- `POST /api/auth/login` - Login with rollNumber/email
- `GET /api/auth/pending-signups` - List pending signups (admin)
- `POST /api/auth/approve-signup/:userId` - Approve signup (admin)
- `POST /api/auth/reject-signup/:userId` - Reject signup (admin)

### Attendance Endpoints
- `POST /api/attendance/mark` - Mark attendance  
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/notify-student` - Send alert email

### Library Endpoints
- `POST /api/library/books` - Add book (ISBN auto-lookup)
- `POST /api/library/issue` - Issue book
- `POST /api/library/return/:issueId` - Return book
- `GET /api/library/my-books` - Student's issued books
- `GET /api/library/overdue` - Expired checkouts
- `POST /api/library/renew/:issueId` - Renew book
- `GET /api/library/search` - Search books by title/author

### Placement Endpoints
- `POST /api/placement/drives` - Create drive (admin)
- `GET /api/placement/drives` - List all drives
- `GET /api/placement/drives/student` - Eligible drives for student
- `POST /api/placement/drives/:id/apply` - Apply to drive
- `GET /api/placement/drives/:id/applicants` - View applicants (admin)

### Grading Endpoints
- `POST /api/grading/save` - Save grades
- `GET /api/grading/export-csv` - Export grades as CSV

### Feedback Endpoints
- `POST /api/feedback` - Submit feedback (anonymous)
- `GET /api/feedback/analytics` - Analytics dashboard
- `GET /api/feedback/category-breakdown` - Category stats

### Recommendations Endpoints
- `POST /api/recommendations/save` - Draft recommendation
- `POST /api/recommendations/submit/:id` - Submit recommendation
- `GET /api/recommendations/my-letters` - Faculty's written letters

### Notification Endpoints
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/mark-read` - Mark as read
- `POST /api/notifications/clear-all` - Clear all
- `POST /api/notifications` - Create notification

---

## 5. COMMON QUESTIONS & ANSWERS

### Student Questions
**Q: How can I improve attendance if it's below 75%?**
A: Attend all upcoming classes. The system calculates how many consecutive classes you need to attend to reach 75%. Faculty can grant leave request if you have valid medical/emergency reasons.

**Q: What if I miss a deadline for assignment submission?**
A: Late submissions are marked and may incur penalties. Contact faculty immediately for extension requests.

**Q: How do I get a recommendation letter for placements?**
A: Go to Recommendations module, select faculty, and submit request. Faculty reviews and writes the letter.

**Q: Can I return a book to hostel library instead of main library?**
A: Check with your hostel. System tracks centralized library only.

**Q: Are placement drives mandatory?**
A: No, they're optional. But pre-placement talks and practice sessions are recommended.

### Faculty Questions
**Q: Can I modify grades after submission?**
A: Yes, via CSV export. Re-import with updated marks.

**Q: How do I pin a resource for visibility?**
A: Upload resource → Click pin icon. Pinned materials appear first.

**Q: What happens if I don't submit recommendation by deadline?**
A: Student can view "Pending" status. System doesn't auto-reject; manually resolve with student.

### Admin Questions
**Q: How do I handle students who don't get approved?**
A: Review signup details. If issues with roll number or branch, send rejection with reason.

**Q: Can I generate placement reports?**
A: Yes, download applicant list as CSV from each drive.

**Q: What's the ISBN lookup?**
A: System fetches book metadata (title, author, cover) from OpenLibrary API when you enter ISBN.

---

## 6. GLOSSARY

- **CGPA**: Cumulative Grade Point Average
- **SGPA**: Semester Grade Point Average
- **CTC**: Cost to Company (salary package)
- **Overdue**: Late book return (fine = ₹10/day)
- **Renewable**: Book can be renewed up to 2 times
- **Pinned**: Bookmarked/favorites for quick access
- **Sentiment**: AI categorizes feedback as Positive/Neutral/Negative
- **Eligible**: Meets criteria (CGPA cutoff, branch filter, no backlogs)

---

## 7. SYSTEM BEHAVIOR & RULES

- **Attendance Alert Threshold**: < 75% in any subject
- **Late Fine**: ₹10 per book per day
- **Max Renewals**: 2 times per book
- **Application Deadline**: Non-negotiable unless approved by admin
- **Grade Scale**: A(90+), B(80-89), C(70-79), D(60-69), F(<60)
- **Approval Wait Time**: 24-48 hours (admin reviews signups daily)
- **Notification Auto-Archive**: Older than 30 days (optional clear-all)

---

## 8. TROUBLESHOOTING

**Q: I can't login, says "User not found"**
A: Ensure you're registered first. Go to /signup/student and complete registration. Wait for admin approval.

**Q: Library fine keeps increasing**
A: Return the book immediately. Fine is ₹10/day. Pay fine via Finance module.

**Q: Recommendation letter says "Pending" but I submitted it**
A: System auto-updates to "Approved" once sent. If still pending, check with faculty.

**Q: Assignment disappeared from my list**
A: It's been graded and moved to "Graded" status. Check feedback from faculty.

---

## 9. CONTACT & SUPPORT

- **IT Support**: it@nitcampus.edu
- **Academic**: academics@nitcampus.edu
- **Placements**: placements@nitcampus.edu
- **Hostel**: hostel@nitcampus.edu
- **Library**: library@nitcampus.edu
- **Complaint**: grievances@nitcampus.edu

---

**Last Updated**: 2026-02-20
**Version**: 2.0 - Production Ready

/**
 * UniCampus Core Library
 * Year: 2026
 * Aesthetic: Cyber-Academic Precision
 */

export type UserRole = 'student' | 'faculty' | 'admin';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  ACADEMICS: '/student/academics',
  ATTENDANCE: '/student/attendance',
  ASSIGNMENTS: '/student/assignments',
  PLACEMENTS: '/student/placements',
  LIBRARY: '/student/library',
  HOSTEL: '/student/hostel',
  FINANCE: '/student/finance',
  FEEDBACK: '/student/feedback',
  EVENTS: '/student/events',
  DOUBT_SOLVER: '/student/doubt-solver',


  // Faculty Routes
  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_ATTENDANCE: '/faculty/attendance',
  GRADING: '/faculty/grading',
  RESOURCES: '/faculty/resources',
  RECOMMENDATIONS: '/faculty/recommendations',
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SIGNUP_MANAGEMENT: '/admin/signup-management',
  PLACEMENT_MGMT: '/admin/placements',
  LIBRARY_MGMT: '/admin/library',
  FINANCE_LEDGER: '/admin/finance',
  FEEDBACK_ANALYTICS: '/admin/feedback',
  FACULTY_OVERSIGHT: '/admin/faculty-oversight',
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branch?: string;
  year?: number;
  semester?: number;
  studentId?: string;
  rollNumber?: string;
  facultyId?: string;
  cgpa?: number;
  status?: string;
}

export interface AttendanceData {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  trend: number[];
  lastUpdated: string;
  faculty: string;
  credits: number;
  prediction?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  branch: string;
  module: string;
  timestamp: string;
}

export interface PlacementDrive {
  id: string;
  company: string;
  logo?: string;
  role: string;
  ctc: string;
  cutoffCgpa: number;
  deadline: string;
  applicants: number;
  status: 'open' | 'closed' | 'shortlisted' | 'interview' | 'offer';
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Aryan Sharma',
    email: 'aryan.comp101@nit.edu',
    role: 'student',
    branch: 'COMP',
    year: 1,
    semester: 2,
    studentId: 'COMP_101',
    cgpa: 9.2,
    avatar: 'https://i.pravatar.cc/150?u=aryan',
  },
  {
    id: '2',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@nit.edu',
    role: 'faculty',
    facultyId: 'FAC_CS_01',
    avatar: 'https://i.pravatar.cc/150?u=vikram',
  },
  {
    id: '3',
    name: 'Admin Control',
    email: 'admin@nit.edu',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin',
  },
];

export const mockAttendanceData: AttendanceData[] = [
  {
    subject: 'Data Structures',
    attended: 32,
    total: 35,
    percentage: 91.4,
    trend: [85, 88, 90, 91, 91.4],
    lastUpdated: '2026-02-19',
    faculty: 'Dr. Vikram Malhotra',
    credits: 4,
    prediction: 'You can safely skip 2 more classes',
  },
  {
    subject: 'Discrete Mathematics',
    attended: 28,
    total: 36,
    percentage: 77.7,
    trend: [80, 78, 77, 77.5, 77.7],
    lastUpdated: '2026-02-18',
    faculty: 'Prof. Sarah Jain',
    credits: 3,
    prediction: 'High Alert: Do not skip the next 3 sessions',
  },
  {
    subject: 'Digital Logic Design',
    attended: 21,
    total: 30,
    percentage: 70.0,
    trend: [75, 72, 71, 70.5, 70.0],
    lastUpdated: '2026-02-20',
    faculty: 'Dr. Amit Singh',
    credits: 4,
    prediction: 'CRITICAL: Mandatory attendance required to meet 75% cutoff',
  },
  {
    subject: 'Communication Skills',
    attended: 14,
    total: 15,
    percentage: 93.3,
    trend: [90, 92, 93, 93.3],
    lastUpdated: '2026-02-17',
    faculty: 'Prof. Elena Gilbert',
    credits: 2,
    prediction: 'Perfect track record',
  },
];

/**
 * Utility: Parse Student ID
 * Example: "COMP_101" -> { branch: "COMP", year: 1 }
 */
export function parseStudentId(id: string) {
  const parts = id.split('_');
  if (parts.length < 2) return null;

  const branch = parts[0];
  const yearCode = parts[1][0]; // Assuming first digit is year

  return {
    branch: branch.toUpperCase(),
    year: parseInt(yearCode) || 1,
  };
}

/**
 * Utility: Format Date for Campus Feed
 */
export function formatCampusDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

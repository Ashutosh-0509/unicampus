import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  LayoutDashboard,
  Bell,
  Search,
  ChevronRight,
  TrendingDown,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceCard } from '@/components/AttendanceCard';
import { TimelineCard } from '@/components/TimelineCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const StudentDashboard: React.FC = () => {
  const { user, getAuthToken } = useAuth();
  const [date, setDate] = useState(new Date());
  const [studentData, setStudentData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real student data from API
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = getAuthToken();
        if (!token || !user?.id) {
          setIsLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch student profile from existing auth endpoint
        const profileResponse = await axios.get(
          'https://unicampus-backend-1p7e.onrender.com/api/auth/me',
          { headers }
        );
        const profileUser = profileResponse.data?.user || user;
        setStudentData(profileUser);

        // Fetch attendance using supported endpoint
        const studentIdentifiers = [
          profileUser?.studentId,
          profileUser?.rollNumber,
          user?.studentId,
          user?.rollNumber,
          user?.id,
        ].filter(Boolean);

        let records: any[] = [];
        for (const studentId of studentIdentifiers) {
          const response = await axios.get('https://unicampus-backend-1p7e.onrender.com/api/attendance', {
            headers,
            params: { studentId },
          });

          if (Array.isArray(response.data) && response.data.length > 0) {
            records = response.data;
            break;
          }
        }

        if (records.length === 0) {
          const fallbackResponse = await axios.get('https://unicampus-backend-1p7e.onrender.com/api/attendance', { headers });
          records = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
        }

        setAttendanceData(records);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        toast.error('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id, getAuthToken]);

  // Filter for low attendance (< 75%)
  const lowAttendanceSubjects = attendanceData.filter((s: any) => s.percentage < 75);

  // Calculate overall attendance
  const overallAttendance = attendanceData.length > 0
    ? (attendanceData.reduce((sum: number, s: any) => sum + Number(s.percentage || 0), 0) / attendanceData.length).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 font-sans">

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-xs hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-9 w-[280px] bg-white border-slate-200 focus-visible:ring-primary"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-white relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow-sm">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Metrics & Attendance */}
        <div className="lg:col-span-8 space-y-8">

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Overall Attendance</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{overallAttendance}%</h3>
                    <p className={`text-xs font-medium mt-1 flex items-center ${parseFloat(overallAttendance) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(overallAttendance) >= 75 ? '✓ On track' : '⚠ Below 75%'}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">CGPA</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{studentData?.cgpa?.toFixed(2) || '0.00'}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {studentData?.cgpa >= 8.0 ? 'Excellent' : studentData?.cgpa >= 7.0 ? 'Good' : 'Average'} performance
                    </p>
                  </div>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{attendanceData.length}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {studentData?.semester || 'N/A'} semester
                    </p>
                  </div>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Subject Attendance</h2>
            </div>

            {lowAttendanceSubjects.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold">Attention Required:</span> Your attendance is below 75% in {lowAttendanceSubjects.length} subjects.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceData.length > 0 ? (
                attendanceData.map((data: any) => (
                  <Card key={data.subjectCode} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                          {data.subjectCode?.substring(0, 3).toUpperCase() || 'SUB'}
                        </div>
                        <span className={`text-sm font-bold ${data.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                          {data.percentage}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1" title={data.subject}>
                        {data.subject}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {data.attended} / {data.total} Classes Attended
                      </p>
                      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${data.percentage < 75 ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Timeline Widget */}
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <TimelineCard
                type="class"
                title="Advanced Data Structures"
                time="09:00 AM - 10:30 AM"
              />
              <TimelineCard
                type="assignment"
                title="ML Lab Submission"
                time="Due today, 11:59 PM"
                urgent={true}
              />
              <TimelineCard
                type="event"
                title="Cloud Tech Seminar"
                time="02:00 PM - Auditorium"
              />
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-slate-200 shadow-sm bg-primary text-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Placement Cell</h3>
              <p className="text-blue-100 text-sm mb-4">
                View upcoming recruitment drives and manage your applications.
              </p>
              <Button
                variant="secondary"
                className="w-full bg-white text-primary hover:bg-slate-50 border-0"
                onClick={() => window.location.hash = '#/student/placements'}
              >
                Go to Placements
              </Button>
            </CardContent>
          </Card>

        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;

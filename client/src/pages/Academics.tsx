import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, User, Award, GraduationCap, Clock,
  LayoutDashboard, Filter, ExternalLink, FileQuestion, Loader2, FolderOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';
import { AttendanceTrendChart } from '@/components/Charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const RESOURCES_LINK = 'https://drive.google.com/drive/folders/1Q_9jGZYTZWu-KsmTnTnYKi-ZFjxMpxDg';
const PYQ_LINK = 'https://btechkeeda.great-site.net';

const subjectSchedules: Record<string, string[]> = {
  'Data Structures': ['Mon 10:00 AM', 'Wed 11:30 AM'],
  'Discrete Mathematics': ['Tue 09:00 AM', 'Thu 09:00 AM'],
  'Digital Logic Design': ['Mon 02:00 PM', 'Fri 10:00 AM'],
  'Communication Skills': ['Thu 03:00 PM'],
  'Computer Networks': ['Wed 02:00 PM', 'Fri 11:00 AM'],
};

const branches = ['COMP', 'ELEC', 'MECH', 'CIVIL', 'CHME'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const API = import.meta.env.VITE_API_URL || 'https://unicampus-backend-1p7e.onrender.com';

export default function Academics() {
  const { user, getAuthToken } = useAuth();
  const [branch, setBranch] = useState('COMP');
  const [semester, setSemester] = useState('2');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = getAuthToken();
        if (!token || !user?.id) { setIsLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const studentIdentifiers = [user?.studentId, user?.rollNumber, user?.id].filter(Boolean);
        let records: any[] = [];
        for (const studentId of studentIdentifiers) {
          const response = await axios.get(`${API}/api/attendance`, { headers, params: { studentId } });
          if (Array.isArray(response.data) && response.data.length > 0) {
            records = response.data;
            break;
          }
        }
        setAttendanceData(records);
      } catch (error) {
        toast.error('Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [user?.id, getAuthToken]);

  const overallAvg = attendanceData.length > 0
    ? attendanceData.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / attendanceData.length
    : 0;

  const weeklyTrendData = [1, 2, 3, 4, 5].map(week => ({
    name: `Week ${week}`,
    attendance: attendanceData.length > 0 ? overallAvg : 80
  }));

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="w-8 h-8 text-primary" />
            Academic Overview
          </h1>
          <p className="text-muted-foreground mt-1">Manage your curriculum, schedule, and performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md p-1 rounded-lg border border-border">
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-[120px] bg-transparent border-none focus:ring-0">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="h-4 w-px bg-border" />
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-[140px] bg-transparent border-none focus:ring-0">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" className="bg-card/50">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* ✅ PYQ + Resources Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


        {/* PYQ Card */}
        <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Previous Year Questions</h3>
                  <p className="text-muted-foreground text-xs">IA + Final exam papers — free!</p>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 whitespace-nowrap"
                onClick={() => window.open(PYQ_LINK, '_blank')}>
                <ExternalLink className="w-3 h-3" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Study Resources</h3>
                  <p className="text-muted-foreground text-xs">Notes, PDFs — Google Drive</p>
                </div>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 whitespace-nowrap"
                onClick={() => window.open(RESOURCES_LINK, '_blank')}>
                <ExternalLink className="w-3 h-3" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Doubt card */}
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-600 text-white rounded-xl shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">AI Doubt Solver</h3>
                  <p className="text-muted-foreground text-xs">24/7 Academic Support</p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 whitespace-nowrap"
                onClick={() => window.location.hash = '#/student/doubt-solver'}>
                Open
              </Button>

            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Attendance Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Attendance Analytics</CardTitle>
                <CardDescription>Aggregate weekly trend across all subjects</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Current Avg: {overallAvg.toFixed(1)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <AttendanceTrendChart data={weeklyTrendData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Subjects Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Course Curriculum
        </h2>

        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Syncing academic records...</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card/20 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No attendance records found.</p>
            </div>
          ) : (
            attendanceData.map((subject) => (
              <motion.div key={subject._id || subject.subject} variants={itemVariants}>
                <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GraduationCap className="w-16 h-16" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {subject.credits || 3} Credits
                      </Badge>
                      <div className={`text-xs font-mono font-bold ${subject.percentage < 75 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {subject.percentage}% Attended
                      </div>
                    </div>
                    <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">
                      {subject.subject}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {subject.faculty || 'Faculty'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>{subject.attended} Attended</span>
                      <span>{subject.total} Total</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${subject.percentage < 75 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${subject.percentage}%` }} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Weekly Schedule
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subjectSchedules[subject.subject]
                          ? subjectSchedules[subject.subject].map((time, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 font-normal">{time}</Badge>
                          ))
                          : <span className="text-sm text-muted-foreground">No schedule posted</span>}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <Button variant="ghost" size="sm"
                        onClick={() => window.open(RESOURCES_LINK, '_blank')}
                        className="text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        Resources
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => window.open(PYQ_LINK, '_blank')}
                        className="hover:bg-white/5 flex items-center gap-1">
                        <FileQuestion className="w-3 h-3" />
                        PYQ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Bottom */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="flex justify-center pt-8 pb-4">
        <Card className="bg-primary/5 border-primary/20 p-4 rounded-full flex items-center gap-6 px-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Semester Progress: 64%</span>
          </div>
          <div className="h-4 w-px bg-primary/20" />
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Predicted SGPA: 9.4</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
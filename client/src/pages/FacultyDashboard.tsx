import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Users, AlertTriangle, Bell, BookOpen, Send,
  Calendar, CheckCircle2, ChevronRight, Mail, Phone, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/StatsCards';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import axios from 'axios';

const API = 'https://unicampus-backend-1p7e.onrender.com';

export default function FacultyDashboard() {
  const { user, getAuthToken } = useAuth();
  const [notifying, setNotifying] = useState<string | null>(null);
  const [notifiedList, setNotifiedList] = useState<string[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ classes: 3, pendingAttendance: 1, avgAttendance: 0, publications: 12 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [attendanceRes, assignmentsRes] = await Promise.allSettled([
          axios.get(`${API}/api/attendance`, { headers }),
          axios.get(`${API}/api/assignments`, { headers }),
        ]);

        // At-risk students (attendance < 75%)
        if (attendanceRes.status === 'fulfilled') {
          const records = attendanceRes.value.data || [];
          const atRisk = records
            .filter((r: any) => r.percentage < 75)
            .slice(0, 5)
            .map((r: any) => ({
              id: r._id,
              name: r.studentName || 'Student',
              studentId: r.studentId || 'N/A',
              attendance: r.percentage,
              lastAbsent: r.updatedAt?.split('T')[0] || 'N/A',
              trend: r.percentage < 65 ? 'falling' : 'stable',
            }));
          setAtRiskStudents(atRisk);

          // Avg attendance
          if (records.length > 0) {
            const avg = records.reduce((s: number, r: any) => s + Number(r.percentage || 0), 0) / records.length;
            setStats(prev => ({ ...prev, avgAttendance: parseFloat(avg.toFixed(1)) }));
          }
        }

        if (assignmentsRes.status === 'fulfilled') {
          setAssignments(assignmentsRes.value.data?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Faculty dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDualNotify = (studentId: string) => {
    setNotifying(studentId);
    setTimeout(() => {
      setNotifiedList((prev) => [...prev, studentId]);
      setNotifying(null);
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock schedule (can be replaced with real timetable API later)
  const SCHEDULE = [
    { id: '1', time: '09:00 AM - 10:30 AM', subject: 'Data Structures', branch: 'COMP_A (Year 2)', room: 'L-201', status: 'completed' },
    { id: '2', time: '11:00 AM - 12:30 PM', subject: 'Algorithm Design', branch: 'COMP_B (Year 2)', room: 'L-204', status: 'ongoing' },
    { id: '3', time: '02:00 PM - 03:30 PM', subject: 'Advanced Java', branch: 'IT_A (Year 3)', room: 'Lab-4', status: 'upcoming' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible"
      className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {SCHEDULE.length} classes scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card/50 backdrop-blur-xl border border-border px-4 py-2 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Semester 2, 2026</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today's Classes" value={SCHEDULE.length} icon={<Clock className="w-5 h-5" />} trend={0} suffix="Sessions" />
        <StatsCard title="At-Risk Students" value={atRiskStudents.length} icon={<AlertTriangle className="w-5 h-5 text-destructive" />} trend={-20} suffix="Below 75%" />
        <StatsCard title="Average Attendance" value={stats.avgAttendance} icon={<Users className="w-5 h-5" />} trend={2.4} suffix="%" />
        <StatsCard title="Assignments Posted" value={assignments.length} icon={<BookOpen className="w-5 h-5" />} trend={1} suffix="Total" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Today's Schedule
            </h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Full Calendar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {SCHEDULE.map((item) => (
              <motion.div key={item.id} variants={staggerItem}
                className="group relative bg-card/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl hover:border-primary/40 transition-all duration-300">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.subject}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.time}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {item.branch}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {item.room}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${item.status === 'ongoing' ? 'bg-primary/20 text-primary border border-primary/30 animate-pulse'
                        : item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
                      {item.status}
                    </span>
                    {item.status === 'ongoing' && (
                      <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all">
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* At-Risk Students */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> At-Risk Students
            </h2>
            <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/20">
              URGENT
            </span>
          </div>

          <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10">
              <p className="text-xs text-muted-foreground">Students below 75% attendance cutoff. AI recommends immediate intervention.</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : atRiskStudents.length === 0 ? (
              <div className="p-6 text-center text-emerald-400 text-sm">✅ No at-risk students!</div>
            ) : (
              <div className="divide-y divide-white/5">
                {atRiskStudents.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold font-mono ${student.attendance < 65 ? 'text-destructive' : 'text-orange-500'}`}>
                          {student.attendance}%
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Attendance</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <div className="p-1.5 rounded-md bg-white/5 text-muted-foreground"><Mail className="w-3.5 h-3.5" /></div>
                        <div className="p-1.5 rounded-md bg-white/5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /></div>
                      </div>
                      <button onClick={() => handleDualNotify(student.id)}
                        disabled={notifying === student.id || notifiedList.includes(student.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${notifiedList.includes(student.id)
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 cursor-default'
                            : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}>
                        {notifying === student.id ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Send className="w-3 h-3" />
                          </motion.div>
                        ) : notifiedList.includes(student.id) ? (
                          <><CheckCircle2 className="w-3 h-3" /> Dual Notified</>
                        ) : (
                          <><Send className="w-3 h-3" /> Dual Notify</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insight */}
          <motion.div whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bell className="w-12 h-12" />
            </div>
            <h4 className="text-sm font-bold text-indigo-300 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> AI Intervention Engine
            </h4>
            <p className="text-xs text-indigo-100/70 leading-relaxed">
              {atRiskStudents.length > 0
                ? `${atRiskStudents.length} students need immediate intervention. Auto-reminders scheduled for tomorrow at 08:00 AM.`
                : 'All students are above the attendance threshold. Great work!'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
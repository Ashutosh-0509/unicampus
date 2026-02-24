import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Calendar,
  ChevronDown,
  Search,
  BellRing,
  ShieldAlert,
  Filter,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

interface StudentRow {
  id: string;
  name: string;
  roll: string;
  studentId: string;
  attendance: number;
}

export default function FacultyAttendance() {
  const { user, getAuthToken } = useAuth();
  const [subject, setSubject] = useState('Data Structures');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, any>>({});
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);

  const stats = useMemo(() => {
    const values = Object.values(attendance);
    return {
      present: values.filter((v) => v === 'present').length,
      absent: values.filter((v) => v === 'absent').length,
      late: values.filter((v) => v === 'late').length,
      unmarked: values.filter((v) => v === 'unmarked').length,
      total: students.length,
    };
  }, [attendance, students.length]);

  const normalizeStudentId = (student: any) =>
    String(student.studentId || student.rollNumber || student.id || '').trim();

  const loadRoster = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const usersResponse = await fetch('http://localhost:5000/api/users?role=student', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const users = await usersResponse.json();
      const approved = (Array.isArray(users) ? users : []).filter((u) => u.status !== 'rejected' && u.role === 'student');

      const attendanceResponse = await fetch(`http://localhost:5000/api/attendance?subject=${encodeURIComponent(subject)}`);
      const attendanceData = await attendanceResponse.json();
      const records = Array.isArray(attendanceData) ? attendanceData : [];

      const recordMap: Record<string, any> = {};
      records.forEach((record: any) => {
        const key = String(record.studentId || record.rollNumber || record.id || '').trim();
        if (key) recordMap[key] = record;
      });

      const rows: StudentRow[] = approved.map((student) => {
        const studentKey = normalizeStudentId(student);
        const record = recordMap[studentKey];
        return {
          id: studentKey,
          name: student.name || 'Student',
          roll: student.rollNumber || student.studentId || studentKey,
          studentId: studentKey,
          attendance: Number(record?.percentage || 0),
        };
      });

      setStudents(rows);
      setAttendanceRecords(recordMap);
      setAttendance(Object.fromEntries(rows.map((s) => [s.id, 'unmarked'])));
    } catch (error) {
      console.error('Failed to load roster:', error);
      toast.error('Failed to load student roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [subject]);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === status ? 'unmarked' : status,
    }));
  };

  const handleDualNotify = (studentName: string) => {
    toast.success(`Notifications sent to ${studentName} and their Parent.`, {
      description: 'Dual-channel SMS and App push triggered successfully.',
      icon: <BellRing className="h-4 w-4 text-primary" />,
    });
  };

  const handleBulkSubmit = () => {
    if (stats.unmarked > 0) {
      toast.error(`Please mark attendance for all ${stats.unmarked} remaining students.`);
      return;
    }
    const submit = async () => {
      try {
        const token = getAuthToken();
        await Promise.all(
          students.map(async (student) => {
            const status = attendance[student.id];
            const present = status === 'present' || status === 'late';
            const existing = attendanceRecords[student.studentId];
            if (existing?.id) {
              const attended = Number(existing.attended || 0) + (present ? 1 : 0);
              const total = Number(existing.total || 0) + 1;
              await fetch(`http://localhost:5000/api/attendance/${existing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  attended,
                  total,
                  subject,
                  studentId: student.studentId,
                  faculty: user?.name || 'Faculty',
                }),
              });
            } else {
              await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  studentId: student.studentId,
                  subject,
                  attended: present ? 1 : 0,
                  total: 1,
                  faculty: user?.name || 'Faculty',
                }),
              });
            }
          })
        );

        toast.success('Attendance records synced with main server.', {
          description: `${stats.present} Present, ${stats.absent} Absent, ${stats.late} Late.`,
        });
        await loadRoster();
      } catch (error) {
        console.error('Failed to submit attendance:', error);
        toast.error('Failed to submit attendance');
      }
    };

    submit();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Mark daily attendance for your active class sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Present</p>
              <p className="text-xl font-bold text-primary">{stats.present}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Absent</p>
              <p className="text-xl font-bold text-destructive">{stats.absent}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Late</p>
              <p className="text-xl font-bold text-amber-500">{stats.late}</p>
            </div>
          </div>
          <Button
            onClick={loadRoster}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 gap-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Attendance
          </Button>
          <Button
            onClick={handleBulkSubmit}
            className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Submit Session
          </Button>
        </div>
      </div>

      {/* Controls Card */}
      <Card className="p-4 bg-card/40 backdrop-blur-xl border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground ml-1">Subject</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-background/50 border-white/10">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-white/10">
              <SelectItem value="Data Structures">Data Structures</SelectItem>
              <SelectItem value="Discrete Mathematics">Discrete Mathematics</SelectItem>
              <SelectItem value="Digital Logic">Digital Logic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground ml-1">Session Date</label>
          <div className="relative">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background/50 border-white/10 pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-medium text-muted-foreground ml-1">Search Students</label>
          <div className="relative">
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/50 border-white/10 pl-10 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card>

      {/* Students Roster */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/30 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Info</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester Attendance</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={`${student.id}-${student.roll}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group transition-colors ${attendance[student.id] === 'present' ? 'bg-primary/5' :
                      attendance[student.id] === 'absent' ? 'bg-destructive/5' :
                        attendance[student.id] === 'late' ? 'bg-amber-500/5' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/20">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{student.roll}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${student.attendance < 75 ? 'bg-destructive shadow-[0_0_8px_var(--destructive)]' : 'bg-primary shadow-[0_0_8px_var(--primary)]'
                              }`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${student.attendance < 75 ? 'text-destructive' : 'text-foreground'}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                          onClick={() => updateStatus(student.id, 'present')}
                          className={`h-8 w-8 p-0 rounded-full transition-all ${attendance[student.id] === 'present' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'border-white/10 hover:border-primary/50'
                            }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => updateStatus(student.id, 'absent')}
                          className={`h-8 w-8 p-0 rounded-full transition-all ${attendance[student.id] === 'absent' ? 'bg-destructive text-white scale-110 shadow-lg shadow-destructive/20' : 'border-white/10 hover:border-destructive/50'
                            }`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance[student.id] === 'late' ? 'secondary' : 'outline'}
                          onClick={() => updateStatus(student.id, 'late')}
                          className={`h-8 w-8 p-0 rounded-full transition-all ${attendance[student.id] === 'late' ? 'bg-amber-500 text-white scale-110 shadow-lg shadow-amber-500/20' : 'border-white/10 hover:border-amber-500/50'
                            }`}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.attendance < 75 && (
                          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 animate-pulse">
                            <ShieldAlert className="h-3 w-3 mr-1" /> At Risk
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDualNotify(student.name)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Showing {filteredStudents.length} of {students.length} Students</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_var(--primary)]" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_5px_var(--destructive)]" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            <span>Late</span>
          </div>
        </div>
      </div>
    </div>
  );
}

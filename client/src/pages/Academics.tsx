import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  User, 
  Award, 
  Calendar, 
  ChevronDown, 
  GraduationCap, 
  Clock,
  LayoutDashboard,
  Filter
} from 'lucide-react';
import { 
  mockAttendanceData, 
  AttendanceData 
} from '@/lib/index';
import { AttendanceTrendChart } from '@/components/Charts';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Extended mock data for schedules since it's not in the core types
const subjectSchedules: Record<string, string[]> = {
  'Data Structures': ['Mon 10:00 AM', 'Wed 11:30 AM'],
  'Discrete Mathematics': ['Tue 09:00 AM', 'Thu 09:00 AM'],
  'Digital Logic Design': ['Mon 02:00 PM', 'Fri 10:00 AM'],
  'Communication Skills': ['Thu 03:00 PM'],
};

const branches = ['COMP', 'ELEC', 'MECH', 'CIVIL', 'CHME'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export default function Academics() {
  const [branch, setBranch] = useState('COMP');
  const [semester, setSemester] = useState('2');

  // Transform trend data for the chart
  const chartData = mockAttendanceData.map(subject => ({
    name: subject.subject,
    ...subject.trend.reduce((acc, val, idx) => ({ ...acc, [`Week ${idx + 1}`]: val }), {})
  }));

  // For the actual chart, let's just pick one subject's trend for a cleaner LineChart view 
  // or average them. Let's provide a generic weekly average for the trend.
  const weeklyTrendData = [1, 2, 3, 4, 5].map(week => ({
    name: `Week ${week}`,
    attendance: mockAttendanceData.reduce((acc, curr) => acc + (curr.trend[week - 1] || curr.trend[curr.trend.length - 1]), 0) / mockAttendanceData.length
  }));

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
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
                {branches.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="h-4 w-px bg-border" />

            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-[140px] bg-transparent border-none focus:ring-0">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(s => (
                  <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="icon" className="bg-card/50">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Attendance Trend Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Attendance Analytics</CardTitle>
                <CardDescription>Aggregate weekly trend across all subjects</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Current Avg: {(mockAttendanceData.reduce((a, b) => a + b.percentage, 0) / mockAttendanceData.length).toFixed(1)}%
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

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockAttendanceData.map((subject) => (
            <motion.div key={subject.subject} variants={itemVariants}>
              <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <GraduationCap className="w-16 h-16" />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                      {subject.credits} Credits
                    </Badge>
                    <div className="text-xs font-mono text-muted-foreground">
                      {subject.percentage}% Attended
                    </div>
                  </div>
                  <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">
                    {subject.subject}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {subject.faculty}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      Weekly Schedule
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subjectSchedules[subject.subject]?.map((time, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 font-normal">
                          {time}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">No schedule posted</span>}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                      View Resources
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-white/5">
                      Assignment Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Quick Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center pt-8 pb-4"
      >
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

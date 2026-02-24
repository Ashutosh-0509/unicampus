import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Award,
  MessageSquare,
  Clock,
  ChevronRight,
  Activity,
  Filter,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

// Mock Faculty Data
const facultyPerformance = [
  {
    id: 'FAC_CS_01',
    name: 'Dr. Vikram Malhotra',
    department: 'Computer Science',
    classesTaken: 48,
    avgAttendance: 88,
    rating: 4.8,
    riskLevel: 'low',
    lastEngagement: '2026-02-19',
    flaggedIssues: []
  },
  {
    id: 'FAC_CS_05',
    name: 'Prof. Sarah Jain',
    department: 'Computer Science',
    classesTaken: 42,
    avgAttendance: 72,
    rating: 4.2,
    riskLevel: 'medium',
    lastEngagement: '2026-02-18',
    flaggedIssues: ['Decreasing attendance trend', 'Low resource interaction']
  },
  {
    id: 'FAC_EE_02',
    name: 'Dr. Amit Singh',
    department: 'Electrical Eng.',
    classesTaken: 35,
    avgAttendance: 58,
    rating: 3.5,
    riskLevel: 'high',
    lastEngagement: '2026-02-15',
    flaggedIssues: ['Attendance below 60% cutoff', 'Delayed feedback cycles']
  },
  {
    id: 'FAC_ME_09',
    name: 'Dr. Rajeev Verma',
    department: 'Mechanical Eng.',
    classesTaken: 50,
    avgAttendance: 82,
    rating: 4.5,
    riskLevel: 'low',
    lastEngagement: '2026-02-20',
    flaggedIssues: []
  },
  {
    id: 'FAC_HS_03',
    name: 'Prof. Elena Gilbert',
    department: 'Humanities',
    classesTaken: 30,
    avgAttendance: 94,
    rating: 4.9,
    riskLevel: 'low',
    lastEngagement: '2026-02-17',
    flaggedIssues: []
  }
];

const aiAlerts = [
  {
    id: 1,
    subject: 'Digital Logic Design',
    faculty: 'Dr. Amit Singh',
    insight: 'Attendance has dropped by 18% in the last 14 days. Students reporting high difficulty in Module 3.',
    priority: 'high'
  },
  {
    id: 2,
    subject: 'Discrete Mathematics',
    faculty: 'Prof. Sarah Jain',
    insight: 'Low resource engagement: 60% of students haven\'t opened the last 3 PDF uploads.',
    priority: 'medium'
  }
];

export default function FacultyOversight() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaculty = facultyPerformance.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-destructive border-destructive/20 bg-destructive/10';
      case 'medium': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      case 'low': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Faculty Oversight
          </h1>
          <p className="text-muted-foreground">AI-assisted faculty performance and engagement monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            Departments
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Activity className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </motion.div>

      {/* AI Engagement Alerts */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {aiAlerts.map((alert) => (
          <motion.div key={alert.id} variants={staggerItem}>
            <Card className="p-5 bg-card/40 backdrop-blur-xl border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${alert.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-500'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] tracking-wider">
                      AI Flagged
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.priority.toUpperCase()} PRIORITY</span>
                  </div>
                  <h3 className="font-semibold text-lg">{alert.subject}</h3>
                  <p className="text-sm text-muted-foreground">Faculty: {alert.faculty}</p>
                  <p className="text-sm mt-3 leading-relaxed border-l-2 border-primary/30 pl-3 italic text-foreground/80">
                    "{alert.insight}"
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-none">
                      Schedule Review
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Performance Ledger */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Faculty Performance Ledger
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search faculty or department..."
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-card/40 backdrop-blur-xl border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Faculty</TableHead>
                <TableHead className="text-muted-foreground font-medium">Classes</TableHead>
                <TableHead className="text-muted-foreground font-medium">Avg Attendance</TableHead>
                <TableHead className="text-muted-foreground font-medium">Student Rating</TableHead>
                <TableHead className="text-muted-foreground font-medium">Risk Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode='popLayout'>
                {filteredFaculty.map((faculty) => (
                  <motion.tr 
                    key={faculty.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {faculty.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{faculty.name}</div>
                          <div className="text-xs text-muted-foreground">{faculty.id} • {faculty.department}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {faculty.classesTaken}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>{faculty.avgAttendance}%</span>
                        </div>
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${faculty.avgAttendance}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${faculty.avgAttendance < 70 ? 'bg-destructive' : 'bg-primary'}`}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="font-mono">{faculty.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`capitalize font-medium ${getRiskColor(faculty.riskLevel)}`}
                      >
                        {faculty.riskLevel} engagement
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:bg-primary/20 text-muted-foreground hover:text-primary">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Quick Summary Row */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[ 
          { label: 'Highly Engaged', value: '82%', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Requires Attention', value: '4', icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Avg Rating', value: '4.4', icon: Award, color: 'text-yellow-500' },
          { label: 'Total Feedbacks', value: '1.2k', icon: MessageSquare, color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Card className="p-4 bg-white/5 border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xl font-bold font-mono">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

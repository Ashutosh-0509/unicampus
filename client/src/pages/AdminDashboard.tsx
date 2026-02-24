import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  CreditCard,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Target,
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/StatsCards';
import { SentimentChart, AttendanceTrendChart, FeeRevenueChart } from '@/components/Charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const ADMIN_STATS = [
  {
    title: 'Total Students',
    value: 2450,
    icon: <Users className="w-5 h-5" />,
    trend: 12,
    suffix: ' Active'
  },
  {
    title: 'Active Placements',
    value: 48,
    icon: <Briefcase className="w-5 h-5" />,
    trend: 5,
    suffix: ' Drives'
  },
  {
    title: 'Overdue Books',
    value: 128,
    icon: <BookOpen className="w-5 h-5" />,
    trend: -8,
    suffix: ' Units'
  },
  {
    title: 'Fee Pending',
    value: '$12.4k',
    icon: <CreditCard className="w-5 h-5" />,
    trend: 2,
    suffix: ' Total'
  }
];

const LOW_ENGAGEMENT_SUBJECTS = [
  { id: '1', subject: 'Advanced Calculus', faculty: 'Dr. Sarah Smith', attendance: 52, risk: 'High' },
  { id: '2', subject: 'Thermodynamics II', faculty: 'Prof. James Bond', attendance: 58, risk: 'Medium' },
  { id: '3', subject: 'Linear Algebra', faculty: 'Dr. Elena Gilbert', attendance: 45, risk: 'High' },
  { id: '4', subject: 'Quantum Physics', faculty: 'Dr. Bruce Banner', attendance: 59, risk: 'Medium' },
];

const SENTIMENT_DATA = [
  { name: 'Positive', value: 65, fill: 'var(--chart-4)' },
  { name: 'Neutral', value: 25, fill: 'var(--chart-5)' },
  { name: 'Negative', value: 10, fill: 'var(--destructive)' },
];

const ATTENDANCE_TREND = [
  { name: 'Week 1', value: 85 },
  { name: 'Week 2', value: 82 },
  { name: 'Week 3', value: 78 },
  { name: 'Week 4', value: 75 },
  { name: 'Week 5', value: 72 },
  { name: 'Week 6', value: 68 },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            variants={fadeInUp}
            className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Institutional Intelligence
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Administrator'}. Here is the campus overview for today.
          </motion.p>
        </div>
        <motion.div variants={fadeInUp} className="flex gap-2" />
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_STATS.map((stat, idx) => (
          <motion.div key={idx} variants={staggerItem}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis Gauge */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Campus Sentiment
              </CardTitle>
              <CardDescription>AI-analyzed feedback from students</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="h-[250px] w-full">
                <SentimentChart data={SENTIMENT_DATA} />
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Positive</p>
                  <p className="text-lg font-bold text-chart-4">65%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                  <p className="text-lg font-bold text-chart-5">25%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Negative</p>
                  <p className="text-lg font-bold text-destructive">10%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Trend Area */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                    Engagement Decline
                  </CardTitle>
                  <CardDescription>Average weekly attendance across all departments</CardDescription>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  Action Required
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <AttendanceTrendChart data={ATTENDANCE_TREND} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section: Alerts & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Engagement Subjects */}
        <motion.div variants={staggerItem}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Low Engagement Alerts
              </CardTitle>
              <CardDescription>Subjects falling below 60% average attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {LOW_ENGAGEMENT_SUBJECTS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-xs text-muted-foreground">{item.faculty}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">{item.attendance}%</div>
                          <div className="text-[10px] text-muted-foreground">Attendance</div>
                        </div>
                        <Badge
                          variant={item.risk === 'High' ? 'destructive' : 'secondary'}
                          className="w-20 justify-center"
                        >
                          {item.risk} Risk
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health / Logs */}
        <motion.div variants={staggerItem}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Administrative Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/20">
                <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Placement Drive Published</p>
                  <p className="text-xs text-muted-foreground">Google India - Software Engineer roles added to portal.</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">2 hours ago</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/20">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Bulk Attendance Reminder Sent</p>
                  <p className="text-xs text-muted-foreground">Notification dispatched to 450 students in high-risk zone.</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">5 hours ago</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/20">
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Fee Ledger Reconciliation</p>
                  <p className="text-xs text-muted-foreground">Semester 2 tuition fees processed for COMP department.</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Yesterday</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

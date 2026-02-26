import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, BookOpen, CreditCard, AlertTriangle,
  TrendingDown, Activity, Target, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/StatsCards';
import { SentimentChart, AttendanceTrendChart } from '@/components/Charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import axios from 'axios';

const API = 'https://unicampus-backend-1p7e.onrender.com';

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
  const { user, getAuthToken } = useAuth();
  const [stats, setStats] = useState({ students: 0, placements: 0, overdueBooks: 0, feePending: 0 });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [lowEngagement, setLowEngagement] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch real data in parallel
        const [usersRes, placementsRes, libraryRes, financeRes, attendanceRes] = await Promise.allSettled([
          axios.get(`${API}/api/users`, { headers }),
          axios.get(`${API}/api/placements`, { headers }),
          axios.get(`${API}/api/library`, { headers }),
          axios.get(`${API}/api/finance`, { headers }),
          axios.get(`${API}/api/attendance`, { headers }),
        ]);

        const students = usersRes.status === 'fulfilled' ? usersRes.value.data?.length || 0 : 0;
        const placements = placementsRes.status === 'fulfilled'
          ? placementsRes.value.data?.filter((p: any) => p.status === 'open')?.length || 0 : 0;
        const overdueBooks = libraryRes.status === 'fulfilled'
          ? libraryRes.value.data?.filter((b: any) => b.status === 'overdue')?.length || 0 : 0;
        const feePending = financeRes.status === 'fulfilled'
          ? financeRes.value.data?.filter((f: any) => f.status === 'pending')?.length || 0 : 0;

        // Low engagement subjects (attendance < 75%)
        if (attendanceRes.status === 'fulfilled') {
          const records = attendanceRes.value.data || [];
          const lowEng = records
            .filter((r: any) => r.percentage < 75)
            .slice(0, 5)
            .map((r: any) => ({
              id: r._id,
              subject: r.subject,
              faculty: r.faculty || 'N/A',
              attendance: r.percentage,
              risk: r.percentage < 65 ? 'High' : 'Medium'
            }));
          setLowEngagement(lowEng);
        }

        setStats({ students, placements, overdueBooks, feePending });
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const adminStats = [
    { title: 'Total Students', value: isLoading ? 0 : stats.students, icon: <Users className="w-5 h-5" />, trend: 12, suffix: ' Active' },
    { title: 'Active Placements', value: isLoading ? 0 : stats.placements, icon: <Briefcase className="w-5 h-5" />, trend: 5, suffix: ' Drives' },
    { title: 'Overdue Books', value: isLoading ? 0 : stats.overdueBooks, icon: <BookOpen className="w-5 h-5" />, trend: -8, suffix: ' Units' },
    { title: 'Fee Pending', value: isLoading ? 0 : stats.feePending, icon: <CreditCard className="w-5 h-5" />, trend: 2, suffix: ' Records' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 variants={fadeInUp}
            className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Institutional Intelligence
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Administrator'}. Here is the campus overview for today.
          </motion.p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat, idx) => (
            <motion.div key={idx} variants={staggerItem}><StatsCard {...stat} /></motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Campus Sentiment
              </CardTitle>
              <CardDescription>AI-analyzed feedback from students</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="h-[250px] w-full"><SentimentChart data={SENTIMENT_DATA} /></div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                <div><p className="text-xs text-muted-foreground">Positive</p><p className="text-lg font-bold text-chart-4">65%</p></div>
                <div><p className="text-xs text-muted-foreground">Neutral</p><p className="text-lg font-bold text-chart-5">25%</p></div>
                <div><p className="text-xs text-muted-foreground">Negative</p><p className="text-lg font-bold text-destructive">10%</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-destructive" /> Engagement Decline
                  </CardTitle>
                  <CardDescription>Average weekly attendance across all departments</CardDescription>
                </div>
                <Badge variant="destructive" className="animate-pulse">Action Required</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full"><AttendanceTrendChart data={ATTENDANCE_TREND} /></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Engagement - Real Data */}
        <motion.div variants={staggerItem}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Engagement Alerts
              </CardTitle>
              <CardDescription>Subjects falling below 75% average attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {lowEngagement.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">✅ All subjects above 75%!</p>
                ) : (
                  <div className="space-y-4">
                    {lowEngagement.map((item) => (
                      <div key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 hover:border-primary/20 transition-colors">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.subject}</span>
                          <span className="text-xs text-muted-foreground">{item.faculty}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-bold">{item.attendance}%</div>
                            <div className="text-[10px] text-muted-foreground">Attendance</div>
                          </div>
                          <Badge variant={item.risk === 'High' ? 'destructive' : 'secondary'} className="w-20 justify-center">
                            {item.risk} Risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Actions */}
        <motion.div variants={staggerItem}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Administrative Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-500/10 text-green-500', title: 'Placement Drive Published', desc: 'New company drive added to portal.', time: '2 hours ago' },
                { icon: <Users className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500', title: 'Bulk Attendance Reminder Sent', desc: `Notifications sent to ${stats.students} students.`, time: '5 hours ago' },
                { icon: <CreditCard className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-500', title: 'Fee Ledger Reconciliation', desc: `${stats.feePending} pending fee records reviewed.`, time: 'Yesterday' },
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-background/20">
                  <div className={`p-2 rounded-full ${action.color}`}>{action.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{action.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

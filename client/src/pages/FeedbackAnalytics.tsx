import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Search,
  Filter,
  Download,
  BrainCircuit
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SentimentChart } from '@/components/Charts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { toast } from 'sonner';

// Mock data for the sentiment donut
const sentimentData = [
  { name: 'Positive', value: 65, color: 'oklch(0.78 0.18 150)' },
  { name: 'Neutral', value: 20, color: 'oklch(0.70 0.18 45)' },
  { name: 'Negative', value: 15, color: 'oklch(0.60 0.22 25)' },
];

// Mock data for subject ratings
const subjectRatingData = [
  { subject: 'Data Structures', rating: 4.8, count: 120 },
  { subject: 'Discrete Maths', rating: 4.2, count: 95 },
  { subject: 'Digital Logic', rating: 3.9, count: 110 },
  { subject: 'Comm. Skills', rating: 4.6, count: 85 },
  { subject: 'Physics II', rating: 3.5, count: 105 },
  { subject: 'Operating Sys', rating: 4.4, count: 90 },
];

// Mock word cloud simulation data
const cloudKeywords = [
  { text: 'Great Faculty', size: 'text-3xl', color: 'text-success' },
  { text: 'Tough Exams', size: 'text-xl', color: 'text-warning' },
  { text: 'Interactive Labs', size: 'text-2xl', color: 'text-primary' },
  { text: 'Modern Tech', size: 'text-xl', color: 'text-accent-foreground' },
  { text: 'Mess Food', size: 'text-lg', color: 'text-destructive' },
  { text: 'Wifi Issues', size: 'text-lg', color: 'text-destructive' },
  { text: 'Flexible Hours', size: 'text-2xl', color: 'text-success' },
  { text: 'Coding Culture', size: 'text-4xl', color: 'text-primary' },
  { text: 'Library Access', size: 'text-xl', color: 'text-accent-foreground' },
  { text: 'Research focus', size: 'text-lg', color: 'text-primary' },
];

// Mock detailed feedback
const recentFeedback = [
  { id: 1, user: 'Anonymous Student', subject: 'Digital Logic', text: 'The course materials could be more updated, the lab equipment is excellent though.', sentiment: 'Neutral', date: '2026-02-19' },
  { id: 2, user: 'Anonymous Student', subject: 'Data Structures', text: 'Dr. Vikram is amazing! The visualization techniques used in class really helped.', sentiment: 'Positive', date: '2026-02-18' },
  { id: 3, user: 'Anonymous Student', subject: 'Physics II', text: 'The assignment deadlines are very tight. Need more time for the complex derivations.', sentiment: 'Negative', date: '2026-02-18' },
  { id: 4, user: 'Anonymous Student', subject: 'Comm. Skills', text: 'Really enjoyed the presentation sessions. Great for confidence building.', sentiment: 'Positive', date: '2026-02-17' },
];

export default function FeedbackAnalytics() {
  const handleExportReport = () => {
    const sections = [
      ['Feedback Analytics Report'],
      [`Generated At`, new Date().toLocaleString()],
      [],
      ['Sentiment Overview'],
      ['Type', 'Value (%)'],
      ...sentimentData.map((item) => [item.name, item.value]),
      [],
      ['Subject-wise Satisfaction'],
      ['Subject', 'Rating', 'Responses'],
      ...subjectRatingData.map((item) => [item.subject, item.rating, item.count]),
      [],
      ['Recent Feedback Logs'],
      ['Date', 'Subject', 'Sentiment', 'User', 'Feedback'],
      ...recentFeedback.map((item) => [item.date, item.subject, item.sentiment, item.user, item.text]),
    ];

    const csv = sections
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Feedback analytics report exported.');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="text-primary" />
            Feedback Analytics
          </h1>
          <p className="text-muted-foreground">AI-powered sentiment analysis and institutional satisfaction metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportReport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Stats & Sentiment Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-1">
          <Card className="h-full bg-card/50 backdrop-blur-xl border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sentiment Overview
              </CardTitle>
              <CardDescription>Aggregate institutional sentiment score</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-0">
              <div className="h-[250px] w-full">
                <SentimentChart data={sentimentData} />
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Positive</p>
                  <p className="text-xl font-bold text-success">65%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Neutral</p>
                  <p className="text-xl font-bold text-warning">20%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Negative</p>
                  <p className="text-xl font-bold text-destructive">15%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className="h-full bg-card/50 backdrop-blur-xl border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Subject-wise Satisfaction
              </CardTitle>
              <CardDescription>Average star rating per academic module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectRatingData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.22 0.04 235)" />
                    <XAxis 
                      dataKey="subject" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'oklch(0.70 0.03 235)', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'oklch(0.70 0.03 235)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.14 0.04 235)', 
                        borderColor: 'oklch(0.22 0.04 235)', 
                        borderRadius: '8px', 
                        color: '#fff' 
                      }}
                    />
                    <Bar dataKey="rating" radius={[4, 4, 0, 0]} barSize={40}>
                      {subjectRatingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.rating > 4 ? 'oklch(0.65 0.25 245)' : 'oklch(0.75 0.18 190)'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Word Cloud & AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="md:col-span-2">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Institutional Keyword Cloud
              </CardTitle>
              <CardDescription>Most frequent terms detected in feedback responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 min-h-[200px] p-6 bg-muted/20 rounded-xl border border-white/5">
                {cloudKeywords.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...springPresets.bouncy, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    className={`cursor-default font-semibold ${word.size} ${word.color} drop-shadow-sm`}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="md:col-span-1">
          <Card className="bg-primary/10 border-primary/20 backdrop-blur-xl shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                AI Risk Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-semibold text-destructive">Low Engagement Detected</p>
                <p className="text-xs text-muted-foreground mt-1">Subject 'Physics II' has seen a 12% drop in satisfaction scores this week. Flagged for review.</p>
              </div>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-success">Faculty Commendation</p>
                <p className="text-xs text-muted-foreground mt-1">Dr. Vikram Malhotra consistently appears in positive sentiment tags related to 'Innovation'.</p>
              </div>
              <Button variant="link" className="text-primary p-0 h-auto text-xs">
                View full AI report →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Feedback List */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Feedback Logs</CardTitle>
              <CardDescription>Latest 50 entries processed by the engine</CardDescription>
            </div>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search feedback..." className="pl-10 bg-muted/50 border-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedback.map((fb) => (
                <motion.div
                  key={fb.id}
                  variants={staggerItem}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-muted/30 border border-white/5 hover:border-primary/30 transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${fb.sentiment === 'Positive' ? 'bg-success/20' : fb.sentiment === 'Negative' ? 'bg-destructive/20' : 'bg-warning/20'}`}>
                      {fb.sentiment === 'Positive' ? <ThumbsUp className="h-5 w-5 text-success" /> : fb.sentiment === 'Negative' ? <ThumbsDown className="h-5 w-5 text-destructive" /> : <AlertCircle className="h-5 w-5 text-warning" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{fb.user}</span>
                      <Badge variant="outline" className="text-[10px] uppercase border-white/10">
                        {fb.subject}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{fb.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{fb.text}"</p>
                  </div>
                  <div className="flex-shrink-0 sm:self-center">
                    <Badge 
                      className={`${
                        fb.sentiment === 'Positive' ? 'bg-success/20 text-success' : 
                        fb.sentiment === 'Negative' ? 'bg-destructive/20 text-destructive' : 
                        'bg-warning/20 text-warning'
                      } border-none`}
                    >
                      {fb.sentiment}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

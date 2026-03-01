import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2,
  Download, Upload, Search, Loader2, Sparkles,
  BookOpen, User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  assignedBy: { _id: string, name: string };
  totalMarks: number;
  submissions: any[];
}

export default function Assignments() {
  const { user, getAuthToken } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const isSubmitted = (assignment: Assignment) => {
    return assignment.submissions?.some(s =>
      (typeof s.studentId === 'string' && s.studentId === user?.id) ||
      (s.studentId?._id === user?.id)
    );
  };

  const pendingAssignments = assignments.filter(a => !isSubmitted(a));
  const completedAssignments = assignments.filter(a => isSubmitted(a));

  const handleFileUpload = async (assignmentId: string) => {
    const toastId = toast.loading('Submitting assignment...');
    try {
      const token = getAuthToken();
      await axios.post(`${API}/api/assignments/${assignmentId}/submit`,
        { file: 'submission_final.pdf' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Assignment submitted successfully!', { id: toastId });
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Submission failed', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Assignments
          </h1>
          <p className="text-muted-foreground mt-1">Track your coursework and submissions</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Semester Progress</p>
            <p className="text-xs text-muted-foreground">
              {completedAssignments.length}/{assignments.length} Completed
            </p>
          </div>
          <Progress value={(completedAssignments.length / (assignments.length || 1)) * 100} className="w-24 h-2" />
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-card/40 backdrop-blur-md border border-white/5">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingAssignments.length > 0 && (
                  <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20 border-none px-1.5 h-4 min-w-[1rem]">
                    {pendingAssignments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              className="pl-9 bg-card/40 border-white/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Fetching assignments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'pending' ? pendingAssignments : completedAssignments)
                .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((assignment, idx) => (
                  <motion.div
                    key={assignment._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl hover:border-primary/30 transition-all group">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {assignment.subject}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {assignment.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {assignment.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 px-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="w-3 h-3 text-primary" />
                            {assignment.assignedBy?.name || 'Faculty'}
                          </div>
                          <div className="h-4 w-px bg-white/10" />
                          <div className="flex items-center gap-1.5 text-xs">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {assignment.totalMarks} Marks
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeTab === 'pending' ? (
                            <>
                              <Button className="flex-1 gap-2 shadow-lg shadow-primary/20"
                                onClick={() => handleFileUpload(assignment._id)}>
                                <Upload className="w-4 h-4" />
                                Submit PDF
                              </Button>
                              <Button variant="outline" size="icon" className="shrink-0 border-white/10">
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="w-full flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5" />
                                Submitted
                              </div>
                              <Button variant="ghost" size="sm" className="text-emerald-500 hover:bg-emerald-500/10">
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && (activeTab === 'pending' ? pendingAssignments : completedAssignments).length === 0 && (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No assignments found</h3>
            <p className="text-muted-foreground">Everything looks good!</p>
          </div>
        )}
      </div>
    </div>
  );
}

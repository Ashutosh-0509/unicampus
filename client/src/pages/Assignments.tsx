import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Check,
  Tag,
  Search,
  AlertCircle
} from 'lucide-react';
import { Assignment } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'https://unicampus-backend-1p7e.onrender.com';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (user?.branch) params.append('branch', user.branch);
        if (user?.semester) params.append('semester', String(user.semester));

        const response = await fetch(
          `${API_BASE}/api/assignments${params.toString() ? `?${params.toString()}` : ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to load assignments');
        }

        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({
          title: 'Assignments unavailable',
          description: 'Unable to load assignments right now.',
          variant: 'destructive',
        });
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [user?.branch, user?.semester, toast]);

  const processUpload = useCallback(async (file: File) => {
    const pendingAssignment = assignments.find((a) => a.status === 'pending') || assignments[0];
    const studentId = user?.studentId || user?.id;

    if (!pendingAssignment) {
      toast({
        title: 'No assignment found',
        description: 'There are no assignments available to submit.',
        variant: 'destructive',
      });
      return;
    }

    if (!studentId) {
      toast({
        title: 'Missing student ID',
        description: 'Please log in again to submit assignments.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'File Detected',
      description: `Uploading ${file.name}...`,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', studentId);

      const response = await fetch(`${API_BASE}/api/assignments/${pendingAssignment.id}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const updated = await response.json();
      const updatedAssignment = updated.assignment || updated;

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === updatedAssignment?.id
            ? { ...assignment, ...updatedAssignment }
            : assignment,
        ),
      );

      toast({
        title: 'Upload Successful',
        description: `${pendingAssignment.title} submitted successfully.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Unable to submit the assignment. Please try again.',
        variant: 'destructive',
      });
    }
  }, [assignments, toast, user?.id, user?.studentId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processUpload(files[0]);
    }
  }, [processUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
      e.target.value = '';
    }
  };

  const handleViewDetails = (assignment: Assignment) => {
    toast({
      title: assignment.title,
      description: `${assignment.subject} • Due ${new Date(assignment.dueDate).toLocaleDateString()} • Status: ${assignment.status}`,
    });
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'graded': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted': return <CheckCircle2 className="w-3 h-3" />;
      case 'graded': return <Check className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
    }
  };

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Coursework & Assessments
          </h1>
          <p className="text-slate-500 mt-1">Track, submit, and manage your academic tasks</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-white border-slate-200 focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.zip,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 p-10
            flex flex-col items-center justify-center text-center space-y-4 cursor-pointer
            ${isDragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
          `}
        >
          <div className="p-3 rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">Click to upload or drag and drop</h3>
            <p className="text-sm text-slate-500">PDF, ZIP, or DOCX (Max 25MB)</p>
          </div>

          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredAssignments.map((asgn, idx) => (
            <motion.div
              key={asgn.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all group bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(asgn.status)}`}>
                      {getStatusIcon(asgn.status)}
                      <span className="capitalize">{asgn.status}</span>
                    </Badge>
                    {asgn.status === 'graded' && (
                      <span className="text-lg font-bold text-primary">
                        {asgn.grade}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                    {asgn.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500">{asgn.subject}</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-4 flex-grow flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wider">
                      <Tag className="w-3 h-3 mr-1 opacity-70" />
                      {asgn.branch}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wider">
                      {asgn.module}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      Due: {new Date(asgn.dueDate).toLocaleDateString()}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs font-semibold text-primary hover:bg-primary/5"
                      onClick={() => handleViewDetails(asgn)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-slate-500">Loading assignments...</div>
      )}

      {!isLoading && filteredAssignments.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-70">
          <div className="p-4 rounded-full bg-slate-100 mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No assessments found</h3>
          <p className="text-slate-500">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}

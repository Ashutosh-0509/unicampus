import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, ShieldCheck, MessageSquare, Info, CheckCircle2 } from 'lucide-react';
import { mockAttendanceData } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RatingState {
  facultyRating: number;
  contentRating: number;
  comment: string;
  submitted: boolean;
}

export default function Feedback() {
  const [feedbackData, setFeedbackData] = useState<Record<string, RatingState>>(
    mockAttendanceData.reduce((acc, curr) => ({
      ...acc,
      [curr.subject]: {
        facultyRating: 0,
        contentRating: 0,
        comment: '',
        submitted: false,
      },
    }), {})
  );

  const handleRating = (subject: string, type: 'facultyRating' | 'contentRating', value: number) => {
    setFeedbackData((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], [type]: value },
    }));
  };

  const handleComment = (subject: string, value: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], comment: value },
    }));
  };

  const handleSubmit = (subject: string) => {
    const data = feedbackData[subject];
    if (data.facultyRating === 0 || data.contentRating === 0) {
      toast.error('Please provide ratings for both faculty and content');
      return;
    }

    // Simulate API call
    setFeedbackData((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], submitted: true },
    }));
    
    toast.success(`Feedback for ${subject} submitted anonymously!`, {
      description: "Your response has been encrypted and stored without your identity.",
      icon: <ShieldCheck className="h-4 w-4 text-primary" />
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string 
  }) => (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-all duration-200",
                star <= value 
                  ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                  : "text-muted/40 hover:text-muted-foreground"
              )}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Academic Feedback</h1>
            <p className="text-muted-foreground mt-1">Help us improve your learning experience for Spring 2026.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium animate-pulse">
            <ShieldCheck className="h-4 w-4" />
            100% End-to-End Anonymous
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-accent-foreground/80 leading-relaxed">
            Your identity is never linked to this feedback. The administration only sees aggregated scores and anonymized text comments to ensure faculty growth and curriculum excellence.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode='popLayout'>
          {mockAttendanceData.map((course, index) => (
            <motion.div
              key={course.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card className="overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl group hover:border-primary/30 transition-colors duration-500">
                <CardHeader className="border-b border-white/5 bg-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-primary">{course.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-medium">Instructor:</span> {course.faculty}
                      </CardDescription>
                    </div>
                    {feedbackData[course.subject].submitted && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        Submitted
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {feedbackData[course.subject].submitted ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
                        <p className="text-sm text-muted-foreground">Your insights help us maintain the highest academic standards.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <StarRating 
                          label="Faculty Performance"
                          value={feedbackData[course.subject].facultyRating}
                          onChange={(val) => handleRating(course.subject, 'facultyRating', val)}
                        />
                        <StarRating 
                          label="Course Content & Quality"
                          value={feedbackData[course.subject].contentRating}
                          onChange={(val) => handleRating(course.subject, 'contentRating', val)}
                        />
                        <div className="pt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <ShieldCheck className="h-3 w-3" />
                          ENCRYPTED SUBMISSION
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Additional Comments (Optional)
                          </Label>
                          <Textarea
                            placeholder="Tell us more about your experience with this subject..."
                            className="min-h-[120px] bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
                            value={feedbackData[course.subject].comment}
                            onChange={(e) => handleComment(course.subject, e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={() => handleSubmit(course.subject)}
                          className="w-full bg-primary hover:bg-primary/80 text-white font-semibold group"
                        >
                          Submit Anonymously
                          <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="pt-12 pb-8 text-center space-y-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            UniCampus Feedback System © 2026
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Secure</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>Private</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span>Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  User, 
  Building2, 
  Briefcase, 
  Send, 
  Download, 
  Eye, 
  Edit3, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const springTransition = { type: 'spring', stiffness: 300, damping: 30 };

export default function RecommendationLetters() {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    recipientName: 'Hiring Manager / Admissions Committee',
    organization: '',
    position: '',
    relationship: 'Professor & Academic Mentor',
    duration: '2 years',
    strengths: '',
    additionalNotes: '',
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Letter Sent Successfully",
        description: `Recommendation for ${formData.studentName} has been dispatched.`,
      });
    }, 1500);
  };

  const letterContent = useMemo(() => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="space-y-6 text-foreground/90 font-sans leading-relaxed">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-bold text-primary">UniCampus Institute of Technology</p>
            <p className="text-xs text-muted-foreground">Department of Computer Science & Engineering</p>
            <p className="text-xs text-muted-foreground">Academic Block A, Sector 62</p>
          </div>
          <p className="text-sm font-medium">{date}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm">To,</p>
          <p className="text-sm font-semibold">{formData.recipientName || '[Recipient Name]'}</p>
          <p className="text-sm">{formData.organization || '[Organization Name]'}</p>
        </div>

        <p className="text-sm font-bold mt-4">
          Subject: Recommendation for {formData.studentName || '[Student Name]'} ({formData.studentId || '[ID]'})
        </p>

        <p className="text-sm">
          I am writing this letter to formally recommend <strong>{formData.studentName || '[Student Name]'}</strong> for the position of <strong>{formData.position || '[Position]'}</strong> at your esteemed organization. Having known {formData.studentName || 'the student'} for over <strong>{formData.duration}</strong> in my capacity as their <strong>{formData.relationship}</strong>, I have had ample opportunity to observe their academic prowess and professional growth.
        </p>

        <p className="text-sm">
          During our time together, {formData.studentName || 'the student'} has consistently demonstrated exceptional skills in {formData.strengths || '[Key Strengths]'}. Their ability to tackle complex problems with innovative solutions is noteworthy. Beyond technical expertise, they possess strong leadership qualities and a collaborative spirit that would make them an asset to any team.
        </p>

        {formData.additionalNotes && (
          <p className="text-sm">
            {formData.additionalNotes}
          </p>
        )}

        <p className="text-sm">
          In conclusion, I give my highest recommendation to {formData.studentName || 'the student'} without any reservations. I am confident that they will excel and contribute significantly to your goals. Please feel free to contact me if you require any further information.
        </p>

        <div className="pt-8 space-y-1">
          <p className="text-sm">Sincerely,</p>
          <div className="h-12 w-32 border-b border-muted-foreground/30 italic flex items-end pb-1 text-primary/60">
            Digital Signature Verified
          </div>
          <p className="text-sm font-bold">Dr. Vikram Malhotra</p>
          <p className="text-xs text-muted-foreground">Senior Professor, Dept. of CSE</p>
          <p className="text-xs text-muted-foreground">UniCampus Faculty ID: FAC_CS_01</p>
        </div>
      </div>
    );
  }, [formData]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400"
          >
            Recommendation Letters
          </motion.h1>
          <p className="text-muted-foreground mt-1">Generate and dispatch professional academic endorsements.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant={isPreviewMode ? "outline" : "default"}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2"
          >
            {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreviewMode ? "Back to Edit" : "Preview Letter"}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!formData.studentName || isSending}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isSending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Send className="w-4 h-4" /></motion.div> : <Send className="w-4 h-4 mr-2" />}
            Send to Student
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <motion.div 
          layout
          className={`lg:col-span-${isPreviewMode ? '5' : '7'} space-y-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Student Details
              </CardTitle>
              <CardDescription>Enter the core details of the candidate and their application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Full Name</Label>
                  <Input 
                    name="studentName" 
                    placeholder="e.g. Aryan Sharma" 
                    value={formData.studentName} 
                    onChange={handleChange}
                    className="bg-background/50 border-white/10 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input 
                    name="studentId" 
                    placeholder="e.g. COMP_101" 
                    value={formData.studentId} 
                    onChange={handleChange}
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Position / Course</Label>
                  <Input 
                    name="position" 
                    placeholder="e.g. Software Engineer Intern" 
                    value={formData.position} 
                    onChange={handleChange}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company / University</Label>
                  <Input 
                    name="organization" 
                    placeholder="e.g. Google India" 
                    value={formData.organization} 
                    onChange={handleChange}
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Endorsement Content
              </CardTitle>
              <CardDescription>Customize the strengths and relationship context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Key Strengths (Comma separated)</Label>
                <Input 
                  name="strengths" 
                  placeholder="e.g. Algorithm Design, Full-stack development, Team leadership" 
                  value={formData.strengths} 
                  onChange={handleChange}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Personal Insights</Label>
                <Textarea 
                  name="additionalNotes" 
                  placeholder="Mention specific projects or exceptional achievements..." 
                  rows={4}
                  value={formData.additionalNotes} 
                  onChange={handleChange}
                  className="bg-background/50 border-white/10 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        <motion.div 
          layout
          className={`lg:col-span-${isPreviewMode ? '7' : '5'}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full min-h-[600px] border-white/10 overflow-hidden relative group shadow-2xl shadow-primary/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Preview
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </CardHeader>

            <Separator className="bg-white/5" />

            <CardContent className="p-8 bg-white/5 h-full overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key="letter-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card p-10 rounded-sm shadow-inner min-h-[700px] border border-white/5"
                >
                  {letterContent}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Floating Hint Overlay */}
            {!isPreviewMode && (
              <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={() => setIsPreviewMode(true)} variant="secondary" className="gap-2 shadow-xl">
                  <Eye className="w-4 h-4" />
                  Enter Full Preview
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <footer className="flex items-center justify-center gap-8 py-8 opacity-40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs">Faculty Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs">Blockchain Timestamped</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-xs">AI Sentiment Optimized</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary), 0.4);
        }
      `}} />
    </div>
  );
}

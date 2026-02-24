import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Trophy,
  Search,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  PlacementDrive,
  formatCampusDate
} from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'https://unicampus-backend-1p7e.onrender.com';
const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offer'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Placements() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedDrives, setAppliedDrives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDrives = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/api/placements`);
        if (!response.ok) {
          throw new Error('Failed to load placement drives');
        }
        const data = await response.json();
        setDrives(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({
          title: 'Placements unavailable',
          description: 'Unable to load placement drives right now.',
          variant: 'destructive',
        });
        setDrives([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrives();
  }, []);

  const filteredDrives = useMemo(() =>
    drives.filter(drive =>
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase())
    ), [drives, searchTerm]
  );

  const handleApply = async (drive: PlacementDrive) => {
    const studentId = user?.studentId || user?.rollNumber || user?.id;
    const cgpa = user?.cgpa ?? 0;

    if (!studentId) {
      toast({
        title: 'Missing student ID',
        description: 'Please log in again to apply for drives.',
        variant: 'destructive',
      });
      return;
    }

    if (cgpa < drive.cutoffCgpa) {
      toast({
        title: 'Eligibility Error',
        description: `Your CGPA (${cgpa}) is below the required ${drive.cutoffCgpa} for this drive.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/placements/${drive.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        throw new Error('Application failed');
      }

      setAppliedDrives(prev => [...prev, drive.id]);
      setDrives(prev => prev.map(item =>
        item.id === drive.id
          ? { ...item, applicants: (item.applicants || 0) + 1 }
          : item
      ));

      toast({
        title: 'Application Successful',
        description: `You have successfully applied for ${drive.company} - ${drive.role}.`,
      });
    } catch (error) {
      toast({
        title: 'Application failed',
        description: 'Unable to apply right now. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const activeDrivesCount = drives.filter((drive) => drive.status === 'open').length;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-br from-primary/20 via-background to-accent/10 border border-primary/20 shadow-2xl shadow-primary/5"
      >
        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-3 py-1">
            Placement Season 2026
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Elevate Your <span className="text-primary">Career Orbit</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Access premium opportunities from top-tier organizations. Your academic excellence meets the industry's highest standards.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Avg. CTC: 24.5 LPA</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Highest: 1.2 Cr</span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -ml-20 -mb-20" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drives', value: activeDrivesCount.toString(), icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Applied', value: appliedDrives.length.toString(), icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: 'Upcoming', value: drives.filter((d) => d.status === 'upcoming').length.toString(), icon: <Calendar className="w-4 h-4" /> },
          { label: 'My Offers', value: '0', icon: <Trophy className="w-4 h-4" /> }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            className="pl-10 bg-card/40 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="border-white/10">All Drives</Button>
          <Button variant="outline" className="border-white/10">Shortlisted</Button>
          <Button variant="outline" className="border-white/10">Eligible</Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading placement drives...</div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredDrives.map((drive) => {
          const isApplied = appliedDrives.includes(drive.id);
          const cgpa = user?.cgpa ?? 0;
          const isEligible = cgpa >= drive.cutoffCgpa;

          return (
            <motion.div key={drive.id} variants={itemVariants}>
              <Card className="group bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <Badge variant={drive.status === 'open' ? 'default' : 'secondary'} className="capitalize">
                      {drive.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-xl">{drive.role}</CardTitle>
                    <CardDescription className="text-foreground/80 font-medium flex items-center gap-1 mt-1">
                      {drive.company} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Package</p>
                      <p className="text-sm font-semibold text-primary">{drive.ctc}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Min. CGPA</p>
                      <p className="text-sm font-semibold">{drive.cutoffCgpa}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {drive.applicants} Applied
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatCampusDate(drive.deadline).split(',')[0]}
                      </span>
                    </div>
                    <Progress value={(drive.applicants / 2000) * 100} className="h-1 bg-white/5" />
                  </div>

                  {isApplied && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-3">Track Status</p>
                      <div className="flex justify-between items-center">
                        {STAGES.map((stage, idx) => (
                          <div key={stage} className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-white/10'}`} />
                            <span className="text-[9px] text-muted-foreground mt-1">{stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full"
                    variant={isApplied ? 'secondary' : isEligible ? 'default' : 'outline'}
                    disabled={isApplied || !isEligible}
                    onClick={() => handleApply(drive)}
                  >
                    {isApplied ? 'Applied' : isEligible ? 'Apply Now' : 'Not Eligible'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {!isLoading && filteredDrives.length === 0 && (
        <div className="text-sm text-muted-foreground">No placement drives match your search.</div>
      )}
    </div>
  );
}

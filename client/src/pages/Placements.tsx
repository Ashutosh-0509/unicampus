import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Placements() {
  const { user, getAuthToken } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const fetchDrives = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API}/api/placements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrives(response.data);
    } catch (error) {
      console.error('Failed to fetch placements:', error);
      toast.error('Failed to load placement opportunities');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const filteredDrives = useMemo(() =>
    drives.filter(drive =>
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [drives, searchTerm]
  );

  const handleApply = async (driveId: string) => {
    setIsApplying(driveId);
    const toastId = toast.loading('Submitting application...');
    try {
      const token = getAuthToken();
      await axios.post(`${API}/api/placements/${driveId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Successfully applied for the drive!', { id: toastId });
      fetchDrives();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Application failed', { id: toastId });
    } finally {
      setIsApplying(null);
    }
  };

  const activeDrivesCount = drives.filter((drive) => drive.status === 'open').length;
  const isAppliedTo = (drive: any) => (drive.applicants || []).some((id: any) => id?.toString() === user?.id);
  const appliedDrivesCount = drives.filter(isAppliedTo).length;

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
            Access premium opportunities from top-tier organizations.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drives', value: activeDrivesCount.toString(), icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Applied', value: appliedDrivesCount.toString(), icon: <CheckCircle2 className="w-4 h-4" /> },
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

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or roles..."
          className="pl-10 bg-card/40 border-white/10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Scouting vacancies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDrives.map((drive) => {
              const isApplied = isAppliedTo(drive);

              return (
                <motion.div key={drive._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="group bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/50 transition-all h-full flex flex-col overflow-hidden">
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
                          {drive.company} <ExternalLink className="w-3 h-3" />
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Package</p>
                          <p className="text-sm font-semibold text-primary">{drive.package || drive.ctc}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Deadline</p>
                          <p className="text-sm font-semibold">{new Date(drive.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {drive.eligibility}
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button
                        className="w-full"
                        variant={isApplied ? 'secondary' : 'default'}
                        disabled={isApplied || drive.status !== 'open' || isApplying === drive._id}
                        onClick={() => handleApply(drive._id)}
                      >
                        {isApplying === drive._id ? <Loader2 className="w-4 h-4 animate-spin" /> : isApplied ? 'Applied' : 'Apply Now'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filteredDrives.length === 0 && (
        <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed text-muted-foreground">
          No placement opportunities match your search.
        </div>
      )}
    </div>
  );
}

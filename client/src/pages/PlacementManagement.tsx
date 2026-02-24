import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Search,
  Briefcase,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import { PlacementDrive } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const initialDrives: PlacementDrive[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Software Engineer (L3)',
    ctc: '32 LPA',
    cutoffCgpa: 8.5,
    deadline: '2026-03-15',
    applicants: 452,
    status: 'open',
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Program Manager Intern',
    ctc: '28 LPA',
    cutoffCgpa: 8.0,
    deadline: '2026-03-20',
    applicants: 310,
    status: 'open',
  },
  {
    id: '3',
    company: 'NVIDIA',
    role: 'Hardware Engineer',
    ctc: '35 LPA',
    cutoffCgpa: 8.7,
    deadline: '2026-02-28',
    applicants: 128,
    status: 'closed',
  },
  {
    id: '4',
    company: 'Adobe',
    role: 'UX Designer',
    ctc: '22 LPA',
    cutoffCgpa: 7.5,
    deadline: '2026-03-10',
    applicants: 89,
    status: 'open',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function PlacementManagement() {
  const [drives, setDrives] = useState<PlacementDrive[]>(initialDrives);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingDrive, setIsAddingDrive] = useState(false);
  const [newDrive, setNewDrive] = useState<Partial<PlacementDrive>>({
    company: '',
    role: '',
    ctc: '',
    cutoffCgpa: 0,
    deadline: '',
    status: 'open',
    applicants: 0,
  });

  // Simulate live applicant increments
  useEffect(() => {
    const interval = setInterval(() => {
      setDrives((prev) =>
        prev.map((drive) => {
          if (drive.status === 'open' && Math.random() > 0.8) {
            return { ...drive, applicants: drive.applicants + Math.floor(Math.random() * 3) };
          }
          return drive;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = (id: string) => {
    setDrives((prev) =>
      prev.map((drive) =>
        drive.id === id
          ? { ...drive, status: drive.status === 'open' ? 'closed' : 'open' }
          : drive
      )
    );
  };

  const handleAddDrive = () => {
    const drive: PlacementDrive = {
      ...newDrive as PlacementDrive,
      id: Math.random().toString(36).substr(2, 9),
    };
    setDrives([drive, ...drives]);
    setIsAddingDrive(false);
    setNewDrive({ company: '', role: '', ctc: '', cutoffCgpa: 0, deadline: '', status: 'open', applicants: 0 });
  };

  const filteredDrives = drives.filter(
    (d) =>
      d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Placement Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage corporate drives and monitor applicant engagement in real-time.</p>
        </div>

        <Dialog open={isAddingDrive} onOpenChange={setIsAddingDrive}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              <Plus className="w-4 h-4 mr-2" />
              New Placement Drive
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Create New Drive</DialogTitle>
              <DialogDescription>
                Fill in the details for the upcoming campus recruitment drive.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="e.g. Google"
                  value={newDrive.company}
                  onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Job Role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Engineer"
                  value={newDrive.role}
                  onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ctc">CTC Offered</Label>
                  <Input
                    id="ctc"
                    placeholder="e.g. 18 LPA"
                    value={newDrive.ctc}
                    onChange={(e) => setNewDrive({ ...newDrive, ctc: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cutoff">CGPA Cutoff</Label>
                  <Input
                    id="cutoff"
                    type="number"
                    step="0.1"
                    placeholder="8.0"
                    value={newDrive.cutoffCgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, cutoffCgpa: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newDrive.deadline}
                  onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingDrive(false)}>Cancel</Button>
              <Button onClick={handleAddDrive}>Publish Drive</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase tracking-wider">
              <Briefcase className="w-3 h-3 mr-1 text-primary" /> Total Active Drives
            </CardDescription>
            <CardTitle className="text-3xl">{drives.filter(d => d.status === 'open').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase tracking-wider">
              <Users className="w-3 h-3 mr-1 text-accent-foreground" /> Total Applications
            </CardDescription>
            <CardTitle className="text-3xl">{drives.reduce((acc, curr) => acc + curr.applicants, 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" /> Success Rate
            </CardDescription>
            <CardTitle className="text-3xl">64%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/30 p-4 rounded-xl border border-border/50">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            className="pl-10 bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {filteredDrives.map((drive) => (
            <motion.div
              key={drive.id}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
            >
              <Card className="relative overflow-hidden bg-card/40 border-border/60 hover:border-primary/50 transition-colors group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                      {drive.status === 'open' ? 'Live' : 'Inactive'}
                    </span>
                    <Switch
                      checked={drive.status === 'open'}
                      onCheckedChange={() => handleToggleStatus(drive.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{drive.company}</CardTitle>
                      <CardDescription className="font-medium text-foreground/80">{drive.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground font-semibold">{drive.ctc}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>Cutoff: <span className="text-foreground font-semibold">{drive.cutoffCgpa} CGPA</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>Ends: <span className="text-foreground font-semibold">{drive.deadline}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <motion.span
                        key={drive.applicants}
                        initial={{ scale: 1.2, color: 'var(--color-primary)' }}
                        animate={{ scale: 1, color: 'var(--color-foreground)' }}
                        className="font-bold"
                      >
                        {drive.applicants} Applicants
                      </motion.span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-border/40">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${drive.id + i}`} alt="applicant" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        +{drive.applicants - 4}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary group">
                      View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>

                {drive.status === 'closed' && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 px-4 py-1 gap-2">
                      <XCircle className="w-4 h-4" /> Drive Closed
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredDrives.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Briefcase className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg">No placement drives found matching your search.</p>
          <Button variant="link" onClick={() => setSearchQuery('')}>Clear Search</Button>
        </div>
      )}
    </div>
  );
}

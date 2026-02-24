import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Droplets,
  Zap,
  Hammer,
  CheckCircle2,
  Clock,
  Upload,
  Camera,
  AlertCircle,
  ChevronRight,
  Plus,
  History,
  ShieldCheck,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data for tickets
const INITIAL_TICKETS = [
  {
    id: 'TKT-7721',
    room: 'B-302',
    category: 'Electrical',
    description: 'Ceiling fan making clicking noise and running slow.',
    status: 'In Progress',
    timestamp: '2026-02-19 10:30',
    progress: 75,
    steps: ['Requested', 'Assigned', 'In Progress', 'Fixed'],
    currentStep: 2,
    priority: 'Medium',
  },
  {
    id: 'TKT-8842',
    room: 'B-302',
    category: 'Plumbing',
    description: 'Minor leakage in the bathroom faucet.',
    status: 'Requested',
    timestamp: '2026-02-20 08:15',
    progress: 25,
    steps: ['Requested', 'Assigned', 'In Progress', 'Fixed'],
    currentStep: 0,
    priority: 'Low',
  },
];

const CATEGORIES = [
  { value: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-400' },
  { value: 'plumbing', label: 'Plumbing', icon: Droplets, color: 'text-blue-400' },
  { value: 'carpentry', label: 'Carpentry', icon: Hammer, color: 'text-orange-400' },
  { value: 'other', label: 'General/Other', icon: Wrench, color: 'text-slate-400' },
];

export default function Hostel() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    room: 'B-302',
    category: 'electrical',
    description: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please add a description before submitting.');
      return;
    }

    setIsSubmitting(true);

    const categoryLabel = CATEGORIES.find((c) => c.value === formData.category)?.label || 'General';

    try {
      const response = await fetch('https://unicampus-backend-1p7e.onrender.com/api/hostel/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: formData.room,
          category: categoryLabel,
          description: formData.description.trim(),
          photoFileName: selectedFile?.name || null,
        }),
      });

      const saved = await response.json().catch(() => null);
      const ticketIdSuffix = saved?.id ? String(saved.id).slice(-4).toUpperCase() : `${Math.floor(1000 + Math.random() * 9000)}`;

      const newTicket = {
        id: `TKT-${ticketIdSuffix}`,
        room: formData.room,
        category: categoryLabel,
        description: formData.description.trim(),
        status: 'Requested',
        timestamp: new Date().toLocaleString(),
        progress: 25,
        steps: ['Requested', 'Assigned', 'In Progress', 'Fixed'],
        currentStep: 0,
        priority: 'Medium',
      };

      setTickets((prev) => [newTicket, ...prev]);
      setFormData((prev) => ({ ...prev, description: '', category: 'electrical' }));
      setSelectedFile(null);

      if (!response.ok) {
        toast.success('Ticket added locally and shown in Active Requests.');
      } else {
        toast.success('Ticket submitted successfully! Our team will be assigned shortly.');
      }
    } catch (error) {
      const offlineTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        room: formData.room,
        category: categoryLabel,
        description: formData.description.trim(),
        status: 'Requested',
        timestamp: new Date().toLocaleString(),
        progress: 25,
        steps: ['Requested', 'Assigned', 'In Progress', 'Fixed'],
        currentStep: 0,
        priority: 'Medium',
      };
      setTickets((prev) => [offlineTicket, ...prev]);
      setFormData((prev) => ({ ...prev, description: '', category: 'electrical' }));
      setSelectedFile(null);
      toast.success('Ticket added to Active Requests.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = (id: string) => {
    setTickets(tickets.filter(t => t.id !== id));
    toast.success("Ticket resolved and closed. Thank you for the feedback!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hostel Maintenance
          </h1>
          <p className="text-muted-foreground mt-1">
            Report issues and track your maintenance requests in real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Room B-302 Verified
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-cyan-400 to-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Raise New Ticket
              </CardTitle>
              <CardDescription>
                Provide details about the issue for faster resolution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      value={formData.room}
                      disabled
                      className="bg-muted/50 border-white/5 font-mono text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-muted/30 border-white/10">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-white/10">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className={`w-4 h-4 ${cat.color}`} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    className="min-h-[100px] bg-muted/30 border-white/10 focus:border-primary/50 transition-colors"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photo Evidence (Optional)</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${selectedFile ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-3">
                        <Camera className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-muted/50">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Drag & drop or click to upload
                        </p>
                      </>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit Maintenance Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-200/80">
              <span className="font-semibold text-amber-500">Emergency:</span> For urgent issues like gas leaks or major fire hazards, please call the 24/7 Security Helpline at <span className="font-mono">+91 9988776655</span>.
            </p>
          </div>
        </div>

        {/* Right Column: Active Tickets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Active Requests
            </h2>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {tickets.length} Active
            </Badge>
          </div>

          <AnimatePresence mode="popLayout">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {ticket.id}
                            </span>
                            <Badge
                              variant="outline"
                              className={ticket.priority === 'High' ? 'border-destructive/50 text-destructive' : 'border-primary/30 text-primary'}
                            >
                              {ticket.priority} Priority
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mt-2">{ticket.category} Issue</h3>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            {ticket.timestamp}
                          </div>
                          <Badge className="bg-primary/20 text-primary border-none">
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Status Tracker */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-medium px-1">
                          {ticket.steps.map((step, i) => (
                            <div
                              key={step}
                              className={`flex flex-col items-center gap-2 ${i <= ticket.currentStep ? 'text-primary' : 'text-muted-foreground/50'
                                }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${i <= ticket.currentStep ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-muted'
                                }`} />
                              {step}
                            </div>
                          ))}
                        </div>
                        <div className="relative">
                          <Progress value={ticket.progress} className="h-1.5 bg-muted/30" />
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 bg-primary w-3 h-3 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                            style={{ left: `${ticket.progress}%` }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-6 py-4 bg-muted/20 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Wrench className="w-4 h-4" />
                        Assigned: Technical Staff - Unit 4
                      </div>
                      {ticket.currentStep === 3 ? (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(ticket.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Resolved
                        </Button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {tickets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium">All clear!</h3>
                <p className="text-sm text-muted-foreground">No active maintenance tickets for your room.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

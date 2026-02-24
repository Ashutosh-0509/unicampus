import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Youtube,
  Link as LinkIcon,
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
  Archive,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'YouTube' | 'Notes' | 'Archive' | 'Link';
  url: string;
  branch: string;
  semester: number;
  timestamp: string;
  subject: string;
}

const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Advanced Data Structures - Lecture 08',
    type: 'PDF',
    url: 'https://example.com/ds-lec-08.pdf',
    branch: 'COMP',
    semester: 4,
    timestamp: '2026-02-18T10:30:00Z',
    subject: 'Data Structures',
  },
  {
    id: '2',
    title: 'Understanding Dijkstra\'s Algorithm',
    type: 'YouTube',
    url: 'https://youtube.com/watch?v=example',
    branch: 'COMP',
    semester: 4,
    timestamp: '2026-02-15T14:20:00Z',
    subject: 'Algorithms',
  },
  {
    id: '3',
    title: 'Semester 4 Math Formula Sheet',
    type: 'Notes',
    url: 'https://example.com/math-formulas.pdf',
    branch: 'COMP',
    semester: 4,
    timestamp: '2026-02-10T09:00:00Z',
    subject: 'Discrete Mathematics',
  },
];

const TYPE_ICONS = {
  PDF: <FileText className="w-5 h-5 text-red-400" />,
  YouTube: <Youtube className="w-5 h-5 text-red-600" />,
  Notes: <BookOpen className="w-5 h-5 text-blue-400" />,
  Archive: <Archive className="w-5 h-5 text-amber-400" />,
  Link: <LinkIcon className="w-5 h-5 text-emerald-400" />,
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'PDF' as Resource['type'],
    url: '',
    subject: '',
    branch: 'COMP',
    semester: '4',
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    const newResource: Resource = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      type: formData.type,
      url: formData.url,
      subject: formData.subject || 'General',
      branch: formData.branch,
      semester: parseInt(formData.semester),
      timestamp: new Date().toISOString(),
    };

    setResources([newResource, ...resources]);
    setFormData({ ...formData, title: '', url: '', subject: '' });
    
    toast({
      title: 'Resource Posted',
      description: 'Your material has been shared with the students.',
    });
  };

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight text-foreground"
        >
          Academic Resources
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Share course materials, lecture notes, and study guides with your students.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* POST FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Post New Resource
              </CardTitle>
              <CardDescription>Fill in the details to upload a resource.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Unit 2 Review Notes"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background/50 border-border/50 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="w-full bg-background/50 border-border/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="YouTube">YouTube Video</SelectItem>
                      <SelectItem value="Notes">Lecture Notes</SelectItem>
                      <SelectItem value="Archive">Project Archive (ZIP)</SelectItem>
                      <SelectItem value="Link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g. Data Structures"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL / Link</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select value={formData.branch} onValueChange={(val) => setFormData({ ...formData, branch: val })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMP">CS</SelectItem>
                        <SelectItem value="ELEC">EE</SelectItem>
                        <SelectItem value="MECH">ME</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={formData.semester} onValueChange={(val) => setFormData({ ...formData, semester: val })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            Sem {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  Post Resource
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* COURSE FEED */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or subject..."
                className="pl-10 bg-card/50 border-border/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {filteredResources.length} Resources Found
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource, idx) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group border-border/30 bg-card/30 hover:bg-card/50 transition-all hover:border-primary/30 backdrop-blur-sm">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-background/50 border border-border/30 group-hover:border-primary/20 transition-colors shadow-sm">
                        {TYPE_ICONS[resource.type as keyof typeof TYPE_ICONS]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-border/50">
                            {resource.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(resource.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Badge className="bg-accent text-accent-foreground border-none">
                              {resource.branch} - Sem {resource.semester}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-muted-foreground hover:text-destructive transition-colors"
                              onClick={() => setResources(resources.filter(r => r.id !== resource.id))}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 border-border/50 hover:border-primary/50"
                              asChild
                            >
                              <a href={resource.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredResources.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium">No resources found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

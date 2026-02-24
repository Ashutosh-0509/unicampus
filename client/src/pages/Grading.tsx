import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  FileSpreadsheet,
  TrendingUp,
  Users,
  ChevronDown,
  Search,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { GradeDistributionChart } from '@/components/Charts';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useToast } from '@/components/ui/use-toast';

interface StudentMark {
  id: string;
  name: string;
  rollNo: string;
  attendance: number;
  midSem: number;
  endSem: number;
  assignment: number;
  total: number;
  grade: string;
}

const INITIAL_STUDENTS: StudentMark[] = [
  { id: '1', name: 'Aryan Sharma', rollNo: 'COMP_101', attendance: 92, midSem: 26, endSem: 48, assignment: 18, total: 92, grade: 'A+' },
  { id: '2', name: 'Priya Verma', rollNo: 'COMP_102', attendance: 85, midSem: 22, endSem: 42, assignment: 16, total: 80, grade: 'A' },
  { id: '3', name: 'Rohan Gupta', rollNo: 'COMP_103', attendance: 78, midSem: 18, endSem: 35, assignment: 14, total: 67, grade: 'B' },
  { id: '4', name: 'Sanya Malhotra', rollNo: 'COMP_104', attendance: 95, midSem: 28, endSem: 52, assignment: 19, total: 99, grade: 'O' },
  { id: '5', name: 'Ishaan Singh', rollNo: 'COMP_105', attendance: 65, midSem: 12, endSem: 25, assignment: 10, total: 47, grade: 'D' },
  { id: '6', name: 'Ananya Rao', rollNo: 'COMP_106', attendance: 88, midSem: 24, endSem: 40, assignment: 17, total: 81, grade: 'A' },
  { id: '7', name: 'Kabir Das', rollNo: 'COMP_107', attendance: 72, midSem: 15, endSem: 30, assignment: 12, total: 57, grade: 'C' },
  { id: '8', name: 'Meera Iyer', rollNo: 'COMP_108', attendance: 91, midSem: 27, endSem: 45, assignment: 18, total: 90, grade: 'A+' },
];

const calculateGrade = (total: number) => {
  if (total >= 90) return 'A+';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  return 'F';
};

export default function Grading() {
  const [students, setStudents] = useState<StudentMark[]>(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [examType, setExamType] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const stats = useMemo(() => {
    const totals = students.map(s => s.total);
    const mean = totals.reduce((a, b) => a + b, 0) / students.length;
    const sorted = [...totals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const distribution = {
      'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
    };

    students.forEach(s => {
      const g = calculateGrade(s.total);
      distribution[g as keyof typeof distribution]++;
    });

    const chartData = Object.entries(distribution).map(([name, value]) => ({ name, value }));

    return {
      mean: mean.toFixed(1),
      median,
      chartData,
      passPercentage: ((students.filter(s => s.total >= 50).length / students.length) * 100).toFixed(1)
    };
  }, [students]);

  const handleMarkChange = (id: string, field: keyof StudentMark, value: string) => {
    const numValue = Math.min(Math.max(0, parseInt(value) || 0), field === 'endSem' ? 60 : field === 'midSem' ? 30 : 20);

    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        const updated = { ...student, [field]: numValue };
        updated.total = updated.midSem + updated.endSem + updated.assignment;
        updated.grade = calculateGrade(updated.total);
        return updated;
      }
      return student;
    }));
  };

  const handleSave = () => {
    localStorage.setItem('grading_marksheet_cs201', JSON.stringify(students));
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Progress Saved',
        description: 'Marks have been saved locally on this device.',
      });
    }, 1000);
  };

  const handleAddMarks = () => {
    const nextIndex = students.length + 1;
    const newStudent: StudentMark = {
      id: `new_${Date.now()}`,
      name: `New Student ${nextIndex}`,
      rollNo: `COMP_${100 + nextIndex}`,
      attendance: 0,
      midSem: 0,
      endSem: 0,
      assignment: 0,
      total: 0,
      grade: 'F',
    };

    setStudents((prev) => [newStudent, ...prev]);
    toast({
      title: 'Row Added',
      description: 'A new marks entry row has been added.',
    });
  };

  const handleExportCsv = () => {
    const rows = filteredStudents.map((student) => {
      const percentage = student.total;
      return {
        rollNo: student.rollNo,
        name: student.name,
        midSem: student.midSem,
        endSem: student.endSem,
        assignment: student.assignment,
        total: student.total,
        percentage,
        grade: student.grade,
      };
    });

    const header = ['Roll No', 'Student Name', 'Mid (30)', 'End (60)', 'Assignment (10)', 'Total (100)', 'Percentage', 'Grade'];
    const csvLines = [
      header.join(','),
      ...rows.map((r) => [
        r.rollNo,
        r.name,
        r.midSem,
        r.endSem,
        r.assignment,
        r.total,
        `${r.percentage}%`,
        r.grade,
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grades_cs201_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV Exported',
      description: `${rows.length} student records exported successfully.`,
    });
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="p-6 space-y-8 min-h-screen"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Grading & Assessment</h1>
          <p className="text-muted-foreground">Section: CSE-A | Subject: Data Structures (CS201)</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger className="w-[180px] glass border-white/10">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assessments</SelectItem>
              <SelectItem value="midSem">Mid Term (30)</SelectItem>
              <SelectItem value="endSem">End Term (60)</SelectItem>
              <SelectItem value="assignment">Assignment (10)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddMarks}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Marks
          </Button>

          <Button onClick={handleExportCsv} variant="outline" className="glass border-white/10">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="glass border-white/10 hover:bg-white/5"
          >
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Calculator className="w-4 h-4" />
              </motion.div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Syncing...' : 'Save Progress'}
          </Button>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerItem}>
          <Card className="glass border-white/5 bg-white/5 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Mean Score</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.mean}</h3>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass border-white/5 bg-white/5 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Median Score</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.median}</h3>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass border-white/5 bg-white/5 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Pass Percentage</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.passPercentage}%</h3>
                </div>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass border-white/5 bg-white/5 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">At Risk (F)</p>
                  <h3 className="text-2xl font-bold mt-1 text-destructive">{stats.chartData.find(d => d.name === 'F')?.value || 0}</h3>
                </div>
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marks Entry Spreadsheet */}
        <Card className="lg:col-span-2 glass border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Marksheet Editor</CardTitle>
                <CardDescription>Live updates to distribution as you type</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search roll or name..."
                  className="pl-10 glass border-white/10 focus:ring-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="w-[200px]">Student</TableHead>
                  {(examType === 'all' || examType === 'midSem') && <TableHead>Mid (30)</TableHead>}
                  {(examType === 'all' || examType === 'endSem') && <TableHead>End (60)</TableHead>}
                  {(examType === 'all' || examType === 'assignment') && <TableHead>Assgn (10)</TableHead>}
                  <TableHead>Total (100)</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode='popLayout'>
                  {filteredStudents.map((student) => (
                    <motion.tr
                      layout
                      key={student.id}
                      className="border-white/10 transition-colors hover:bg-white/5 group"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{student.rollNo}</span>
                        </div>
                      </TableCell>
                      {(examType === 'all' || examType === 'midSem') && (
                        <TableCell>
                          <Input
                            type="number"
                            value={student.midSem}
                            onChange={(e) => handleMarkChange(student.id, 'midSem', e.target.value)}
                            className="w-20 glass border-white/10 group-hover:border-primary/50 text-center"
                          />
                        </TableCell>
                      )}
                      {(examType === 'all' || examType === 'endSem') && (
                        <TableCell>
                          <Input
                            type="number"
                            value={student.endSem}
                            onChange={(e) => handleMarkChange(student.id, 'endSem', e.target.value)}
                            className="w-20 glass border-white/10 group-hover:border-primary/50 text-center"
                          />
                        </TableCell>
                      )}
                      {(examType === 'all' || examType === 'assignment') && (
                        <TableCell>
                          <Input
                            type="number"
                            value={student.assignment}
                            onChange={(e) => handleMarkChange(student.id, 'assignment', e.target.value)}
                            className="w-20 glass border-white/10 group-hover:border-primary/50 text-center"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="font-mono font-bold text-lg">{student.total}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`
                            ${student.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' :
                              student.grade === 'B' ? 'bg-blue-500/20 text-blue-400' :
                                student.grade === 'F' ? 'bg-destructive/20 text-destructive' :
                                  'bg-amber-500/20 text-amber-400'}
                            border-none
                          `}
                        >
                          {student.grade}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Visual Analytics */}
        <div className="space-y-6">
          <Card className="glass border-white/10 bg-white/5 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Grade Distribution
                <Badge variant="secondary" className="ml-auto">Bell Curve</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              <GradeDistributionChart data={stats.chartData} />
            </CardContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                {stats.chartData.map((d) => (
                  <div key={d.name} className="p-3 rounded-lg border border-white/5 bg-white/5 text-center">
                    <p className="text-xs text-muted-foreground">Grade {d.name}</p>
                    <p className="text-xl font-bold">{d.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20 bg-primary/5 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The distribution shows a slight negative skew. 3 students are within 5 marks of the 'A' grade threshold. Consider reviewing assignment weightage to normalize performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

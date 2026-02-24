import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Clock,
  AlertTriangle,
  Plus,
  Barcode,
  Send,
  Database,
  CheckCircle2,
  Filter,
  MoreVertical,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

// Mock Data for Library Stats
const stats = [
  { title: 'Total Inventory', value: '12,450', icon: <Database className="w-5 h-5" />, color: 'text-blue-400' },
  { title: 'Borrowed Books', value: '1,842', icon: <BookOpen className="w-5 h-5" />, color: 'text-cyan-400' },
  { title: 'Overdue Books', value: '124', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-destructive' },
  { title: 'Active Reservations', value: '56', icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
];

// Mock Overdue Data
const overdueBooks = [
  { id: '1', title: 'Introduction to Algorithms', borrower: 'Aryan Sharma', sid: 'COMP_101', dueDate: '2026-02-15', daysLate: 5 },
  { id: '2', title: 'Neural Networks & Deep Learning', borrower: 'Priya Verma', sid: 'AI_205', dueDate: '2026-02-18', daysLate: 2 },
  { id: '3', title: 'Operating Systems Concepts', borrower: 'Rahul Das', sid: 'COMP_112', dueDate: '2026-02-10', daysLate: 10 },
  { id: '4', title: 'Compiler Design', borrower: 'Sanya Gupta', sid: 'IT_304', dueDate: '2026-02-19', daysLate: 1 },
];

// Mock Inventory Data
const inventory = [
  { id: 'BK-001', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', status: 'Available', shelf: 'A-12' },
  { id: 'BK-002', title: 'Design Patterns', author: 'Erich Gamma', isbn: '978-0201633610', status: 'Borrowed', shelf: 'B-04' },
  { id: 'BK-003', title: 'Refactoring', author: 'Martin Fowler', isbn: '978-0134757599', status: 'Available', shelf: 'A-15' },
  { id: 'BK-004', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0135957059', status: 'Maintenance', shelf: 'M-01' },
];

export default function LibraryManagement() {
  const [isbn, setIsbn] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [newBook, setNewBook] = useState<any>(null);

  const handleIsbnLookup = () => {
    if (!isbn) return;
    setIsSearching(true);
    // Simulate API Delay
    setTimeout(() => {
      setNewBook({
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        publisher: 'Pearson',
        year: '2021',
        category: 'Computer Science',
      });
      setIsSearching(false);
      toast({
        title: "ISBN Data Retrieved",
        description: "Book details auto-filled successfully.",
      });
    }, 1200);
  };

  const handleBulkReminder = () => {
    toast({
      title: "Reminders Sent",
      description: "Notification sent to all 124 students with overdue books.",
    });
  };

  const handleSingleReminder = (name: string) => {
    toast({
      title: "Reminder Sent",
      description: `Individual alert sent to ${name}.`,
    });
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Library Management</h1>
          <p className="text-muted-foreground">Monitor inventory, handle returns, and manage overdue records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sync Inventory
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ISBN Lookup & Add Book */}
        <Card className="xl:col-span-1 bg-card/50 backdrop-blur-xl border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-primary" />
              ISBN Quick Lookup
            </CardTitle>
            <CardDescription>Enter ISBN to auto-fill book metadata from Global Library Database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="e.g. 978-013235..."
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="bg-background/50 border-white/10 focus:ring-primary"
                />
              </div>
              <Button 
                onClick={handleIsbnLookup} 
                disabled={isSearching} 
                variant="secondary"
                className="bg-accent/20 hover:bg-accent/40"
              >
                {isSearching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            <AnimatePresence>
              {newBook && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-white/5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Book Title</label>
                    <p className="text-sm font-medium">{newBook.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</label>
                      <p className="text-sm">{newBook.author}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</label>
                      <p className="text-sm">{newBook.year}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shelf Assignment</label>
                    <Input placeholder="e.g. C-42" className="h-8 text-xs bg-background/30" />
                  </div>
                  <Button className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Entry to Catalog
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!newBook && !isSearching && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                <BookOpen className="w-12 h-12" />
                <p className="text-sm px-8">Scan or type an ISBN to fetch verified bibliographic data.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue List */}
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-xl border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Overdue Records
              </CardTitle>
              <CardDescription>Real-time list of books past their due dates.</CardDescription>
            </div>
            <Button onClick={handleBulkReminder} variant="destructive" size="sm" className="shadow-lg shadow-destructive/20">
              <Send className="w-4 h-4 mr-2" />
              Bulk Remind All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead>Book & Borrower</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Lateness</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBooks.map((book) => (
                  <TableRow key={book.id} className="border-white/5 group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{book.title}</span>
                        <span className="text-xs text-muted-foreground">{book.borrower} • {book.sid}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{book.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {book.daysLate} days late
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-primary/10 text-primary"
                        onClick={() => handleSingleReminder(book.borrower)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="bg-card/50 backdrop-blur-xl border-white/5">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Global Book Inventory</CardTitle>
            <CardDescription>Searchable catalog of all registered items in the system.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search catalog..." className="pl-9 bg-background/30 border-white/5" />
            </div>
            <Button variant="outline" size="icon" className="border-white/5">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead>ID</TableHead>
                <TableHead>Book Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.author} • ISBN: {item.isbn}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${
                          item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.status === 'Borrowed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }
                      `}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.shelf}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <p>Showing 1-4 of 12,450 results</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="h-8 border-white/5">Previous</Button>
              <Button variant="outline" size="sm" className="h-8 border-white/5">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

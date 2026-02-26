import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarCheck,
  Filter,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'http://localhost:5000';
const BORROW_WINDOW_DAYS = 14;

export default function Library() {
  const { user, getAuthToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowLoading, setIsBorrowLoading] = useState(true);

  const studentId = user?.studentId || user?.rollNumber || user?.id;
  const getBookId = (book: any) => book?.id || book?._id || book?.bookId || book?.isbn;
  const getBorrowKey = (book: any, index: number) => {
    const base = book?.id || book?._id || book?.bookId || book?.isbn || 'borrow';
    const due = book?.dueDate || 'no-date';
    return `${base}-${due}-${index}`;
  };

  const loadCatalog = useCallback(async (query?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      const authToken = getAuthToken();

      const response = await fetch(
        `${API_BASE}/api/library/books/search${params.toString() ? `?${params.toString()}` : ''}`,
        authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined
      );

      if (!response.ok) {
        throw new Error('Failed to load catalog');
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setCatalog(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Unable to load library catalog right now.');
      setCatalog([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const loadBorrowed = useCallback(async () => {
    if (!studentId) {
      setBorrowedBooks([]);
      setIsBorrowLoading(false);
      return;
    }

    try {
      setIsBorrowLoading(true);
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE}/api/library/my-books`,
        authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined
      );

      if (!response.ok) {
        throw new Error('Failed to load borrowed books');
      }

      const payload = await response.json();
      const data = payload?.data ?? payload;
      setBorrowedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Unable to load borrowed books right now.');
      setBorrowedBooks([]);
    } finally {
      setIsBorrowLoading(false);
    }
  }, [studentId, getAuthToken]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    loadBorrowed();
  }, [loadBorrowed]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, catalog]);

  const handleReserve = (book: any) => {
    setSelectedBook(book);
  };

  const confirmReservation = async () => {
    if (!selectedBook || !studentId) {
      toast.error('Please log in to reserve a book.');
      return;
    }

    const bookId = getBookId(selectedBook);
    if (!bookId) {
      toast.error('Unable to reserve this book right now.');
      return;
    }

    try {
      const authToken = getAuthToken();
      const response = await fetch(`${API_BASE}/api/library/reserve/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Reservation failed');
      }

      toast.success(`Successfully reserved "${selectedBook.title}"! You'll be notified when it's ready.`);
      setSelectedBook(null);
      loadCatalog(searchQuery);
      loadBorrowed();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to reserve this book right now.');
    }
  };

  const handleRenew = async (issueId: string | undefined, title: string) => {
    if (!issueId) {
      toast.error('Unable to renew this book right now.');
      return;
    }

    try {
      const authToken = getAuthToken();
      const response = await fetch(`${API_BASE}/api/library/renew/${issueId}`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Renewal failed');
      }

      toast.success(`Renewal approved for "${title}".`);
      loadBorrowed();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to renew this book right now.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/20 shadow-2xl shadow-primary/5">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Book className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Digital Library Nexus
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Access over 50,000 technical journals, academic papers, and textbooks powered by UniCampus AI.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 h-12 bg-background/50 backdrop-blur-md border-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8 font-semibold" onClick={() => loadCatalog(searchQuery)}>
              Find Resources
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              Active Borrows
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {borrowedBooks.length} Items
            </Badge>
          </div>

          <div className="space-y-4">
            {isBorrowLoading && (
              <div className="text-sm text-muted-foreground">Loading borrowed books...</div>
            )}

            {!isBorrowLoading && borrowedBooks.length === 0 && (
              <div className="text-sm text-muted-foreground">No active borrowings for your account.</div>
            )}

            {borrowedBooks.map((book, index) => {
              const daysRemaining = book.daysRemaining ?? 0;
              const isOverdue = Boolean(book.isOverdue) || daysRemaining < 0;
              const isUrgent = Boolean(book.isUrgent) || daysRemaining <= 2;
              const normalizedRemaining = Math.max(0, Math.min(BORROW_WINDOW_DAYS, daysRemaining));
              const progress = Math.round(((BORROW_WINDOW_DAYS - normalizedRemaining) / BORROW_WINDOW_DAYS) * 100);
              const suggestion = isOverdue
                ? 'Urgent: Return immediately to avoid fines.'
                : isUrgent
                ? 'Due soon. Renew now to avoid penalties.'
                : 'You are on track. Keep an eye on the due date.';

              return (
                <motion.div
                  key={getBorrowKey(book, index)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-xl border p-5 bg-card/50 backdrop-blur-xl transition-all shadow-sm ${isOverdue ? 'border-destructive/30' : 'border-white/10'}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {book.bookTitle || book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{book.author || 'Library Catalog'}</p>
                      </div>
                      {isOverdue && (
                        <Badge variant="destructive" className="animate-pulse">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> Due: {new Date(book.dueDate).toLocaleDateString()}
                        </span>
                        <span className="font-mono">{isOverdue ? 'Critical' : 'Safe'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full ${isOverdue ? 'bg-destructive' : 'bg-primary'}`}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 flex gap-2 items-start">
                      <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed text-accent-foreground font-medium">
                        {suggestion}
                      </p>
                    </div>

                    <Button
                      variant={isOverdue ? 'destructive' : 'outline'}
                      className="w-full text-xs h-9"
                      onClick={() => handleRenew(getBookId(book), book.bookTitle || book.title)}
                      disabled={isOverdue}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Renew Book
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Library Catalog
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs">Recent</Button>
              <Button variant="ghost" size="sm" className="text-xs">Popular</Button>
            </div>
          </div>

          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading catalog...</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode='popLayout'>
              {filteredCatalog.map((book, index) => (
                <motion.div
                  key={getBookId(book) || `catalog-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-white/10">
                          {book.category}
                        </Badge>
                        <span className={`text-[10px] font-bold ${book.available > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                          {book.available > 0 ? `${book.available} Available` : 'Waitlisted'}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold mt-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="text-xs">{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <Info className="w-3 h-3" /> ISBN: {book.isbn}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            className="w-full text-xs bg-primary/5 hover:bg-primary/20 text-primary border border-primary/10"
                            onClick={() => handleReserve(book)}
                          >
                            <CalendarCheck className="w-3 h-3 mr-2" />
                            Reserve Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              Confirm Reservation
                            </DialogTitle>
                            <DialogDescription>
                              Reserve "{selectedBook?.title}" by {selectedBook?.author}? We will notify you when it is ready for pickup.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setSelectedBook(null)}>
                              Cancel
                            </Button>
                            <Button onClick={confirmReservation}>Confirm</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!isLoading && filteredCatalog.length === 0 && (
            <div className="text-sm text-muted-foreground">No books match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

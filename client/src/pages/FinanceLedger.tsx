import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Filter,
  FileText,
  ArrowUpRight,
  CreditCard,
  Calendar,
  User as UserIcon,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FeeRevenueChart } from '@/components/Charts';
import { ROUTE_PATHS } from '@/lib/index';

// Mock Ledger Data
const LEDGER_DATA = [
  { id: 'F001', student: 'Aryan Sharma', studentId: 'COMP_101', branch: 'COMP', total: 125000, paid: 125000, balance: 0, status: 'paid', date: '2026-01-15' },
  { id: 'F002', student: 'Isha Patel', studentId: 'ELEC_205', branch: 'ELEC', total: 110000, paid: 60000, balance: 50000, status: 'partial', date: '2026-01-20' },
  { id: 'F003', student: 'Rohan Gupta', studentId: 'MECH_112', branch: 'MECH', total: 105000, paid: 0, balance: 105000, status: 'overdue', date: '2026-01-05' },
  { id: 'F004', student: 'Sanya Malhotra', studentId: 'COMP_401', branch: 'COMP', total: 125000, paid: 125000, balance: 0, status: 'paid', date: '2026-01-12' },
  { id: 'F005', student: 'Vikram Singh', studentId: 'CIVIL_102', branch: 'CIVIL', total: 95000, paid: 95000, balance: 0, status: 'paid', date: '2026-02-01' },
  { id: 'F006', student: 'Ananya Rao', studentId: 'ELEC_108', branch: 'ELEC', total: 110000, paid: 40000, balance: 70000, status: 'partial', date: '2026-02-05' },
  { id: 'F007', student: 'Karan Mehra', studentId: 'COMP_202', branch: 'COMP', total: 125000, paid: 0, balance: 125000, status: 'overdue', date: '2025-12-28' },
  { id: 'F008', student: 'Priya Verma', studentId: 'MECH_303', branch: 'MECH', total: 105000, paid: 105000, balance: 0, status: 'paid', date: '2026-01-28' },
];

const REVENUE_TREND_DATA = [
  { name: 'Jan', revenue: 4500000 },
  { name: 'Feb', revenue: 5200000 },
  { name: 'Mar', revenue: 4800000 },
  { name: 'Apr', revenue: 6100000 },
  { name: 'May', revenue: 5900000 },
  { name: 'Jun', revenue: 7200000 },
];

export default function FinanceLedger() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'overdue'>('all');

  const filteredData = useMemo(() => {
    return LEDGER_DATA.filter(item => {
      const matchesSearch = item.student.toLowerCase().includes(search.toLowerCase()) || 
                            item.studentId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const exportToCSV = () => {
    const headers = ['ID', 'Student', 'Student ID', 'Branch', 'Total', 'Paid', 'Balance', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        [row.id, row.student, row.studentId, row.branch, row.total, row.paid, row.balance, row.status, row.date].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `UniCampus_Finance_Ledger_2026.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 gap-1"><Clock className="w-3 h-3" /> Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30 gap-1"><AlertCircle className="w-3 h-3" /> Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <CreditCard className="text-primary w-8 h-8" />
            Finance Ledger
          </h1>
          <p className="text-muted-foreground mt-1">Manage student fee accounts and institutional revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-primary/20 hover:border-primary/50 text-primary transition-all"
            onClick={exportToCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Revenue Analytics Chart */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Institutional Revenue Trend</CardTitle>
            <CardDescription>Consolidated fee collection across all branches (2026)</CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full text-primary font-medium text-sm">
            <ArrowUpRight className="w-4 h-4" />
            +12.4% vs last year
          </div>
        </CardHeader>
        <CardContent className="h-[350px]">
          <FeeRevenueChart data={REVENUE_TREND_DATA} />
        </CardContent>
      </Card>

      {/* Ledger Table Section */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Fee Records</CardTitle>
              <CardDescription>Detailed breakdown of student payment status</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or ID..."
                  className="pl-9 w-64 border-white/10 bg-background/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/10">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-white/10 bg-popover/90 backdrop-blur-md">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('partial')}>Partial Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('overdue')}>Overdue Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-mono text-xs text-primary">{row.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{row.student}</div>
                            <div className="text-xs text-muted-foreground">{row.studentId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-white/5 font-normal">{row.branch}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{row.total.toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-400">₹{row.paid.toLocaleString()}</TableCell>
                      <TableCell className={row.balance > 0 ? 'text-rose-400' : 'text-muted-foreground'}>
                        ₹{row.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Calendar className="w-3 h-3" />
                          {row.date}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No financial records match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/20 text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Collected</div>
            <div className="text-xl font-bold">₹4,25,00,000</div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/20 text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Pending Dues</div>
            <div className="text-xl font-bold text-amber-500">₹85,20,000</div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-500/20 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Defaulters Count</div>
            <div className="text-xl font-bold text-rose-500">42 Students</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

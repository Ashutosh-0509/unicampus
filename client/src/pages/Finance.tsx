import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  History,
  ReceiptText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeeRevenueChart } from '@/components/Charts';
import { springPresets, fadeInUp, staggerContainer } from '@/lib/motion';

const feeBreakdown = [
  { category: 'Tuition Fee', amount: 85000, status: 'Unpaid', dueDate: '2026-03-15' },
  { category: 'Hostel Rent', amount: 35000, status: 'Paid', dueDate: '2026-01-10' },
  { category: 'Mess Charges', amount: 18000, status: 'Unpaid', dueDate: '2026-02-28' },
  { category: 'Library & Labs', amount: 7500, status: 'Paid', dueDate: '2026-01-10' },
  { category: 'Examination Fee', amount: 5000, status: 'Unpaid', dueDate: '2026-04-01' },
];

const paymentHistory = [
  { id: 'TXN_9921', date: '2026-01-05', amount: 42500, method: 'Net Banking', status: 'Success' },
  { id: 'TXN_8842', date: '2025-08-12', amount: 125000, method: 'Credit Card', status: 'Success' },
  { id: 'TXN_7710', date: '2025-01-20', amount: 118000, method: 'UPI', status: 'Success' },
];

const semesterTrend = [
  { semester: 'Sem 1', amount: 115000 },
  { semester: 'Sem 2', amount: 120000 },
  { semester: 'Sem 3', amount: 125000 },
  { semester: 'Sem 4', amount: 130500 },
  { semester: 'Sem 5', amount: 135000 },
  { semester: 'Sem 6', amount: 150500 },
];

const Finance: React.FC = () => {
  const totalDue = feeBreakdown
    .filter((item) => item.status === 'Unpaid')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Summary Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="md:col-span-2">
          <Card className="bg-card/40 backdrop-blur-xl border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard size={120} className="text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="text-muted-foreground font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Total Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-5xl font-bold text-foreground tracking-tighter">
                    ₹{totalDue.toLocaleString()}
                  </h2>
                  <p className="text-destructive flex items-center gap-1 mt-2 text-sm font-medium animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    Next payment due in 8 days
                  </p>
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/25 px-8">
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-muted-foreground font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-foreground" />
                Fee Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[150px] flex items-center justify-center">
              <FeeRevenueChart data={semesterTrend} />
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fee Breakdown Table */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-primary" />
              Current Semester Fee Breakdown
            </h3>
            <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent-foreground">
              Academic Year 2025-26
            </Badge>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeBreakdown.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {item.dueDate}
                    </TableCell>
                    <TableCell className="font-semibold">₹{item.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.status === 'Paid' ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex w-fit items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 flex w-fit items-center gap-1">
                          <Clock className="w-3 h-3" /> Unpaid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Recent Activity / History */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Payment History
          </h3>
          
          <div className="space-y-4">
            {paymentHistory.map((txn, idx) => (
              <Card key={idx} className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{txn.id}</p>
                      <p className="font-semibold mt-1">₹{txn.amount.toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-primary/5">
                      {txn.method}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                    <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                      <Download className="w-3 h-3" /> Receipt
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ReceiptText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Need Financial Aid?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scholarship applications for Sem 7 are now open. Check eligibility.
                  </p>
                  <button className="text-xs text-primary font-bold mt-2 hover:underline">
                    Apply Now →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Finance;

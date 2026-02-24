import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

interface SignupRequest {
  _id: string;
  name: string;
  email: string;
  branch: string;
  rollNumber: string;
  year: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

const StudentSignupManagement = () => {
  const { user, getAuthToken } = useAuth();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingSignups = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5000/api/auth/pending-signups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch signups:', error);
      toast.error('Failed to load signup requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingSignups();
    }
  }, [user]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      await axios.post(
        `http://localhost:5000/api/auth/approve-signup/${selectedRequest._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Signup Approved', {
        description: `${selectedRequest.name} has been approved.`
      });

      setShowApproveDialog(false);
      setSelectedRequest(null);
      fetchPendingSignups();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      await axios.post(
        `http://localhost:5000/api/auth/reject-signup/${selectedRequest._id}`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Signup Rejected', {
        description: `${selectedRequest.name}'s application has been rejected.`
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchPendingSignups();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending_approval: {
      icon: Clock,
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      color: 'bg-green-100 text-green-800',
      iconColor: 'text-green-600'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Signup Management</h1>
          <p className="text-muted-foreground mt-2">Review and approve new student registrations</p>
        </div>
        <Button onClick={fetchPendingSignups} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs - Pending, Approved, Rejected */}
      <div className="grid grid-cols-3 gap-4">
        {['pending_approval', 'approved', 'rejected'].map((status) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          const count = requests.filter(r => r.status === status).length;

          return (
            <Card key={status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">{status === 'pending_approval' ? 'Awaiting action' : 'Total'}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review and approve or reject student signup requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.filter(r => r.status === 'pending_approval').length > 0 ? (
            <div className="space-y-3">
              {requests
                .filter(r => r.status === 'pending_approval')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{request.rollNumber}</Badge>
                        <Badge variant="outline">{request.branch}</Badge>
                        <Badge variant="outline">Year {request.year}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApproveDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No pending applications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved & Rejected History */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Approved */}
        {requests.filter(r => r.status === 'approved').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Applications ({requests.filter(r => r.status === 'approved').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests
                  .filter(r => r.status === 'approved')
                  .map((request) => (
                    <div key={request._id} className="p-3 border rounded-lg bg-green-50/50">
                      <p className="font-medium text-sm">{request.name}</p>
                      <p className="text-xs text-muted-foreground">{request.rollNumber}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejected */}
        {requests.filter(r => r.status === 'rejected').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Applications ({requests.filter(r => r.status === 'rejected').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests
                  .filter(r => r.status === 'rejected')
                  .map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg bg-red-50/50">
                      <p className="font-medium text-sm">{request.name}</p>
                      <p className="text-xs text-muted-foreground">{request.rollNumber}</p>
                      {request.rejectionReason && (
                        <p className="text-xs text-red-700 mt-1">Reason: {request.rejectionReason}</p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Approve Student Signup?</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedRequest && (
              <>
                <p className="font-medium mb-2">{selectedRequest.name}</p>
                <p>{selectedRequest.email}</p>
                <p>{selectedRequest.rollNumber} • {selectedRequest.branch}</p>
                <p className="mt-4 text-sm">This student will be able to log in to their account.</p>
              </>
            )}
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Student Signup</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <p className="mt-2">{selectedRequest.name} ({selectedRequest.rollNumber})</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason (optional)</label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSignupManagement;

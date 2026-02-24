import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, BookOpen, Award, FileText, Wrench, CreditCard, X, Loader2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
  senderName?: string;
  senderId?: string;
  action?: {
    label: string;
    path: string;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  'alert-triangle': <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  'book': <BookOpen className="h-4 w-4 text-blue-500" />,
  'file-text': <FileText className="h-4 w-4 text-purple-500" />,
  'wrench': <Wrench className="h-4 w-4 text-orange-500" />,
  'credit-card': <CreditCard className="h-4 w-4 text-red-500" />,
  'award': <Award className="h-4 w-4 text-green-500" />,
  'file-edit': <FileText className="h-4 w-4 text-indigo-500" />,
  'alert-circle': <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const typeToPath: Record<string, string> = {
  'attendance': '/student/attendance',
  'assignment': '/student/assignments',
  'library': '/student/library',
  'hostel': '/student/hostel',
  'finance': '/student/finance',
  'academic': '/student/academics',
  'faculty': '/faculty/recommendations',
  'admin': '/admin/dashboard',
  'placement': '/student/placements',
};

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { user, getAuthToken } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get('https://unicampus-backend-1p7e.onrender.com/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(response.data.notifications || response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = getAuthToken();
      await axios.patch(
        `https://unicampus-backend-1p7e.onrender.com/api/notifications/${notificationId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Show detail modal
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleNavigateFromModal = () => {
    if (selectedNotification) {
      const path = typeToPath[selectedNotification.type];
      if (path) {
        navigate(path);
        setShowDetailModal(false);
        setIsOpen(false);
      }
    }
  };

  const handleClearAll = async () => {
    try {
      const token = getAuthToken();
      await axios.post(
        'https://unicampus-backend-1p7e.onrender.com/api/notifications/clear-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0 border-0 shadow-2xl" align="end">
        <div className="flex flex-col h-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    notifications.forEach(n => !n.read && handleMarkAsRead(n.id));
                  }}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearAll}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-accent/50",
                      !notification.read && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {iconMap[notification.icon] || <Clock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>

      {/* Notification Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              {/* Icon & Title */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {iconMap[selectedNotification.icon] || <Clock className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{selectedNotification.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedNotification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* From Label */}
              {selectedNotification.senderName && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase">From</p>
                  <p className="text-sm font-semibold mt-1">{selectedNotification.senderName}</p>
                </div>
              )}

              {/* Message/Details */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Details</p>
                <p className="text-sm text-foreground mt-2 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {selectedNotification.type}
                </Badge>
                {!selectedNotification.read && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">Unread</Badge>
                )}
              </div>

              {/* Action Buttons */}
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {typeToPath[selectedNotification.type] && (
                  <Button
                    onClick={handleNavigateFromModal}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    View Page
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Popover>
  );
};

// Utility function for combining classNames (if not already imported)
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default NotificationCenter;

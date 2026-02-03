/**
 * Admin Notifications Module
 * View logs, resend failed, send manual notifications
 */
import { useState, useEffect } from 'react';
import { 
  Bell, Mail, RefreshCw, Send, Filter, 
  CheckCircle2, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface NotificationLog {
  id: string;
  user_id: string | null;
  order_id: string | null;
  channel: string;
  category: string;
  template: string;
  title: string;
  body: string;
  status: string;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  profiles?: { email: string; full_name: string } | null;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  queued: number;
}

export default function AdminNotificationsModule() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, failed: 0, queued: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Manual notification form
  const [manualNotification, setManualNotification] = useState({
    user_email: '',
    title: '',
    body: '',
    channel: 'email' as 'email' | 'in_app',
    template: 'custom'
  });

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Build base query - note: profiles relation may not exist for all users
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      // Filter in JS since we may have type issues with enum filtering
      let filtered = (data || []) as unknown as NotificationLog[];
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(n => n.status === statusFilter);
      }
      if (channelFilter !== 'all') {
        filtered = filtered.filter(n => n.channel === channelFilter);
      }

      setNotifications(filtered);

      // Calculate stats from all data
      const allNotifs = (data || []) as unknown as NotificationLog[];
      setStats({
        total: allNotifs.length,
        sent: allNotifs.filter(n => n.status === 'sent').length,
        failed: allNotifs.filter(n => n.status === 'failed').length,
        queued: allNotifs.filter(n => n.status === 'queued').length
      });

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter, channelFilter]);

  const handleResend = async (notification: NotificationLog) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/notifications-api?action=admin-resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`
          },
          body: JSON.stringify({ notification_id: notification.id })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Notification resent',
          description: 'The notification has been queued for delivery'
        });
        fetchNotifications();
      } else {
        throw new Error(result.error || 'Failed to resend');
      }

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleSendManual = async () => {
    if (!manualNotification.user_email || !manualNotification.title || !manualNotification.body) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/notifications-api?action=admin-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`
          },
          body: JSON.stringify({
            user_email: manualNotification.user_email,
            title: manualNotification.title,
            body: manualNotification.body,
            channel: manualNotification.channel,
            template: 'custom'
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Notification sent',
          description: `Email sent to ${manualNotification.user_email}`
        });
        setSendDialogOpen(false);
        setManualNotification({
          user_email: '',
          title: '',
          body: '',
          channel: 'email',
          template: 'custom'
        });
        fetchNotifications();
      } else {
        throw new Error(result.error || 'Failed to send');
      }

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sent: 'default',
      failed: 'destructive',
      queued: 'secondary',
      read: 'outline'
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notification Center
          </h2>
          <p className="text-muted-foreground">Manage email and in-app notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Manual Notification</DialogTitle>
                <DialogDescription>
                  Send a custom notification to a user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient Email *</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={manualNotification.user_email}
                    onChange={(e) => setManualNotification(prev => ({ ...prev, user_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    value={manualNotification.channel}
                    onValueChange={(v) => setManualNotification(prev => ({ ...prev, channel: v as 'email' | 'in_app' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="in_app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject / Title *</Label>
                  <Input
                    placeholder="Notification title"
                    value={manualNotification.title}
                    onChange={(e) => setManualNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Notification message..."
                    rows={4}
                    value={manualNotification.body}
                    onChange={(e) => setManualNotification(prev => ({ ...prev, body: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendManual} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Notification'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-2xl font-bold">{stats.queued}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[180px]">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Label className="text-xs text-muted-foreground">Channel</Label>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notification.status)}
                          {getStatusBadge(notification.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {notification.profiles?.email || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.profiles?.full_name || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={notification.title}>
                          {notification.title}
                        </div>
                        {notification.error_message && (
                          <div className="text-xs text-destructive truncate max-w-[200px]" title={notification.error_message}>
                            Error: {notification.error_message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {notification.template}
                        </code>
                      </TableCell>
                      <TableCell>
                        {notification.sent_at ? (
                          <div className="text-sm">
                            {format(new Date(notification.sent_at), 'MMM d, HH:mm')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResend(notification)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Resend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {notifications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No notifications found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

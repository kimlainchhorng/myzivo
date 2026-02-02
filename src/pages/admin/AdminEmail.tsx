/**
 * Admin Email Management Panel
 * 
 * Configure email settings, view logs, manage automation
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Mail, Settings, Send, Clock, Users, Download, 
  CheckCircle, XCircle, AlertCircle, RefreshCw 
} from "lucide-react";
import { format } from "date-fns";

interface EmailSettingValue {
  enabled?: boolean;
  delay_minutes?: number;
  from_name?: string;
  reply_to?: string;
  response_window_hours?: number;
}

interface EmailSetting {
  id: string;
  setting_key: string;
  setting_value: EmailSettingValue;
  description: string | null;
  is_active: boolean | null;
}

interface EmailLog {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  resend_id?: string;
  error_message?: string;
  search_session_id?: string;
  booking_ref?: string;
  partner_name?: string;
  sent_at?: string;
  created_at: string;
}

export default function AdminEmail() {
  const queryClient = useQueryClient();
  const [logFilter, setLogFilter] = useState<string>('all');

  // Fetch email settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as EmailSetting[];
    },
  });

  // Fetch email logs
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['email-logs', logFilter],
    queryFn: async () => {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (logFilter !== 'all') {
        query = query.eq('email_type', logFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EmailLog[];
    },
  });

  // Update settings mutation
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Partial<EmailSetting['setting_value']> }) => {
      const currentSetting = settings?.find(s => s.setting_key === key);
      const newValue = { ...currentSetting?.setting_value, ...value };
      
      const { error } = await supabase
        .from('email_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast.success('Settings updated');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Export logs
  const handleExportLogs = () => {
    if (!logs) return;
    
    const csv = [
      ['Date', 'Type', 'Recipient', 'Subject', 'Status', 'Booking Ref', 'Partner', 'Error'].join(','),
      ...logs.map(log => [
        log.created_at,
        log.email_type,
        log.recipient_email,
        `"${log.subject.replace(/"/g, '""')}"`,
        log.status,
        log.booking_ref || '',
        log.partner_name || '',
        log.error_message || '',
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      abandoned_search: 'Abandoned Search',
      redirect_confirmation: 'Redirect Confirmation',
      booking_status: 'Booking Status',
      support_auto_reply: 'Support Auto-Reply',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Email Automation
          </h1>
          <p className="text-muted-foreground">
            Manage email settings, view logs, and configure automation
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Send className="w-4 h-4" />
            Email Logs
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {settingsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {settings?.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getEmailTypeLabel(setting.setting_key)}
                          {setting.setting_value.enabled ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{setting.description}</CardDescription>
                      </div>
                      <Switch
                        checked={setting.setting_value.enabled}
                        onCheckedChange={(enabled) => 
                          updateSetting.mutate({ key: setting.setting_key, value: { enabled } })
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Name</Label>
                        <Input
                          value={setting.setting_value.from_name || 'Hizovo Travel'}
                          onChange={(e) => 
                            updateSetting.mutate({ 
                              key: setting.setting_key, 
                              value: { from_name: e.target.value } 
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reply-To Email</Label>
                        <Input
                          type="email"
                          value={setting.setting_value.reply_to || 'support@hizovo.com'}
                          onChange={(e) => 
                            updateSetting.mutate({ 
                              key: setting.setting_key, 
                              value: { reply_to: e.target.value } 
                            })
                          }
                        />
                      </div>
                    </div>
                    
                    {setting.setting_key === 'abandoned_search' && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Delay Before Sending (minutes)
                        </Label>
                        <Input
                          type="number"
                          min={15}
                          max={1440}
                          value={setting.setting_value.delay_minutes || 45}
                          onChange={(e) => 
                            updateSetting.mutate({ 
                              key: setting.setting_key, 
                              value: { delay_minutes: parseInt(e.target.value) } 
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Wait this long after search before sending recovery email
                        </p>
                      </div>
                    )}
                    
                    {setting.setting_key === 'support_auto_reply' && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Response Window (hours)
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={72}
                          value={setting.setting_value.response_window_hours || 24}
                          onChange={(e) => 
                            updateSetting.mutate({ 
                              key: setting.setting_key, 
                              value: { response_window_hours: parseInt(e.target.value) } 
                            })
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Select value={logFilter} onValueChange={setLogFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="abandoned_search">Abandoned Search</SelectItem>
                <SelectItem value="redirect_confirmation">Redirect Confirmation</SelectItem>
                <SelectItem value="booking_status">Booking Status</SelectItem>
                <SelectItem value="support_auto_reply">Support Auto-Reply</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading logs...
                </div>
              ) : !logs?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  No email logs found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Partner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getEmailTypeLabel(log.email_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.recipient_email}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.partner_name || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

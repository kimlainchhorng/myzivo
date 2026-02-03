/**
 * Admin: Seller of Travel Settings
 * Manage SOT registration status for compliance
 */

import { useState, useEffect } from 'react';
import { Shield, Save, Clock, CheckCircle, AlertTriangle, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/lib/security/auditLog';
import type { Json } from '@/integrations/supabase/types';

interface SoTRegistration {
  state: string;
  status: 'pending' | 'active';
  registrationNumber: string;
  updatedAt?: string;
}

interface SoTAuditEntry {
  id: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

const defaultRegistrations: SoTRegistration[] = [
  { state: 'California', status: 'pending', registrationNumber: '' },
  { state: 'Florida', status: 'pending', registrationNumber: '' },
];

export default function SellerOfTravelSettings() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<SoTRegistration[]>(defaultRegistrations);
  const [auditLogs, setAuditLogs] = useState<SoTAuditEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current settings and audit logs
  useEffect(() => {
    loadSettings();
    loadAuditLogs();
  }, []);

  const loadSettings = async () => {
    // In a real implementation, this would fetch from a settings table
    // For now, we use localStorage as a placeholder
    const stored = localStorage.getItem('zivo_sot_registrations');
    if (stored) {
      try {
        setRegistrations(JSON.parse(stored));
      } catch {
        setRegistrations(defaultRegistrations);
      }
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'compliance')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setAuditLogs(data.map(log => ({
          ...log,
          old_values: log.old_values as Record<string, unknown> | null,
          new_values: log.new_values as Record<string, unknown> | null,
        })));
      }
    } catch {
      console.error('Failed to load audit logs');
    }
  };

  const handleStatusChange = (state: string, status: 'pending' | 'active') => {
    setRegistrations(prev => 
      prev.map(reg => 
        reg.state === state ? { ...reg, status, updatedAt: new Date().toISOString() } : reg
      )
    );
    setHasChanges(true);
  };

  const handleRegistrationNumberChange = (state: string, registrationNumber: string) => {
    setRegistrations(prev => 
      prev.map(reg => 
        reg.state === state ? { ...reg, registrationNumber, updatedAt: new Date().toISOString() } : reg
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const oldSettings = localStorage.getItem('zivo_sot_registrations');
      const oldValues = oldSettings ? JSON.parse(oldSettings) : defaultRegistrations;
      
      // Save to localStorage (placeholder - use Supabase in production)
      localStorage.setItem('zivo_sot_registrations', JSON.stringify(registrations));

      // Log audit event
      await logAuditEvent({
        action: 'security_settings_change',
        entityType: 'compliance',
        entityId: 'seller_of_travel',
        oldValues: oldValues as Json,
        newValues: registrations as unknown as Json,
      });

      toast({
        title: 'Settings Saved',
        description: 'Seller of Travel registration settings have been updated.',
      });

      setHasChanges(false);
      loadAuditLogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Seller of Travel Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage SOT registration status for U.S. compliance
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Registration Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {registrations.map((reg) => (
          <Card key={reg.state} className={reg.status === 'active' ? 'border-emerald-500/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{reg.state}</CardTitle>
                <Badge variant={reg.status === 'active' ? 'default' : 'secondary'}>
                  {reg.status === 'active' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </Badge>
              </div>
              <CardDescription>
                Seller of Travel registration for {reg.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={reg.status}
                  onValueChange={(value) => handleStatusChange(reg.state, value as 'pending' | 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Pending
                      </span>
                    </SelectItem>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Active
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  placeholder="Enter registration number"
                  value={reg.registrationNumber}
                  onChange={(e) => handleRegistrationNumberChange(reg.state, e.target.value)}
                  disabled={reg.status === 'pending'}
                />
                {reg.status === 'pending' && (
                  <p className="text-xs text-muted-foreground">
                    Set status to Active to enter registration number
                  </p>
                )}
              </div>

              {reg.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(reg.updatedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning if Pending */}
      {registrations.some(r => r.status === 'pending') && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Registration Pending
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Some registrations are pending. The checkout disclosure will display "registration pending" 
                  until you update the status to Active and add the registration number.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Changes
          </CardTitle>
          <CardDescription>
            Audit log of Seller of Travel setting changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {log.new_values ? JSON.stringify(log.new_values).slice(0, 100) + '...' : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No changes recorded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * DispatchDevices Page
 * 
 * Admin page for managing registered push notification devices.
 * Shows device tokens, allows revoking and testing push notifications.
 */

import React, { useState } from 'react';
import { useDeviceTokens, useDeviceStats, useRevokeToken, useDeleteToken, useSendTestPush } from '@/hooks/useDeviceManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Smartphone, 
  Monitor, 
  Bell, 
  BellOff, 
  Trash2, 
  Send,
  RefreshCw,
  Apple,
  Chrome
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'ios':
      return <Apple className="h-4 w-4" />;
    case 'android':
      return <Smartphone className="h-4 w-4" />;
    case 'web':
      return <Chrome className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const getPlatformBadgeVariant = (platform: string) => {
  switch (platform) {
    case 'ios':
      return 'default';
    case 'android':
      return 'secondary';
    case 'web':
      return 'outline';
    default:
      return 'outline';
  }
};

const DispatchDevices: React.FC = () => {
  const { data: tokens, isLoading, refetch } = useDeviceTokens();
  const { data: stats } = useDeviceStats();
  const revokeToken = useRevokeToken();
  const deleteToken = useDeleteToken();
  const sendTestPush = useSendTestPush();
  
  const [confirmAction, setConfirmAction] = useState<{
    type: 'revoke' | 'delete';
    tokenId: string;
    userName?: string;
  } | null>(null);

  const handleRevoke = (tokenId: string, userName?: string) => {
    setConfirmAction({ type: 'revoke', tokenId, userName });
  };

  const handleDelete = (tokenId: string, userName?: string) => {
    setConfirmAction({ type: 'delete', tokenId, userName });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'revoke') {
      revokeToken.mutate(confirmAction.tokenId);
    } else {
      deleteToken.mutate(confirmAction.tokenId);
    }
    
    setConfirmAction(null);
  };

  const handleSendTest = (userId: string) => {
    sendTestPush.mutate({ userId });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">
            Manage registered push notification devices
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total ?? <Skeleton className="h-8 w-12" />}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active ?? <Skeleton className="h-8 w-12" />}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>iOS Devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {stats?.byPlatform?.ios ?? <Skeleton className="h-8 w-8" />}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Android Devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {stats?.byPlatform?.android ?? <Skeleton className="h-8 w-8" />}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
          <CardDescription>
            All devices registered for push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map(token => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <div className="font-medium">
                        {token.profile?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.profile?.email || token.user_id?.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPlatformBadgeVariant(token.platform) as "default" | "secondary" | "outline"}>
                        <span className="flex items-center gap-1.5">
                          {getPlatformIcon(token.platform)}
                          {token.platform.toUpperCase()}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {token.device_name || 'Unknown Device'}
                      </div>
                      {token.app_version && (
                        <div className="text-xs text-muted-foreground">
                          v{token.app_version}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {token.last_used_at ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {token.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Bell className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500">
                          <BellOff className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendTest(token.user_id)}
                          disabled={!token.is_active || sendTestPush.isPending}
                          title="Send test notification"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        {token.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(token.id, token.profile?.full_name || undefined)}
                            disabled={revokeToken.isPending}
                            title="Revoke token"
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(token.id, token.profile?.full_name || undefined)}
                          disabled={deleteToken.isPending}
                          className="text-destructive hover:text-destructive"
                          title="Delete token"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No devices registered yet</p>
              <p className="text-sm">Devices will appear here when users enable push notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'revoke' ? 'Revoke Token' : 'Delete Token'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'revoke' ? (
                <>
                  This will disable push notifications for{' '}
                  <strong>{confirmAction.userName || 'this user'}</strong>.
                  They can re-enable by logging in again.
                </>
              ) : (
                <>
                  This will permanently delete the device token for{' '}
                  <strong>{confirmAction?.userName || 'this user'}</strong>.
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmAction?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmAction?.type === 'revoke' ? 'Revoke' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DispatchDevices;

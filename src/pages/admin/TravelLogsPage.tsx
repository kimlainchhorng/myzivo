import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Plane, 
  Building2, 
  Car, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  usePartnerRedirectLogs, 
  useTravelPartners,
  RedirectLogsFilters,
  TravelPartnerType,
  PartnerBookingStatus,
  PartnerRedirectLog
} from "@/hooks/useTravelAdminData";
import { format } from "date-fns";

const getTypeIcon = (type: TravelPartnerType) => {
  switch (type) {
    case 'flights':
      return <Plane className="h-4 w-4 text-sky-500" />;
    case 'hotels':
      return <Building2 className="h-4 w-4 text-purple-500" />;
    case 'cars':
      return <Car className="h-4 w-4 text-emerald-500" />;
  }
};

const getStatusBadge = (status: PartnerBookingStatus) => {
  switch (status) {
    case 'returned':
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Returned
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'timeout':
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Timeout
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
};

const TravelLogsPage = () => {
  const [filters, setFilters] = useState<RedirectLogsFilters>({});
  const [limit, setLimit] = useState(100);
  
  const { data: logs, isLoading, refetch, isFetching } = usePartnerRedirectLogs(filters, limit);
  const { data: partners } = useTravelPartners();

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = [
      'ID',
      'Timestamp',
      'Partner',
      'Type',
      'Status',
      'Booking Ref',
      'Checkout Mode',
      'Redirect URL',
    ];

    const rows = logs.map(log => [
      log.id,
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.partner_name,
      log.search_type,
      log.status,
      log.booking_ref || '',
      log.checkout_mode,
      log.redirect_url,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redirect-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/travel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Redirect Logs</h1>
            <p className="text-muted-foreground">
              View all partner handoff events
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={!logs || logs.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.searchType || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    searchType: value === 'all' ? undefined : value as TravelPartnerType 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="flights">Flights</SelectItem>
                  <SelectItem value="hotels">Hotels</SelectItem>
                  <SelectItem value="cars">Cars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    status: value === 'all' ? undefined : value as PartnerBookingStatus 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Partner Filter */}
            <div className="space-y-2">
              <Label>Partner</Label>
              <Select
                value={filters.partnerId || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    partnerId: value === 'all' ? undefined : value 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All partners</SelectItem>
                  {partners?.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate?.split('T')[0] || ''}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined 
                  }))
                }
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate?.split('T')[0] || ''}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined 
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {logs?.length ?? 0} records found
              </CardDescription>
            </div>
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="250">250 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.search_type)}
                          <span className="capitalize">{log.search_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.partner_name}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {log.checkout_mode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.booking_ref ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.booking_ref}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96" align="end">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Log ID</Label>
                                <p className="text-sm font-mono">{log.id}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Redirect URL</Label>
                                <p className="text-sm break-all">{log.redirect_url}</p>
                              </div>
                              {log.offer_id && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Offer ID</Label>
                                  <p className="text-sm font-mono">{log.offer_id}</p>
                                </div>
                              )}
                              {log.session_id && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Session ID</Label>
                                  <p className="text-sm font-mono">{log.session_id}</p>
                                </div>
                              )}
                              {log.returned_at && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Returned At</Label>
                                  <p className="text-sm">
                                    {format(new Date(log.returned_at), 'PPpp')}
                                  </p>
                                </div>
                              )}
                              {log.search_params && Object.keys(log.search_params).length > 0 && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Search Params</Label>
                                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                                    {JSON.stringify(log.search_params, null, 2)}
                                  </pre>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => window.open(log.redirect_url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open URL
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Try adjusting your filters'
                  : 'Partner redirects will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelLogsPage;

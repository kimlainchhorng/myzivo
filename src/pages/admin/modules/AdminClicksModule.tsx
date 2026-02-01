/**
 * Admin Clicks Module
 * Affiliate click tracking and analytics
 */
import { useState, useMemo, useEffect } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  MousePointerClick, Search, Download, RefreshCw, Filter, 
  TrendingUp, Users, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClickLogs, exportLogsToCSV, downloadCSV, type ClickLogEntry } from "@/lib/outboundTracking";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRODUCTS = [
  { value: 'all', label: 'All Products' },
  { value: 'flights', label: 'Flights' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'cars', label: 'Car Rental' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'activities', label: 'Activities' },
  { value: 'esim', label: 'eSIM' },
];

const PARTNERS = [
  { value: 'all', label: 'All Partners' },
  { value: 'aviasales', label: 'Aviasales' },
  { value: 'searadar', label: 'Searadar' },
  { value: 'economybookings', label: 'EconomyBookings' },
  { value: 'klook', label: 'Klook' },
  { value: 'airalo', label: 'Airalo' },
];

export default function AdminClicksModule() {
  const [logs, setLogs] = useState<ClickLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [partnerId, setPartnerId] = useState('all');
  const [product, setProduct] = useState('all');
  const [utmSource, setUtmSource] = useState('');
  const [creator, setCreator] = useState('');
  
  const [page, setPage] = useState(0);
  const pageSize = 50;
  
  const stats = useMemo(() => {
    const sources = new Set(logs.map(l => l.utm_source).filter(Boolean));
    const partnerCounts = logs.reduce((acc, l) => {
      acc[l.partner_id] = (acc[l.partner_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topPartner = Object.entries(partnerCounts).sort((a, b) => b[1] - a[1])[0];
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayClicks = logs.filter(l => (l as any).created_at?.startsWith(today)).length;
    const creatorClicks = logs.filter(l => l.creator).length;
    
    return {
      totalClicks: totalCount,
      uniqueSources: sources.size,
      topPartner: topPartner ? topPartner[0] : 'N/A',
      todayClicks,
      creatorClicks,
    };
  }, [logs, totalCount]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
        partnerId: partnerId !== 'all' ? partnerId : undefined,
        product: product !== 'all' ? product : undefined,
        utmSource: utmSource || undefined,
        creator: creator || undefined,
        limit: pageSize,
        offset: page * pageSize,
      };
      
      const result = await getClickLogs(filters);
      setLogs(result.logs);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, partnerId, product, utmSource, creator, page]);
  
  const handleExport = async () => {
    setExporting(true);
    try {
      const filters = {
        startDate: startOfDay(new Date(startDate)).toISOString(),
        endDate: endOfDay(new Date(endDate)).toISOString(),
        partnerId: partnerId !== 'all' ? partnerId : undefined,
        product: product !== 'all' ? product : undefined,
        utmSource: utmSource || undefined,
        creator: creator || undefined,
        limit: 10000,
      };
      
      const result = await getClickLogs(filters);
      const csv = exportLogsToCSV(result.logs);
      const filename = `zivo-clicks-${startDate}-to-${endDate}.csv`;
      downloadCSV(csv, filename);
      toast.success("CSV exported");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };
  
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MousePointerClick className="w-6 h-6 text-violet-500" />
            Affiliate Clicks
          </h1>
          <p className="text-muted-foreground">Track outbound affiliate clicks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MousePointerClick className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{stats.todayClicks}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-bold">{stats.creatorClicks}</p>
            <p className="text-xs text-muted-foreground">Creator Clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.uniqueSources}</p>
            <p className="text-xs text-muted-foreground">Unique Sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-lg font-semibold capitalize">{stats.topPartner}</p>
            <p className="text-xs text-muted-foreground">Top Partner</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Partner</Label>
              <Select value={partnerId} onValueChange={(v) => { setPartnerId(v); setPage(0); }}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTNERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Product</Label>
              <Select value={product} onValueChange={(v) => { setProduct(v); setPage(0); }}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">UTM Source</Label>
              <Input
                placeholder="e.g., tiktok"
                value={utmSource}
                onChange={(e) => { setUtmSource(e.target.value); setPage(0); }}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Creator</Label>
              <Input
                placeholder="e.g., john"
                value={creator}
                onChange={(e) => { setCreator(e.target.value); setPage(0); }}
                className="mt-1 h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MousePointerClick className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No click logs found</p>
              <p className="text-sm">Clicks from affiliate redirects will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Timestamp</th>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Partner</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">SubID</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">UTM Source</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Campaign</th>
                    <th className="text-left p-3 font-medium hidden xl:table-cell">Creator</th>
                    <th className="text-left p-3 font-medium hidden xl:table-cell">Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">
                        {format(new Date((log as any).created_at || new Date()), "MMM d, HH:mm")}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] capitalize">{log.product}</Badge>
                      </td>
                      <td className="p-3 capitalize text-xs">{log.partner_id}</td>
                      <td className="p-3 hidden md:table-cell font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                        {log.subid}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-xs">{log.utm_source || "-"}</td>
                      <td className="p-3 hidden lg:table-cell text-xs truncate max-w-[100px]">{log.utm_campaign || "-"}</td>
                      <td className="p-3 hidden xl:table-cell">
                        {log.creator ? (
                          <Badge className="text-[10px] bg-violet-500">{log.creator}</Badge>
                        ) : "-"}
                      </td>
                      <td className="p-3 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground truncate block max-w-[150px]">
                          {log.partner_id}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

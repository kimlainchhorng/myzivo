/**
 * ZIVO Admin Click Analytics Dashboard
 * 
 * View and export affiliate click logs with filters
 */

import { useState, useEffect } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  Calendar, 
  Download, 
  Filter, 
  Search, 
  ExternalLink,
  MousePointerClick,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getClickLogs, 
  exportLogsToCSV, 
  downloadCSV,
  type ClickLogEntry 
} from "@/lib/outboundTracking";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PRODUCTS = [
  { value: 'all', label: 'All Products' },
  { value: 'flights', label: 'Flights' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'cars', label: 'Car Rental' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'activities', label: 'Activities' },
  { value: 'esim', label: 'eSIM' },
  { value: 'luggage', label: 'Luggage' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'extras', label: 'Extras' },
];

const PARTNERS = [
  { value: 'all', label: 'All Partners' },
  { value: 'aviasales', label: 'Aviasales' },
  { value: 'searadar', label: 'Searadar' },
  { value: 'economybookings', label: 'EconomyBookings' },
  { value: 'qeeq', label: 'QEEQ' },
  { value: 'getrentacar', label: 'GetRentACar' },
  { value: 'kiwitaxi', label: 'KiwiTaxi' },
  { value: 'gettransfer', label: 'GetTransfer' },
  { value: 'tiqets', label: 'Tiqets' },
  { value: 'klook', label: 'Klook' },
  { value: 'airalo', label: 'Airalo' },
  { value: 'radicalstorage', label: 'Radical Storage' },
  { value: 'airhelp', label: 'AirHelp' },
];

export default function ClicksAnalytics() {
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
  
  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 50;
  
  // Stats
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueSources: 0,
    topPartner: '',
    todayClicks: 0,
  });
  
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
      
      // Calculate stats
      const sources = new Set(result.logs.map(l => l.utm_source).filter(Boolean));
      const partnerCounts = result.logs.reduce((acc, l) => {
        acc[l.partner_id] = (acc[l.partner_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topPartner = Object.entries(partnerCounts).sort((a, b) => b[1] - a[1])[0];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayClicks = result.logs.filter(l => 
        (l as any).created_at?.startsWith(today)
      ).length;
      
      setStats({
        totalClicks: result.count,
        uniqueSources: sources.size,
        topPartner: topPartner ? topPartner[0] : 'N/A',
        todayClicks,
      });
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
      // Fetch all logs for export (no pagination)
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
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <>
      <SEOHead 
        title="Click Analytics - ZIVO Admin"
        description="View and analyze affiliate click data"
        noIndex
      />
      
      <Header />
      
      <main className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Click Analytics</h1>
              <p className="text-muted-foreground">
                Track affiliate clicks and SubID performance
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleExport} disabled={exporting || loading}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-2xl font-bold">{stats.todayClicks}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-500" />
                  <span className="text-2xl font-bold">{stats.uniqueSources}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-amber-500" />
                  <span className="text-lg font-semibold capitalize">{stats.topPartner}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Partner</Label>
                  <Select value={partnerId} onValueChange={(v) => { setPartnerId(v); setPage(0); }}>
                    <SelectTrigger className="mt-1">
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
                    <SelectTrigger className="mt-1">
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
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Creator</Label>
                  <Input
                    placeholder="e.g., john"
                    value={creator}
                    onChange={(e) => { setCreator(e.target.value); setPage(0); }}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>SubID</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          No clicks found for the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date((log as any).created_at), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.product}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium capitalize">
                            {log.partner_name}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[200px] truncate" title={log.subid}>
                            {log.subid}
                          </TableCell>
                          <TableCell>
                            {log.utm_source ? (
                              <Badge variant="secondary">{log.utm_source}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.utm_campaign || '-'}
                          </TableCell>
                          <TableCell>
                            {log.creator ? (
                              <Badge variant="outline" className="bg-violet-500/10 text-violet-600">
                                {log.creator}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">
                            {log.device_type || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
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
                      onClick={() => setPage(p => p + 1)}
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
      </main>
      
      <Footer />
    </>
  );
}

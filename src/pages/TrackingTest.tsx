/**
 * ZIVO Tracking Test Page
 * 
 * Internal tool to verify UTM + creator + subid logging works end-to-end
 * Hidden from navigation, accessible at /tracking-test
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentUTM } from '@/contexts/UTMContext';
import { buildOutboundURL, logOutboundClick } from '@/lib/outboundTracking';
import { TRAVELPAYOUTS_DIRECT_LINKS } from '@/config/affiliateLinks';
import { Plane, Car, Smartphone, Compass, Bus, ExternalLink, CheckCircle2, AlertCircle, Copy, Link2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { toast } from 'sonner';

// Test partners configuration
const TEST_PARTNERS = [
  {
    id: 'aviasales',
    name: 'Aviasales',
    url: TRAVELPAYOUTS_DIRECT_LINKS.flights.backup,
    product: 'flights',
    icon: Plane,
    color: 'bg-sky-500/10 text-sky-600 border-sky-200',
  },
  {
    id: 'economybookings',
    name: 'EconomyBookings',
    url: TRAVELPAYOUTS_DIRECT_LINKS.cars.economybookings,
    product: 'cars',
    icon: Car,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  {
    id: 'airalo',
    name: 'Airalo',
    url: TRAVELPAYOUTS_DIRECT_LINKS.esim.airalo,
    product: 'esim',
    icon: Smartphone,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  {
    id: 'klook',
    name: 'Klook',
    url: 'https://klook.tpo.li/ToVcOax7',
    product: 'activities',
    icon: Compass,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200',
  },
  {
    id: 'kiwitaxi',
    name: 'KiwiTaxi',
    url: TRAVELPAYOUTS_DIRECT_LINKS.transfers.kiwitaxi,
    product: 'transfers',
    icon: Bus,
    color: 'bg-violet-500/10 text-violet-600 border-violet-200',
  },
];

interface ClickLog {
  partnerId: string;
  partnerName: string;
  subid: string;
  success: boolean;
  timestamp: Date;
  logId?: string;
}

export default function TrackingTest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUTM = useCurrentUTM();
  
  // Form state
  const [utmSource, setUtmSource] = useState(searchParams.get('utm_source') || currentUTM.utm_source || '');
  const [utmCampaign, setUtmCampaign] = useState(searchParams.get('utm_campaign') || currentUTM.utm_campaign || '');
  const [creator, setCreator] = useState(searchParams.get('creator') || currentUTM.creator || '');
  
  // Click logs
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Apply UTM params to URL
  const applyParams = () => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (creator) params.set('creator', creator);
    setSearchParams(params);
    toast.success('UTM parameters applied to URL');
  };

  // Clear all params
  const clearParams = () => {
    setUtmSource('');
    setUtmCampaign('');
    setCreator('');
    setSearchParams({});
    toast.info('Parameters cleared');
  };

  // Test partner click with direct logging
  const testPartnerClick = async (partner: typeof TEST_PARTNERS[0]) => {
    setIsLoading(partner.id);
    
    try {
      // Log the click directly and get the subid
      const result = await logOutboundClick({
        partnerId: partner.id,
        partnerName: partner.name,
        product: partner.product,
        pageSource: 'tracking-test',
        destinationUrl: partner.url,
      });
      
      // Add to local logs
      const log: ClickLog = {
        partnerId: partner.id,
        partnerName: partner.name,
        subid: result.subid,
        success: result.success,
        timestamp: new Date(),
        logId: result.logId,
      };
      
      setClickLogs(prev => [log, ...prev]);
      
      // Show toast with subid
      if (result.success) {
        toast.success(`Logged click: ${result.subid}`, {
          description: `Log ID: ${result.logId?.slice(0, 8)}...`,
        });
      } else {
        toast.warning(`Click tracked locally: ${result.subid}`, {
          description: 'Database logging failed',
        });
      }
      
      // Open partner in new tab
      window.open(result.finalUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Failed to log click:', error);
      toast.error('Failed to log click');
    } finally {
      setIsLoading(null);
    }
  };

  // Copy test URL
  const copyTestUrl = () => {
    const baseUrl = window.location.origin;
    const testUrl = `${baseUrl}/lp/flights?utm_source=${encodeURIComponent(utmSource || 'google')}&utm_campaign=${encodeURIComponent(utmCampaign || 'test')}&creator=${encodeURIComponent(creator || 'testuser')}`;
    navigator.clipboard.writeText(testUrl);
    toast.success('Test URL copied to clipboard');
  };

  return (
    <>
      <SEOHead 
        title="Tracking Test - ZIVO"
        description="Internal tool to verify affiliate tracking"
        noIndex
      />
      
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">🧪 Tracking Test</h1>
            <p className="text-muted-foreground">
              Verify UTM + creator + subid logging works end-to-end
            </p>
          </div>

          {/* Current UTM Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Current Session Tracking
              </CardTitle>
              <CardDescription>
                Values persisted from URL parameters (session storage)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentUTM.utm_source && (
                  <Badge variant="secondary">utm_source: {currentUTM.utm_source}</Badge>
                )}
                {currentUTM.utm_campaign && (
                  <Badge variant="secondary">utm_campaign: {currentUTM.utm_campaign}</Badge>
                )}
                {currentUTM.utm_medium && (
                  <Badge variant="secondary">utm_medium: {currentUTM.utm_medium}</Badge>
                )}
                {currentUTM.creator && (
                  <Badge variant="outline" className="border-primary text-primary">
                    creator: {currentUTM.creator}
                  </Badge>
                )}
                {!currentUTM.utm_source && !currentUTM.creator && (
                  <span className="text-sm text-muted-foreground">No tracking parameters active</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Set Parameters Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Set Test Parameters</CardTitle>
              <CardDescription>
                Set UTM parameters to test tracking flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="utm_source">utm_source</Label>
                  <Input
                    id="utm_source"
                    placeholder="google, facebook, tiktok..."
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utm_campaign">utm_campaign</Label>
                  <Input
                    id="utm_campaign"
                    placeholder="summer_promo, test..."
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator">creator</Label>
                  <Input
                    id="creator"
                    placeholder="kimlain, johndoe..."
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={applyParams}>Apply to URL</Button>
                <Button variant="outline" onClick={clearParams}>Clear All</Button>
                <Button variant="secondary" onClick={copyTestUrl}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy LP Test URL
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Test flow:</strong> /lp/flights?utm_source=google&utm_campaign=test&creator=kimlain → /flights → /out → partner
              </div>
            </CardContent>
          </Card>

          {/* Test Partner Buttons */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Test Partner Redirects</CardTitle>
              <CardDescription>
                Click to log click + open partner in new tab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEST_PARTNERS.map((partner) => {
                  const Icon = partner.icon;
                  return (
                    <Button
                      key={partner.id}
                      variant="outline"
                      className={`h-auto py-4 px-4 flex flex-col items-start gap-2 ${partner.color}`}
                      onClick={() => testPartnerClick(partner)}
                      disabled={isLoading === partner.id}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{partner.name}</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </div>
                      <div className="text-xs opacity-70">
                        {partner.product} • {partner.id}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Click Logs */}
          {clickLogs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Click Logs (This Session)
                </CardTitle>
                <CardDescription>
                  Verify in /admin/clicks for full data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clickLogs.map((log, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className={`mt-0.5 ${log.success ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {log.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{log.partnerName}</span>
                          <Badge variant="outline" className="text-xs">{log.partnerId}</Badge>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground break-all">
                          {log.subid}
                        </div>
                        {log.logId && (
                          <div className="text-xs text-muted-foreground">
                            DB ID: {log.logId.slice(0, 12)}...
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Link */}
          <div className="text-center">
            <a 
              href="/admin/clicks" 
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View full click logs in Admin Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

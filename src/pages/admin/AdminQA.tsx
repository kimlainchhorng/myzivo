/**
 * Admin QA Test Hub
 * Internal testing tools for verifying booking flows
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  FlaskConical, 
  Plane, 
  Hotel, 
  Car, 
  Play, 
  ExternalLink,
  RefreshCw,
  Copy,
  CheckCircle,
  Settings,
  Link as LinkIcon,
  ArrowRight,
  Home
} from "lucide-react";
import { getSearchSessionId, HIZOVO_TRACKING_PARAMS } from "@/config/trackingParams";
import { supabase } from "@/integrations/supabase/client";

// Test data presets
const testData = {
  flights: {
    origin: "JFK",
    destination: "LAX",
    departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    passengers: "1",
    cabinClass: "economy",
  },
  hotels: {
    city: "new-york",
    checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adults: "2",
    rooms: "1",
  },
  cars: {
    pickupLocation: "LAX",
    pickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pickupTime: "10:00",
    dropoffDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dropoffTime: "10:00",
  },
};

export default function AdminQA() {
  const [activeTab, setActiveTab] = useState("flows");
  
  // Return simulator state
  const [returnStatus, setReturnStatus] = useState("success");
  const [returnBookingRef, setReturnBookingRef] = useState("TEST-ABC123");
  const [returnOrderId, setReturnOrderId] = useState("order_test_123");
  const [returnSubid, setReturnSubid] = useState(() => getSearchSessionId());
  const [returnPartner, setReturnPartner] = useState("duffel");
  const [returnProduct, setReturnProduct] = useState("flights");
  
  // Tracking preview
  const [previewUrl, setPreviewUrl] = useState("https://partner.com/checkout");

  const currentSessionId = getSearchSessionId();

  const buildTestUrl = (type: 'flights' | 'hotels' | 'cars') => {
    const data = testData[type];
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value);
    });
    params.set('utm_source', 'qa_test');
    params.set('utm_campaign', 'internal_test');
    return `/${type}/results?${params.toString()}`;
  };

  const runFlowTest = (type: 'flights' | 'hotels' | 'cars') => {
    const url = buildTestUrl(type);
    toast.success(`Opening ${type} test flow`, {
      description: "A new tab will open with test parameters",
    });
    window.open(url, '_blank');
  };

  const buildTrackedUrl = () => {
    try {
      const url = new URL(previewUrl);
      url.searchParams.set('utm_source', HIZOVO_TRACKING_PARAMS.utm_source);
      url.searchParams.set('utm_medium', HIZOVO_TRACKING_PARAMS.utm_medium);
      url.searchParams.set('utm_campaign', HIZOVO_TRACKING_PARAMS.utm_campaign);
      url.searchParams.set('subid', currentSessionId);
      return url.toString();
    } catch {
      return previewUrl;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const simulateBookingReturn = async () => {
    const returnUrl = `/booking/return?status=${returnStatus}&booking_ref=${returnBookingRef}&order_id=${returnOrderId}&subid=${returnSubid}&partner=${returnPartner}&product=${returnProduct}`;
    
    // Also log to partner_redirect_logs for testing
    try {
      await supabase.from('partner_redirect_logs').insert({
        session_id: returnSubid,
        partner_name: returnPartner,
        search_type: returnProduct as 'flights' | 'hotels' | 'cars',
        redirect_url: returnUrl,
        checkout_mode: 'redirect',
        search_params: {
          test: true,
          simulated: true,
          timestamp: new Date().toISOString(),
        },
      });
      
      toast.success("Simulated return logged to database", {
        description: "Opening return page...",
      });
    } catch (err) {
      console.error("Failed to log simulated return:", err);
    }
    
    window.open(returnUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="QA Test Hub – Admin" description="Internal QA testing tools" noIndex />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/admin" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-3 h-3" />
              Admin
            </Link>
            <span>/</span>
            <span className="text-foreground">QA Test Hub</span>
          </div>
          
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-primary" />
              QA Test Hub
            </h1>
            <p className="text-muted-foreground">
              Test booking flows and verify tracking before launch
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Settings className="w-3 h-3" />
            Internal Tool
          </Badge>
        </div>

        {/* Session Info */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Session ID</p>
              <p className="font-mono text-xs text-muted-foreground">{currentSessionId}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(currentSessionId)}
              className="gap-2"
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="flows">Test Flows</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="returns">Return Simulator</TabsTrigger>
          </TabsList>

          {/* Test Flows */}
          <TabsContent value="flows" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Flight Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-500" />
                    Flight Flow
                  </CardTitle>
                  <CardDescription>Test search → results → handoff</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Route:</strong> {testData.flights.origin} → {testData.flights.destination}</p>
                    <p><strong>Dates:</strong> {testData.flights.departDate}</p>
                    <p><strong>Passengers:</strong> {testData.flights.passengers}</p>
                    <p><strong>Class:</strong> {testData.flights.cabinClass}</p>
                  </div>
                  <Button 
                    onClick={() => runFlowTest('flights')} 
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Flight Test
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>

              {/* Hotel Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-violet-500" />
                    Hotel Flow
                  </CardTitle>
                  <CardDescription>Test search → results → consent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>City:</strong> New York</p>
                    <p><strong>Check-in:</strong> {testData.hotels.checkIn}</p>
                    <p><strong>Check-out:</strong> {testData.hotels.checkOut}</p>
                    <p><strong>Guests:</strong> {testData.hotels.adults} adults</p>
                  </div>
                  <Button 
                    onClick={() => runFlowTest('hotels')} 
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Play className="w-4 h-4" />
                    Run Hotel Test
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>

              {/* Car Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-500" />
                    Car Flow
                  </CardTitle>
                  <CardDescription>Test search → results → handoff</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Location:</strong> {testData.cars.pickupLocation}</p>
                    <p><strong>Pickup:</strong> {testData.cars.pickupDate}</p>
                    <p><strong>Return:</strong> {testData.cars.dropoffDate}</p>
                    <p><strong>Time:</strong> {testData.cars.pickupTime}</p>
                  </div>
                  <Button 
                    onClick={() => runFlowTest('cars')} 
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Play className="w-4 h-4" />
                    Run Car Test
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Test Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open('/flights', '_blank')}>
                    Flights Search
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/hotels', '_blank')}>
                    Hotels Search
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/rent-car', '_blank')}>
                    Cars Search
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/tracking-test', '_blank')}>
                    Tracking Test Page
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/partner/overview', '_blank')}>
                    Partner Overview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Preview */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Tracking Parameters Preview
                </CardTitle>
                <CardDescription>
                  See how tracking params are appended to partner URLs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Params */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">utm_source</p>
                    <p className="font-mono text-sm font-medium">{HIZOVO_TRACKING_PARAMS.utm_source}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">utm_medium</p>
                    <p className="font-mono text-sm font-medium">{HIZOVO_TRACKING_PARAMS.utm_medium}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">utm_campaign</p>
                    <p className="font-mono text-sm font-medium">{HIZOVO_TRACKING_PARAMS.utm_campaign}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">subid</p>
                    <p className="font-mono text-sm font-medium truncate">{currentSessionId}</p>
                  </div>
                </div>

                {/* URL Builder */}
                <div className="space-y-4">
                  <div>
                    <Label>Partner Base URL</Label>
                    <Input
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      placeholder="https://partner.com/checkout"
                    />
                  </div>
                  <div>
                    <Label>Final Tracked URL</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={buildTrackedUrl()}
                        readOnly
                        className="font-mono text-xs h-20"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(buildTrackedUrl())}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Return Simulator */}
          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  Booking Return Simulator
                </CardTitle>
                <CardDescription>
                  Simulate partner callback to /booking/return
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={returnStatus} onValueChange={setReturnStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="redirected">Redirected</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Product</Label>
                    <Select value={returnProduct} onValueChange={setReturnProduct}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flights">Flights</SelectItem>
                        <SelectItem value="hotels">Hotels</SelectItem>
                        <SelectItem value="cars">Cars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Booking Reference</Label>
                    <Input
                      value={returnBookingRef}
                      onChange={(e) => setReturnBookingRef(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Order ID</Label>
                    <Input
                      value={returnOrderId}
                      onChange={(e) => setReturnOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>SubID (Session)</Label>
                    <Input
                      value={returnSubid}
                      onChange={(e) => setReturnSubid(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Partner</Label>
                    <Input
                      value={returnPartner}
                      onChange={(e) => setReturnPartner(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview URL:</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    /booking/return?status={returnStatus}&booking_ref={returnBookingRef}&order_id={returnOrderId}&subid={returnSubid}&partner={returnPartner}&product={returnProduct}
                  </p>
                </div>

                <Button onClick={simulateBookingReturn} className="w-full gap-2">
                  <Play className="w-4 h-4" />
                  Simulate Return
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
    <Footer />
  </div>
  );
}

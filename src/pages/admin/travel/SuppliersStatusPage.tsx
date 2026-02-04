/**
 * Suppliers Status Page
 * Monitor API health and status for travel suppliers
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Clock,
  Loader2,
  Plane,
  Hotel,
  Car,
  Key,
} from "lucide-react";

interface SupplierStatus {
  id: string;
  name: string;
  type: "flights" | "hotels" | "cars";
  status: "operational" | "degraded" | "down" | "not_configured";
  lastCheck: string;
  lastSuccess: string | null;
  errorCount24h: number;
  responseTimeMs: number | null;
  apiKeyConfigured: boolean;
  docsUrl: string;
}

const supplierIcons: Record<string, React.ElementType> = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
};

const statusConfig = {
  operational: { label: "Operational", color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle },
  degraded: { label: "Degraded", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: AlertTriangle },
  down: { label: "Down", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  not_configured: { label: "Not Configured", color: "bg-muted text-muted-foreground border-border", icon: Key },
};

// Mock supplier data - in production would come from health check endpoint
const mockSuppliers: SupplierStatus[] = [
  {
    id: "duffel",
    name: "Duffel",
    type: "flights",
    status: "operational",
    lastCheck: new Date().toISOString(),
    lastSuccess: new Date().toISOString(),
    errorCount24h: 2,
    responseTimeMs: 245,
    apiKeyConfigured: true,
    docsUrl: "https://duffel.com/docs",
  },
  {
    id: "travelpayouts",
    name: "TravelPayouts / Aviasales",
    type: "flights",
    status: "operational",
    lastCheck: new Date().toISOString(),
    lastSuccess: new Date().toISOString(),
    errorCount24h: 0,
    responseTimeMs: 180,
    apiKeyConfigured: true,
    docsUrl: "https://www.travelpayouts.com/developers",
  },
  {
    id: "hotelbeds",
    name: "Hotelbeds",
    type: "hotels",
    status: "not_configured",
    lastCheck: new Date().toISOString(),
    lastSuccess: null,
    errorCount24h: 0,
    responseTimeMs: null,
    apiKeyConfigured: false,
    docsUrl: "https://developer.hotelbeds.com/",
  },
  {
    id: "ratehawk",
    name: "RateHawk",
    type: "hotels",
    status: "not_configured",
    lastCheck: new Date().toISOString(),
    lastSuccess: null,
    errorCount24h: 0,
    responseTimeMs: null,
    apiKeyConfigured: false,
    docsUrl: "https://www.ratehawk.com/",
  },
  {
    id: "discovercars",
    name: "DiscoverCars",
    type: "cars",
    status: "not_configured",
    lastCheck: new Date().toISOString(),
    lastSuccess: null,
    errorCount24h: 0,
    responseTimeMs: null,
    apiKeyConfigured: false,
    docsUrl: "https://www.discovercars.com/",
  },
];

const SuppliersStatusPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: suppliers = mockSuppliers, refetch } = useQuery({
    queryKey: ["supplier-status"],
    queryFn: async () => {
      // In production, this would call a health check endpoint
      return mockSuppliers;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const operationalCount = suppliers.filter((s) => s.status === "operational").length;
  const issueCount = suppliers.filter((s) => s.status === "degraded" || s.status === "down").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Status</h1>
          <p className="text-muted-foreground">Monitor travel API health and connectivity</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">{operationalCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-amber-600">{issueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Configured</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {suppliers.filter((s) => s.status === "not_configured").length}
                </p>
              </div>
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Alert */}
      {issueCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Supplier Issues Detected</AlertTitle>
          <AlertDescription>
            {issueCount} supplier(s) are experiencing issues. Check details below.
          </AlertDescription>
        </Alert>
      )}

      {/* Suppliers by Category */}
      {["flights", "hotels", "cars"].map((type) => {
        const typeSuppliers = suppliers.filter((s) => s.type === type);
        if (typeSuppliers.length === 0) return null;

        const TypeIcon = supplierIcons[type];

        return (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TypeIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="capitalize">{type}</CardTitle>
              </div>
              <CardDescription>
                {typeSuppliers.filter((s) => s.status === "operational").length} of{" "}
                {typeSuppliers.length} operational
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeSuppliers.map((supplier, index) => {
                const config = statusConfig[supplier.status];
                const StatusIcon = config.icon;

                return (
                  <div key={supplier.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{supplier.name}</h4>
                          <Badge variant="outline" className={config.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {supplier.apiKeyConfigured ? (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {supplier.responseTimeMs}ms avg
                              </span>
                              <span>
                                {supplier.errorCount24h} errors (24h)
                              </span>
                              {supplier.lastSuccess && (
                                <span>
                                  Last success: {new Date(supplier.lastSuccess).toLocaleTimeString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span>API key not configured</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={supplier.docsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Environment Variables Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Required environment variables for supplier integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-muted">
              <span>DUFFEL_API_KEY</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted">
              <span>VITE_TRAVELPAYOUTS_MARKER</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted">
              <span>HOTELBEDS_API_KEY</span>
              <Badge variant="outline">Not Set</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted">
              <span>RATEHAWK_API_KEY</span>
              <Badge variant="outline">Not Set</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted">
              <span>STRIPE_SECRET_KEY</span>
              <Badge variant="outline">Not Set</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersStatusPage;

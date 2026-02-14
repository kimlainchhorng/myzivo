/**
 * Phone Compliance Dashboard
 * Admin page to manage customer & driver phone verification status
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  Search,
  Copy,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  Car,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface CustomerPhone {
  customer_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  phone_e164: string | null;
  phone_verified: boolean | null;
  phone_verified_at: string | null;
  phone_status: string;
}

interface DriverPhone {
  driver_id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  driver_status: string | null;
  driver_verified: boolean | null;
  phone_e164: string | null;
  phone_verified: boolean | null;
  phone_verified_at: string | null;
  phone_status: string;
}

type PhoneFilter = "all" | "verified" | "unverified" | "missing";

// Helpers
const shortId = (id: string) => id.slice(0, 8);

const statusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1">
          <ShieldCheck className="h-3 w-3" /> Verified
        </Badge>
      );
    case "unverified":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1">
          <ShieldAlert className="h-3 w-3" /> Unverified
        </Badge>
      );
    case "missing":
      return (
        <Badge variant="destructive" className="gap-1">
          <ShieldX className="h-3 w-3" /> Missing
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function PhoneComplianceContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState<PhoneFilter>("all");
  const [driverFilter, setDriverFilter] = useState<PhoneFilter>("all");

  // Fetch customers
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["phone-compliance-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_customer_phone_status" as any)
        .select("*")
        .order("customer_id");
      if (error) throw error;
      return (data || []) as unknown as CustomerPhone[];
    },
  });

  // Fetch drivers
  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ["phone-compliance-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_driver_phone_status" as any)
        .select("*")
        .order("driver_id");
      if (error) throw error;
      return (data || []) as unknown as DriverPhone[];
    },
  });

  // Clear phone mutation
  const clearPhoneMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase.rpc("admin_clear_customer_phone" as any, {
        _customer_id: customerId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Phone cleared successfully");
      queryClient.invalidateQueries({ queryKey: ["phone-compliance-customers"] });
    },
    onError: (err: any) => {
      toast.error(`Failed to clear phone: ${err.message}`);
    },
  });

  // Filter logic
  const filterByStatus = <T extends { phone_status: string }>(
    items: T[],
    filter: PhoneFilter
  ): T[] => {
    if (filter === "all") return items;
    return items.filter((i) => i.phone_status === filter);
  };

  const filterBySearch = <T extends { phone_e164?: string | null; phone?: string | null }>(
    items: T[]
  ): T[] => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (i.phone_e164 && i.phone_e164.toLowerCase().includes(q)) ||
        (i.phone && i.phone.toLowerCase().includes(q))
    );
  };

  const filteredCustomers = useMemo(
    () => filterBySearch(filterByStatus(customers, customerFilter)),
    [customers, customerFilter, search]
  );

  const filteredDrivers = useMemo(
    () => filterBySearch(filterByStatus(drivers, driverFilter)),
    [drivers, driverFilter, search]
  );

  // Stats
  const customerTotal = customers.length;
  const customerVerified = customers.filter((c) => c.phone_status === "verified").length;
  const driverTotal = drivers.length;
  const driverVerified = drivers.filter((d) => d.phone_status === "verified").length;
  const customerPct = customerTotal > 0 ? Math.round((customerVerified / customerTotal) * 100) : 0;
  const driverPct = driverTotal > 0 ? Math.round((driverVerified / driverTotal) * 100) : 0;

  // Cross-role phone matches
  const searchMatchesBothRoles = useMemo(() => {
    if (!search.trim()) return false;
    return filteredCustomers.length > 0 && filteredDrivers.length > 0;
  }, [search, filteredCustomers, filteredDrivers]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied");
  };

  const isLoading = loadingCustomers || loadingDrivers;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Phone Compliance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor and manage phone verification across customers and drivers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers Verified</p>
                <p className="text-2xl font-bold">{customerPct}%</p>
                <p className="text-xs text-muted-foreground">
                  {customerVerified} / {customerTotal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers Verified</p>
                <p className="text-2xl font-bold">{driverPct}%</p>
                <p className="text-xs text-muted-foreground">
                  {driverVerified} / {driverTotal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blocked Customers</p>
                <p className="text-2xl font-bold">
                  {customers.filter((c) => c.phone_status !== "verified").length}
                </p>
                <p className="text-xs text-muted-foreground">Cannot request rides</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fully Compliant</p>
                <p className="text-2xl font-bold">
                  {customerPct === 100 && driverPct === 100 ? "Yes" : "No"}
                </p>
                <p className="text-xs text-muted-foreground">All users verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchMatchesBothRoles && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-600">
            This phone number appears in both customer and driver records
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="customers">
          <TabsList>
            <TabsTrigger value="customers" className="gap-1.5">
              <Users className="h-4 w-4" /> Customers ({filteredCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-1.5">
              <Car className="h-4 w-4" /> Drivers ({filteredDrivers.length})
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select
                value={customerFilter}
                onValueChange={(v) => setCustomerFilter(v as PhoneFilter)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="missing">Missing Phone</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomerFilter("unverified")}
              >
                Blocked from requesting
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone (E.164)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No customers match the current filter
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => (
                      <TableRow key={c.customer_id}>
                        <TableCell className="font-mono text-xs">
                          {shortId(c.customer_id)}
                        </TableCell>
                        <TableCell className="text-sm">{c.email || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {c.phone_e164 || c.phone || "—"}
                        </TableCell>
                        <TableCell>{statusBadge(c.phone_status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyId(c.customer_id)}
                              title="Copy ID"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  disabled={!c.phone_e164 && !c.phone}
                                  title="Clear phone"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Clear phone for {shortId(c.customer_id)}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove their phone number and reset verification status.
                                    The customer will need to re-verify to use services.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => clearPhoneMutation.mutate(c.customer_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Clear Phone
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select
                value={driverFilter}
                onValueChange={(v) => setDriverFilter(v as PhoneFilter)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Not Verified</SelectItem>
                  <SelectItem value="missing">Missing Phone</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDriverFilter("missing")}
              >
                Missing phone
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDriverFilter("unverified")}
              >
                Not verified
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone (E.164)</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Driver Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No drivers match the current filter
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((d) => (
                      <TableRow key={d.driver_id}>
                        <TableCell className="font-mono text-xs">
                          {shortId(d.driver_id)}
                        </TableCell>
                        <TableCell className="text-sm">{d.full_name || d.email || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {d.phone_e164 || d.phone || "—"}
                        </TableCell>
                        <TableCell>{statusBadge(d.phone_status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {d.driver_status || "unknown"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function PhoneCompliancePage() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
      <PhoneComplianceContent />
    </AdminProtectedRoute>
  );
}

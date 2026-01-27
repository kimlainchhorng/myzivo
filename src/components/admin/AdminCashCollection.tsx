import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Banknote, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Building,
  Phone
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CashCollection {
  id: string;
  driver_id: string;
  amount: number;
  collection_method: string;
  reference_number: string | null;
  notes: string | null;
  status: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  driver?: {
    full_name: string;
    phone: string;
    avatar_url: string | null;
  };
}

interface DriverCashBalance {
  driver_id: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  cash_balance: number;
  pending_deposit: number;
}

const AdminCashCollection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<CashCollection | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  // Fetch cash collections
  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["cash-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_cash_collections")
        .select(`
          *,
          driver:drivers(full_name, phone, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashCollection[];
    },
  });

  // Fetch driver cash balances (from completed cash trips)
  const { data: cashBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["driver-cash-balances"],
    queryFn: async () => {
      // Get drivers with their cash trip totals
      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("id, full_name, phone, avatar_url")
        .eq("status", "verified");

      if (driversError) throw driversError;

      // Get cash trips (simulated for now as payment_method may vary)
      const { data: cashTrips, error: tripsError } = await supabase
        .from("trips")
        .select("driver_id, fare_amount")
        .eq("status", "completed");

      if (tripsError) throw tripsError;

      // Get pending deposits
      const { data: pendingDeposits, error: depositsError } = await supabase
        .from("driver_cash_collections")
        .select("driver_id, amount")
        .eq("status", "pending");

      if (depositsError) throw depositsError;

      // Calculate balances per driver
      const balances: DriverCashBalance[] = (drivers || []).map(driver => {
        const driverCashTrips = cashTrips?.filter(t => t.driver_id === driver.id) || [];
        const driverPendingDeposits = pendingDeposits?.filter(d => d.driver_id === driver.id) || [];
        
        return {
          driver_id: driver.id,
          full_name: driver.full_name,
          phone: driver.phone,
          avatar_url: driver.avatar_url,
          cash_balance: driverCashTrips.reduce((acc, t) => acc + (t.fare_amount || 0), 0),
          pending_deposit: driverPendingDeposits.reduce((acc, d) => acc + d.amount, 0)
        };
      }).filter(b => b.cash_balance > 0 || b.pending_deposit > 0);

      return balances;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("driver_cash_collections")
        .update({ 
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-collections"] });
      queryClient.invalidateQueries({ queryKey: ["driver-cash-balances"] });
      toast.success("Cash collection confirmed");
      setIsDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to confirm collection");
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("driver_cash_collections")
        .update({ status: "disputed" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-collections"] });
      toast.warning("Collection marked as disputed");
      setIsDetailOpen(false);
    },
  });

  const pendingCollections = collections?.filter(c => c.status === "pending") || [];
  const confirmedCollections = collections?.filter(c => c.status === "confirmed") || [];
  const disputedCollections = collections?.filter(c => c.status === "disputed") || [];

  const totalPendingAmount = pendingCollections.reduce((acc, c) => acc + c.amount, 0);
  const totalCollectedToday = confirmedCollections
    .filter(c => c.confirmed_at && new Date(c.confirmed_at).toDateString() === new Date().toDateString())
    .reduce((acc, c) => acc + c.amount, 0);

  const filteredCollections = (activeTab === "pending" ? pendingCollections : 
    activeTab === "confirmed" ? confirmedCollections : disputedCollections)
    .filter(c => 
      c.driver?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reference_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "disputed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Collection</p>
                <p className="text-xl font-bold text-amber-500">${totalPendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collected Today</p>
                <p className="text-xl font-bold text-green-500">${totalCollectedToday.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drivers with Cash</p>
                <p className="text-xl font-bold text-blue-500">{cashBalances?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500/10 to-rose-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disputed</p>
                <p className="text-xl font-bold text-red-500">{disputedCollections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections Table */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                  <Banknote className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Cash Collections</CardTitle>
                  <CardDescription>Track and confirm driver cash deposits</CardDescription>
                </div>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-muted/30">
                <TabsTrigger value="pending" className="gap-1.5">
                  <Clock className="h-3 w-3" />
                  Pending ({pendingCollections.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="gap-1.5">
                  <CheckCircle className="h-3 w-3" />
                  Confirmed
                </TabsTrigger>
                <TabsTrigger value="disputed" className="gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  Disputed
                </TabsTrigger>
              </TabsList>

              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Driver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionsLoading ? (
                      [...Array(4)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredCollections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Banknote className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground">No collections found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCollections.map((collection) => (
                        <TableRow key={collection.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={collection.driver?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {collection.driver?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{collection.driver?.full_name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-500">
                            ${collection.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">
                            {collection.collection_method.replace("_", " ")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(collection.created_at), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedCollection(collection);
                                setIsDetailOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Driver Cash Balances */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Driver Cash Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-auto">
              {balancesLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : !cashBalances?.length ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500/50 mb-2" />
                  <p className="text-sm text-muted-foreground">All cash collected</p>
                </div>
              ) : (
                cashBalances.map((balance) => (
                  <div key={balance.driver_id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={balance.avatar_url || undefined} />
                        <AvatarFallback>
                          {balance.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{balance.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {balance.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">${balance.cash_balance.toFixed(2)}</p>
                        {balance.pending_deposit > 0 && (
                          <p className="text-xs text-amber-500">
                            ${balance.pending_deposit.toFixed(2)} pending
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Cash Collection Details
            </DialogTitle>
            <DialogDescription>
              Review and confirm this cash deposit
            </DialogDescription>
          </DialogHeader>

          {selectedCollection && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedCollection.driver?.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedCollection.driver?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedCollection.driver?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCollection.driver?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-green-500">${selectedCollection.amount.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="font-medium capitalize">{selectedCollection.collection_method.replace("_", " ")}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-medium">{selectedCollection.reference_number || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedCollection.created_at), "PPp")}</p>
                </div>
              </div>

              {selectedCollection.notes && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedCollection.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {getStatusBadge(selectedCollection.status)}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedCollection?.status === "pending" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => disputeMutation.mutate(selectedCollection.id)}
                  disabled={disputeMutation.isPending}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Dispute
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => confirmMutation.mutate(selectedCollection.id)}
                  disabled={confirmMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm Collection
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCashCollection;

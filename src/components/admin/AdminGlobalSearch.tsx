import { useState, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  User, 
  Car, 
  MapPin, 
  Utensils, 
  CreditCard,
  ArrowRight,
  Clock,
  Filter,
  Star,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "user" | "driver" | "trip" | "order" | "transaction";
  title: string;
  subtitle: string;
  metadata: string;
  status?: string;
  timestamp: Date;
}

const mockResults: SearchResult[] = [
  { id: "1", type: "user", title: "Sarah Johnson", subtitle: "sarah.j@email.com", metadata: "Customer since 2023", timestamp: new Date() },
  { id: "2", type: "driver", title: "Michael Chen", subtitle: "Driver ID: DRV-4521", metadata: "4.9★ • 2,340 trips", timestamp: new Date() },
  { id: "3", type: "trip", title: "Trip #TRP-20260128-0892", subtitle: "Downtown → Airport", metadata: "$34.50", status: "completed", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "4", type: "order", title: "Order #ORD-20260128-1234", subtitle: "Bella Italia → 123 Main St", metadata: "$42.80", status: "delivered", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: "5", type: "transaction", title: "Payment #PAY-892741", subtitle: "Visa ending 4242", metadata: "$78.50", status: "success", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: "6", type: "user", title: "James Wilson", subtitle: "james.w@email.com", metadata: "Customer since 2024", timestamp: new Date() },
  { id: "7", type: "driver", title: "Emma Davis", subtitle: "Driver ID: DRV-2156", metadata: "4.8★ • 1,890 trips", timestamp: new Date() },
];

const recentSearches = [
  "John Smith",
  "TRP-20260125",
  "ORD-20260127",
  "driver 4521",
  "refund request",
];

const typeConfig = {
  user: { icon: User, color: "text-blue-500", bg: "bg-blue-500/10", label: "Customer" },
  driver: { icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Driver" },
  trip: { icon: MapPin, color: "text-primary", bg: "bg-primary/10", label: "Trip" },
  order: { icon: Utensils, color: "text-eats", bg: "bg-eats/10", label: "Order" },
  transaction: { icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10", label: "Transaction" },
};

const AdminGlobalSearch = forwardRef<HTMLDivElement>((props, ref) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  const filteredResults = query.length > 0
    ? mockResults.filter(r => 
        (activeTab === "all" || r.type === activeTab) &&
        (r.title.toLowerCase().includes(query.toLowerCase()) || 
         r.subtitle.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  return (
    <div ref={ref} className="space-y-6" {...props}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            Global Search
          </h1>
          <p className="text-muted-foreground mt-1">Search across all users, trips, orders, and transactions</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, ID, phone number..."
              value={query}
              onChange={handleSearch}
              className="pl-12 h-14 text-lg rounded-xl bg-muted/30 border-border/50"
            />
            <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-muted/30">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="user">Customers</TabsTrigger>
              <TabsTrigger value="driver">Drivers</TabsTrigger>
              <TabsTrigger value="trip">Trips</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="transaction">Transactions</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-card/50 backdrop-blur-xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {query ? `Results for "${query}"` : "Start searching..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <AnimatePresence mode="wait">
                  {filteredResults.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {filteredResults.map((result, index) => {
                        const config = typeConfig[result.type];
                        const Icon = config.icon;

                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bg)}>
                                <Icon className={cn("h-6 w-6", config.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{result.title}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {config.label}
                                  </Badge>
                                  {result.status && (
                                    <Badge className={cn(
                                      "text-[10px]",
                                      result.status === "completed" && "bg-green-500/10 text-green-500",
                                      result.status === "delivered" && "bg-blue-500/10 text-blue-500",
                                      result.status === "success" && "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                      {result.status}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                                <p className="text-xs text-muted-foreground mt-1">{result.metadata}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : query ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No results found for "{query}"</p>
                      <p className="text-sm mt-1">Try different keywords or filters</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Type to search across all data</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Recent Searches & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={search}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setQuery(search)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Find user by phone", icon: User },
                  { label: "Lookup trip by ID", icon: MapPin },
                  { label: "Track order status", icon: Package },
                  { label: "Verify transaction", icon: CreditCard },
                ].map((action, index) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10"
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

AdminGlobalSearch.displayName = "AdminGlobalSearch";

export default AdminGlobalSearch;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Flag, 
  Plus, 
  Search, 
  Users, 
  Percent,
  Zap,
  Shield,
  Eye,
  Code,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetAudience: "all" | "beta" | "staff" | "premium";
  category: "ui" | "backend" | "experimental" | "deprecated";
  createdAt: Date;
  lastModified: Date;
}

const mockFlags: FeatureFlag[] = [
  {
    id: "1",
    key: "new_checkout_flow",
    name: "New Checkout Flow",
    description: "Streamlined checkout experience with fewer steps",
    isEnabled: true,
    rolloutPercentage: 50,
    targetAudience: "beta",
    category: "ui",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    key: "ai_trip_suggestions",
    name: "AI Trip Suggestions",
    description: "Machine learning powered destination recommendations",
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: "all",
    category: "backend",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    key: "dark_mode_v2",
    name: "Dark Mode V2",
    description: "Enhanced dark theme with OLED optimization",
    isEnabled: false,
    rolloutPercentage: 0,
    targetAudience: "staff",
    category: "experimental",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    key: "legacy_payment_gateway",
    name: "Legacy Payment Gateway",
    description: "Old payment processing system - scheduled for removal",
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: "all",
    category: "deprecated",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    key: "live_tracking_v3",
    name: "Live Tracking V3",
    description: "Real-time GPS with predictive ETA updates",
    isEnabled: true,
    rolloutPercentage: 25,
    targetAudience: "premium",
    category: "backend",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastModified: new Date(),
  },
];

const FeatureFlagsPanel = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFlag, setNewFlag] = useState<{
    key: string;
    name: string;
    description: string;
    category: "ui" | "backend" | "experimental" | "deprecated";
    targetAudience: "all" | "beta" | "staff" | "premium";
    rolloutPercentage: number;
  }>({
    key: "",
    name: "",
    description: "",
    category: "ui",
    targetAudience: "all",
    rolloutPercentage: 0,
  });

  const handleToggle = (id: string) => {
    setFlags(flags.map(f => 
      f.id === id ? { ...f, isEnabled: !f.isEnabled, lastModified: new Date() } : f
    ));
    toast.success("Feature flag updated");
  };

  const handleRolloutChange = (id: string, percentage: number) => {
    setFlags(flags.map(f => 
      f.id === id ? { ...f, rolloutPercentage: percentage, lastModified: new Date() } : f
    ));
  };

  const handleCreate = () => {
    const flag: FeatureFlag = {
      id: Date.now().toString(),
      key: newFlag.key,
      name: newFlag.name,
      description: newFlag.description,
      isEnabled: false,
      rolloutPercentage: newFlag.rolloutPercentage,
      targetAudience: newFlag.targetAudience,
      category: newFlag.category,
      createdAt: new Date(),
      lastModified: new Date(),
    };
    setFlags([flag, ...flags]);
    setIsCreateOpen(false);
    setNewFlag({ key: "", name: "", description: "", category: "ui", targetAudience: "all", rolloutPercentage: 0 });
    toast.success("Feature flag created");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ui": return Eye;
      case "backend": return Code;
      case "experimental": return Zap;
      case "deprecated": return AlertTriangle;
      default: return Flag;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ui": return "bg-blue-500/10 text-blue-500";
      case "backend": return "bg-purple-500/10 text-purple-500";
      case "experimental": return "bg-amber-500/10 text-amber-500";
      case "deprecated": return "bg-red-500/10 text-red-500";
      default: return "bg-slate-500/10 text-slate-500";
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "all": return Users;
      case "beta": return Zap;
      case "staff": return Shield;
      case "premium": return CheckCircle;
      default: return Users;
    }
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || flag.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = flags.filter(f => f.isEnabled).length;
  const experimentalCount = flags.filter(f => f.category === "experimental").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10">
            <Flag className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Feature Flags</h2>
            <p className="text-sm text-muted-foreground">Control feature rollouts and experiments</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Flag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{flags.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enabled</p>
            <p className="text-xl font-bold">{enabledCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Experimental</p>
            <p className="text-xl font-bold">{experimentalCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deprecated</p>
            <p className="text-xl font-bold">{flags.filter(f => f.category === "deprecated").length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search flags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ui">UI</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="experimental">Experimental</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.map((flag) => {
          const CategoryIcon = getCategoryIcon(flag.category);
          const AudienceIcon = getAudienceIcon(flag.targetAudience);
          
          return (
            <Card key={flag.id} className={cn(
              "border-0 bg-card/50 backdrop-blur-xl transition-all",
              !flag.isEnabled && "opacity-60"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="px-2 py-0.5 rounded bg-muted text-sm font-mono">{flag.key}</code>
                      <Badge className={cn("text-xs capitalize", getCategoryColor(flag.category))}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {flag.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize gap-1">
                        <AudienceIcon className="h-3 w-3" />
                        {flag.targetAudience}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-2">{flag.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    
                    {flag.isEnabled && (
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Rollout:</span>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            value={flag.rolloutPercentage}
                            onChange={(e) => handleRolloutChange(flag.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Switch 
                    checked={flag.isEnabled}
                    onCheckedChange={() => handleToggle(flag.id)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredFlags.length === 0 && (
          <div className="text-center py-12">
            <Flag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No feature flags found</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Create Feature Flag
            </DialogTitle>
            <DialogDescription>Add a new feature flag for controlled rollouts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flag Key</Label>
                <Input 
                  placeholder="my_new_feature"
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input 
                  placeholder="My New Feature"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe what this feature does..."
                value={newFlag.description}
                onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newFlag.category} 
                  onValueChange={(v: "ui" | "backend" | "experimental" | "deprecated") => setNewFlag({ ...newFlag, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={newFlag.targetAudience} 
                  onValueChange={(v: "all" | "beta" | "staff" | "premium") => setNewFlag({ ...newFlag, targetAudience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="beta">Beta Users</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Initial Rollout: {newFlag.rolloutPercentage}%</Label>
              <Input 
                type="range"
                min="0"
                max="100"
                value={newFlag.rolloutPercentage}
                onChange={(e) => setNewFlag({ ...newFlag, rolloutPercentage: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newFlag.key || !newFlag.name}
            >
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureFlagsPanel;

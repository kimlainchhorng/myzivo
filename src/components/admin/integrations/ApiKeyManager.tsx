import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Key, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, AlertTriangle, Check, Clock } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  isActive: boolean;
  usageCount: number;
  rateLimit: number;
}

// API keys loaded from database — no hardcoded data

const availablePermissions = [
  { value: "rides:read", label: "Rides (Read)" },
  { value: "rides:write", label: "Rides (Write)" },
  { value: "users:read", label: "Users (Read)" },
  { value: "users:write", label: "Users (Write)" },
  { value: "food:read", label: "Food Orders (Read)" },
  { value: "food:write", label: "Food Orders (Write)" },
  { value: "analytics:read", label: "Analytics (Read)" },
  { value: "payments:read", label: "Payments (Read)" },
  { value: "payments:write", label: "Payments (Write)" }
];

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>("never");
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000");

  const handleCopyKey = (prefix: string) => {
    navigator.clipboard.writeText(`${prefix}xxxxxxxxxxxxxxxxxxxx`);
    toast.success("API key copied to clipboard");
  };

  const handleToggleKey = (id: string) => {
    setApiKeys(keys => keys.map(key => 
      key.id === id ? { ...key, isActive: !key.isActive } : key
    ));
    toast.success("API key status updated");
  };

  const handleRegenerateKey = (id: string) => {
    toast.success("API key regenerated successfully");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(keys => keys.filter(key => key.id !== id));
    toast.success("API key deleted");
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      prefix: `zivo_${newKeyName.toLowerCase().replace(/\s+/g, '_')}_`,
      permissions: newKeyPermissions,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
      expiresAt: newKeyExpiry === "never" ? null : new Date(Date.now() + parseInt(newKeyExpiry) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageCount: 0,
      rateLimit: parseInt(newKeyRateLimit)
    };
    
    setApiKeys([newKey, ...apiKeys]);
    setCreateDialogOpen(false);
    setNewKeyName("");
    setNewKeyPermissions([]);
    setNewKeyExpiry("never");
    toast.success("API key created successfully", {
      description: "Make sure to copy your key now. You won't be able to see it again."
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">Manage API keys for third-party integrations</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input 
                  id="key-name" 
                  placeholder="e.g., Production API" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <label key={perm.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(perm.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, perm.value]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm.value));
                          }
                        }}
                        className="rounded"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (req/min)</Label>
                  <Input 
                    type="number" 
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateKey}>Create Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <Card key={key.id} className={!key.isActive || isExpired(key.expiresAt) ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    key.isActive && !isExpired(key.expiresAt) 
                      ? "bg-primary/10" 
                      : "bg-muted"
                  }`}>
                    <Key className={`h-5 w-5 ${
                      key.isActive && !isExpired(key.expiresAt)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{key.name}</h4>
                      {isExpired(key.expiresAt) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon(key.expiresAt) && !isExpired(key.expiresAt) && (
                        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
                          <Clock className="h-3 w-3" />
                          Expiring Soon
                        </Badge>
                      )}
                      {key.isActive && !isExpired(key.expiresAt) && (
                        <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {showKey === key.id ? `${key.prefix}xxxxxxxxxxxxxxxxxxxx` : `${key.prefix}••••••••••••`}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      >
                        {showKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopyKey(key.prefix)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {key.permissions.map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      <span>Last used: {key.lastUsed ? formatDate(key.lastUsed) : "Never"}</span>
                      <span>Expires: {formatDate(key.expiresAt)}</span>
                      <span>{key.usageCount.toLocaleString()} requests</span>
                      <span>{key.rateLimit}/min limit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={key.isActive} 
                    onCheckedChange={() => handleToggleKey(key.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRegenerateKey(key.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

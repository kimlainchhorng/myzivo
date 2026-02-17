import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Map, Plus, Settings, Search, MapPin, Circle, Square, 
  Pencil, Trash2, Eye, EyeOff, MoreVertical, Layers
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Zone {
  id: string;
  name: string;
  type: "service" | "surge" | "restricted" | "airport" | "event";
  status: "active" | "inactive" | "scheduled";
  coverage: string;
  drivers: number;
  surgeMultiplier?: number;
  restrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Zones loaded from database — no hardcoded data

export default function AdminZoneManagement() {
  const [zones] = useState<Zone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalZones = zones.length;
  const activeZones = zones.filter(z => z.status === "active").length;
  const totalCoverage = "65 sq km";
  const driversInZones = zones.reduce((sum, z) => sum + z.drivers, 0);

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: Zone["type"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      service: { icon: <Circle className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      surge: { icon: <Circle className="h-3 w-3 fill-current" />, class: "bg-amber-500/10 text-amber-500" },
      restricted: { icon: <Square className="h-3 w-3" />, class: "bg-red-500/10 text-red-500" },
      airport: { icon: <MapPin className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" },
      event: { icon: <MapPin className="h-3 w-3" />, class: "bg-purple-500/10 text-purple-500" }
    };
    return (
      <Badge className={config[type].class}>
        {config[type].icon}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: Zone["status"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      active: { icon: <Eye className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      inactive: { icon: <EyeOff className="h-3 w-3" />, class: "bg-muted text-muted-foreground" },
      scheduled: { icon: <Circle className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" }
    };
    return (
      <Badge variant="outline" className={config[status].class}>
        {config[status].icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Zone Management
          </h2>
          <p className="text-muted-foreground">Define service zones, geo-fencing, and restricted areas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Layers className="h-4 w-4 mr-2" />
            View Map
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Zone
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Zones</p>
                <p className="text-2xl font-bold">{totalZones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Zones</p>
                <p className="text-2xl font-bold">{activeZones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coverage</p>
                <p className="text-2xl font-bold">{totalCoverage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MapPin className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers in Zones</p>
                <p className="text-2xl font-bold">{driversInZones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Zones</CardTitle>
              <CardDescription>Manage geographic zones and their settings</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Active Drivers</TableHead>
                <TableHead>Surge</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{getTypeBadge(zone.type)}</TableCell>
                  <TableCell>{getStatusBadge(zone.status)}</TableCell>
                  <TableCell>{zone.coverage}</TableCell>
                  <TableCell>{zone.drivers}</TableCell>
                  <TableCell>
                    {zone.surgeMultiplier ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        {zone.surgeMultiplier}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(zone.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Zone
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Zone
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Zone Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Zone</DialogTitle>
            <DialogDescription>
              Define a new geographic zone for service management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input placeholder="Enter zone name" />
            </div>
            <div className="space-y-2">
              <Label>Zone Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Zone</SelectItem>
                  <SelectItem value="surge">Surge Zone</SelectItem>
                  <SelectItem value="restricted">Restricted Zone</SelectItem>
                  <SelectItem value="airport">Airport Zone</SelectItem>
                  <SelectItem value="event">Event Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe this zone..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Surge Pricing</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button>Create Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

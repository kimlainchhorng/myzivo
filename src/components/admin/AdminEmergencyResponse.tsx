import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Phone, MapPin, Clock, Car, User, Shield,
  PhoneCall, Ambulance, CheckCircle2, XCircle, MoreVertical
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Emergency {
  id: string;
  type: "accident" | "safety" | "medical" | "vehicle" | "dispute";
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "responding" | "resolved" | "closed";
  tripId: string;
  driverName: string;
  customerName: string;
  location: string;
  reportedAt: string;
  description: string;
  responder?: string;
  contactNumber?: string;
}

const mockEmergencies: Emergency[] = [
  { id: "1", type: "accident", severity: "critical", status: "responding", tripId: "TRP-12345", driverName: "John Smith", customerName: "Sarah Johnson", location: "123 Main St, Downtown", reportedAt: "2 min ago", description: "Vehicle collision reported", responder: "Emergency Team A", contactNumber: "+1 555-0123" },
  { id: "2", type: "safety", severity: "high", status: "reported", tripId: "TRP-12346", driverName: "Mike Brown", customerName: "Emma Wilson", location: "456 Oak Ave", reportedAt: "8 min ago", description: "Passenger feels unsafe", contactNumber: "+1 555-0456" },
  { id: "3", type: "medical", severity: "high", status: "responding", tripId: "TRP-12347", driverName: "David Lee", customerName: "Robert Chen", location: "789 Pine Rd", reportedAt: "15 min ago", description: "Passenger medical emergency", responder: "Medical Team", contactNumber: "+1 555-0789" },
  { id: "4", type: "vehicle", severity: "medium", status: "resolved", tripId: "TRP-12348", driverName: "Lisa Wang", customerName: "James Morrison", location: "321 Elm St", reportedAt: "45 min ago", description: "Vehicle breakdown", responder: "Roadside Assistance" },
  { id: "5", type: "dispute", severity: "low", status: "closed", tripId: "TRP-12349", driverName: "Tom Wilson", customerName: "Amy Chen", location: "654 Maple Dr", reportedAt: "2 hours ago", description: "Fare dispute between driver and rider" },
];

export default function AdminEmergencyResponse() {
  const [emergencies] = useState<Emergency[]>(mockEmergencies);
  const [searchQuery, setSearchQuery] = useState("");

  const activeEmergencies = emergencies.filter(e => e.status === "reported" || e.status === "responding").length;
  const criticalCases = emergencies.filter(e => e.severity === "critical").length;
  const respondingTeams = 3;
  const avgResponseTime = "4.2 min";

  const filteredEmergencies = emergencies.filter(e =>
    e.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tripId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: Emergency["type"]) => {
    const config: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
      accident: { icon: <Car className="h-3 w-3" />, label: "Accident", class: "bg-red-500/10 text-red-500" },
      safety: { icon: <Shield className="h-3 w-3" />, label: "Safety", class: "bg-amber-500/10 text-amber-500" },
      medical: { icon: <Ambulance className="h-3 w-3" />, label: "Medical", class: "bg-rose-500/10 text-rose-500" },
      vehicle: { icon: <Car className="h-3 w-3" />, label: "Vehicle", class: "bg-blue-500/10 text-blue-500" },
      dispute: { icon: <User className="h-3 w-3" />, label: "Dispute", class: "bg-purple-500/10 text-purple-500" }
    };
    return (
      <Badge className={config[type].class}>
        {config[type].icon}
        <span className="ml-1">{config[type].label}</span>
      </Badge>
    );
  };

  const getSeverityBadge = (severity: Emergency["severity"]) => {
    const config: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-blue-500/10 text-blue-500",
      high: "bg-amber-500/10 text-amber-500",
      critical: "bg-red-500/10 text-red-500 animate-pulse"
    };
    return <Badge className={config[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: Emergency["status"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      reported: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      responding: { icon: <PhoneCall className="h-3 w-3 animate-pulse" />, class: "bg-blue-500/10 text-blue-500" },
      resolved: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      closed: { icon: <XCircle className="h-3 w-3" />, class: "bg-muted text-muted-foreground" }
    };
    return (
      <Badge className={config[status].class}>
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
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Emergency Response Center
          </h2>
          <p className="text-muted-foreground">Manage accidents, safety incidents, and emergency situations</p>
        </div>
        <Button variant="destructive">
          <Phone className="h-4 w-4 mr-2" />
          Dispatch Emergency
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Emergencies</p>
                <p className="text-2xl font-bold">{activeEmergencies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Ambulance className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Cases</p>
                <p className="text-2xl font-bold">{criticalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PhoneCall className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responding Teams</p>
                <p className="text-2xl font-bold">{respondingTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Critical Alerts */}
      {criticalCases > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              Critical Alerts Requiring Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencies.filter(e => e.severity === "critical" && e.status !== "closed").map((emergency) => (
              <div key={emergency.id} className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium">{emergency.description}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {emergency.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {emergency.reportedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {emergency.contactNumber && (
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                  <Button size="sm" variant="destructive">
                    Respond Now
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Incidents</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Involved Parties</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmergencies.map((emergency) => (
                    <TableRow key={emergency.id}>
                      <TableCell className="font-mono text-sm">{emergency.tripId}</TableCell>
                      <TableCell>{getTypeBadge(emergency.type)}</TableCell>
                      <TableCell>{getSeverityBadge(emergency.severity)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Driver: {emergency.driverName}</p>
                          <p className="text-muted-foreground">Rider: {emergency.customerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {emergency.location}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(emergency.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {emergency.reportedAt}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Contact Driver</DropdownMenuItem>
                            <DropdownMenuItem>Contact Rider</DropdownMenuItem>
                            <DropdownMenuItem>Dispatch Help</DropdownMenuItem>
                            <DropdownMenuItem>Mark Resolved</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Showing only active incidents
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Showing resolved incidents
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

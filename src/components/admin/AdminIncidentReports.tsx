import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Search, MoreVertical, Clock, MapPin, 
  User, Car, CheckCircle2, XCircle, FileText
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

const incidents = [
  { id: "INC-001", type: "accident", severity: "high", status: "investigating", driver: "John Smith", rider: "Sarah Johnson", location: "123 Main St", reportedAt: "2 hours ago", description: "Minor collision reported" },
  { id: "INC-002", type: "complaint", severity: "medium", status: "resolved", driver: "Mike Brown", rider: "Emma Wilson", location: "456 Oak Ave", reportedAt: "5 hours ago", description: "Driver took wrong route" },
  { id: "INC-003", type: "safety", severity: "high", status: "open", driver: "David Lee", rider: "Lisa Wang", location: "789 Pine Rd", reportedAt: "1 day ago", description: "Passenger felt unsafe" },
  { id: "INC-004", type: "property", severity: "low", status: "closed", driver: "Tom Wilson", rider: "Amy Chen", location: "321 Elm St", reportedAt: "2 days ago", description: "Item left in vehicle" },
  { id: "INC-005", type: "accident", severity: "critical", status: "investigating", driver: "James Rodriguez", rider: "Robert Brown", location: "654 Maple Dr", reportedAt: "3 hours ago", description: "Vehicle damage reported" },
];

export default function AdminIncidentReports() {
  const [searchQuery, setSearchQuery] = useState("");

  const openIncidents = 3;
  const criticalIncidents = 1;
  const resolvedThisWeek = 12;
  const avgResolutionTime = "4.2h";

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-500",
      medium: "bg-amber-500/10 text-amber-500",
      high: "bg-orange-500/10 text-orange-500",
      critical: "bg-red-500/10 text-red-500 animate-pulse"
    };
    return <Badge className={config[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      open: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      investigating: { icon: <Search className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" },
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

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      accident: "bg-red-500/10 text-red-500",
      complaint: "bg-purple-500/10 text-purple-500",
      safety: "bg-orange-500/10 text-orange-500",
      property: "bg-blue-500/10 text-blue-500"
    };
    return <Badge variant="outline" className={config[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Incident Reports
          </h2>
          <p className="text-muted-foreground">Track and resolve safety incidents</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-2xl font-bold">{openIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{criticalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved (Week)</p>
                <p className="text-2xl font-bold">{resolvedThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Incidents</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search incidents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-mono">{incident.id}</TableCell>
                      <TableCell>{getTypeBadge(incident.type)}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1"><Car className="h-3 w-3" />{incident.driver}</div>
                          <div className="flex items-center gap-1 text-muted-foreground"><User className="h-3 w-3" />{incident.rider}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{incident.reportedAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Assign Investigator</DropdownMenuItem>
                            <DropdownMenuItem>Contact Parties</DropdownMenuItem>
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
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Clock, Mail, CheckCircle2, 
  XCircle, MoreVertical, TrendingUp, Calendar
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

const waitlistEntries = [
  { id: "1", email: "john@example.com", name: "John Smith", type: "driver", city: "New York", position: 1, joinedAt: "2024-01-10", referrals: 5 },
  { id: "2", email: "sarah@example.com", name: "Sarah Johnson", type: "driver", city: "Los Angeles", position: 2, joinedAt: "2024-01-11", referrals: 3 },
  { id: "3", email: "mike@example.com", name: "Mike Brown", type: "restaurant", city: "Chicago", position: 3, joinedAt: "2024-01-12", referrals: 0 },
  { id: "4", email: "emma@example.com", name: "Emma Wilson", type: "driver", city: "Houston", position: 4, joinedAt: "2024-01-13", referrals: 2 },
  { id: "5", email: "david@example.com", name: "David Lee", type: "hotel", city: "Miami", position: 5, joinedAt: "2024-01-14", referrals: 1 },
];

export default function AdminWaitlistManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const totalWaitlist = 2450;
  const driversWaiting = 1800;
  const partnersWaiting = 650;
  const weeklySignups = 320;

  const filteredEntries = waitlistEntries.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      driver: "bg-blue-500/10 text-blue-500",
      restaurant: "bg-orange-500/10 text-orange-500",
      hotel: "bg-purple-500/10 text-purple-500"
    };
    return <Badge className={config[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Waitlist Management
          </h2>
          <p className="text-muted-foreground">Manage driver and partner waitlists</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Invite Next Batch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Waitlist</p>
                <p className="text-2xl font-bold">{totalWaitlist.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers Waiting</p>
                <p className="text-2xl font-bold">{driversWaiting.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partners Waiting</p>
                <p className="text-2xl font-bold">{partnersWaiting.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">+{weeklySignups}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Waitlist Entries</CardTitle>
              <CardDescription>People waiting to join the platform</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant="outline">#{entry.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(entry.type)}</TableCell>
                  <TableCell>{entry.city}</TableCell>
                  <TableCell>
                    {entry.referrals > 0 && (
                      <Badge className="bg-green-500/10 text-green-500">+{entry.referrals}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.joinedAt).toLocaleDateString()}
                    </div>
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
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve & Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Update
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Remove
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
    </div>
  );
}

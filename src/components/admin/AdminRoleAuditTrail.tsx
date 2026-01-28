import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  ShieldPlus, 
  ShieldMinus, 
  ShieldCheck, 
  Crown,
  UserCog,
  ArrowRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface RoleAuditEntry {
  id: string;
  action: 'assigned' | 'removed' | 'upgraded' | 'downgraded';
  targetUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  performedBy: {
    name: string;
    email: string;
    avatar?: string;
  };
  oldRole?: string;
  newRole?: string;
  timestamp: Date;
  reason?: string;
}

const actionConfig = {
  assigned: { 
    icon: ShieldPlus, 
    color: "text-green-500", 
    bg: "bg-green-500/10",
    label: "Role Assigned" 
  },
  removed: { 
    icon: ShieldMinus, 
    color: "text-red-500", 
    bg: "bg-red-500/10",
    label: "Role Removed" 
  },
  upgraded: { 
    icon: Crown, 
    color: "text-amber-500", 
    bg: "bg-amber-500/10",
    label: "Role Upgraded" 
  },
  downgraded: { 
    icon: ShieldCheck, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10",
    label: "Role Downgraded" 
  },
};

const roleColors: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  moderator: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  user: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

// Mock audit data
const mockAuditEntries: RoleAuditEntry[] = [
  {
    id: "1",
    action: "assigned",
    targetUser: { name: "Alex Turner", email: "alex@example.com" },
    performedBy: { name: "System Admin", email: "admin@zivo.com" },
    newRole: "moderator",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reason: "Promoted due to excellent support contributions",
  },
  {
    id: "2",
    action: "upgraded",
    targetUser: { name: "Jennifer Lee", email: "jennifer@example.com" },
    performedBy: { name: "System Admin", email: "admin@zivo.com" },
    oldRole: "moderator",
    newRole: "admin",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    reason: "Taking over regional operations",
  },
  {
    id: "3",
    action: "removed",
    targetUser: { name: "Mark Stevens", email: "mark@example.com" },
    performedBy: { name: "Jennifer Lee", email: "jennifer@example.com" },
    oldRole: "moderator",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    reason: "Employee resignation",
  },
  {
    id: "4",
    action: "assigned",
    targetUser: { name: "Sarah Connor", email: "sarah@example.com" },
    performedBy: { name: "System Admin", email: "admin@zivo.com" },
    newRole: "admin",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    action: "downgraded",
    targetUser: { name: "Tom Wilson", email: "tom@example.com" },
    performedBy: { name: "Jennifer Lee", email: "jennifer@example.com" },
    oldRole: "admin",
    newRole: "moderator",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reason: "Reduced responsibilities per request",
  },
  {
    id: "6",
    action: "assigned",
    targetUser: { name: "Emily Chen", email: "emily@example.com" },
    performedBy: { name: "System Admin", email: "admin@zivo.com" },
    newRole: "moderator",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

const AdminRoleAuditTrail = () => {
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filteredEntries = mockAuditEntries.filter(entry => 
    actionFilter === "all" || entry.action === actionFilter
  );

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Role Audit Trail
            </CardTitle>
            <CardDescription>Track all role assignments and changes</CardDescription>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
              <SelectItem value="upgraded">Upgraded</SelectItem>
              <SelectItem value="downgraded">Downgraded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => {
              const config = actionConfig[entry.action];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all border border-border/30"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        config.bg
                      )}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <Badge variant="outline" className={cn("text-xs", config.bg, config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {format(entry.timestamp, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Target User */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src={entry.targetUser.avatar} />
                      <AvatarFallback className="text-xs bg-muted">
                        {entry.targetUser.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{entry.targetUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{entry.targetUser.email}</p>
                    </div>
                    
                    {/* Role Change Visualization */}
                    <div className="flex items-center gap-2">
                      {entry.oldRole && (
                        <Badge variant="outline" className={cn("text-xs", roleColors[entry.oldRole])}>
                          {entry.oldRole}
                        </Badge>
                      )}
                      {entry.oldRole && entry.newRole && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                      {entry.newRole && (
                        <Badge variant="outline" className={cn("text-xs", roleColors[entry.newRole])}>
                          {entry.newRole}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Performer & Reason */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCog className="h-3 w-3" />
                      <span>by {entry.performedBy.name}</span>
                    </div>
                    {entry.reason && (
                      <p className="text-xs text-muted-foreground italic max-w-[200px] truncate">
                        "{entry.reason}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminRoleAuditTrail;

/**
 * Campaigns List Page
 * View and manage all marketing campaigns
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Megaphone, Plus, Search, Filter, Clock, Calendar, 
  CheckCircle, Pause, Sparkles, MoreHorizontal, Trash2, Edit, Play
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { 
  useCampaigns, 
  useDeleteCampaign, 
  usePauseCampaign, 
  useResumeCampaign 
} from "@/hooks/useMarketing";
import { format } from "date-fns";
import type { MarketingCampaign } from "@/lib/marketing";

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock, color: "text-gray-400" },
  scheduled: { label: "Scheduled", variant: "outline" as const, icon: Calendar, color: "text-blue-400" },
  running: { label: "Running", variant: "default" as const, icon: Sparkles, color: "text-emerald-400" },
  completed: { label: "Completed", variant: "secondary" as const, icon: CheckCircle, color: "text-white/60" },
  paused: { label: "Paused", variant: "destructive" as const, icon: Pause, color: "text-amber-400" },
};

const TYPE_CONFIG = {
  promo: { label: "Promo", color: "bg-emerald-500/10 text-emerald-400" },
  push: { label: "Push", color: "bg-blue-500/10 text-blue-400" },
  winback: { label: "Win-back", color: "bg-amber-500/10 text-amber-400" },
  restaurant_boost: { label: "Boost", color: "bg-purple-500/10 text-purple-400" },
};

function CampaignRow({ 
  campaign, 
  onPause, 
  onResume, 
  onDelete 
}: { 
  campaign: MarketingCampaign;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}) {
  const statusConfig = STATUS_CONFIG[campaign.status];
  const typeConfig = TYPE_CONFIG[campaign.campaign_type];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center ${statusConfig.color}`}>
        <StatusIcon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <Link to={`/admin/marketing/campaigns/${campaign.id}`} className="hover:underline">
          <h3 className="font-medium text-white truncate">
            {campaign.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className="text-sm text-white/60">
            Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <div className="hidden sm:block">
        {campaign.start_date && (
          <p className="text-sm text-white/60">
            {campaign.status === "scheduled" ? "Starts" : "Started"} {format(new Date(campaign.start_date), "MMM d, h:mm a")}
          </p>
        )}
      </div>

      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`/admin/marketing/campaigns/${campaign.id}`} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              View / Edit
            </Link>
          </DropdownMenuItem>
          
          {campaign.status === "running" && (
            <DropdownMenuItem onClick={onPause} className="cursor-pointer">
              <Pause className="h-4 w-4 mr-2" />
              Pause Campaign
            </DropdownMenuItem>
          )}
          
          {campaign.status === "paused" && (
            <DropdownMenuItem onClick={onResume} className="cursor-pointer">
              <Play className="h-4 w-4 mr-2" />
              Resume Campaign
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={onDelete} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useCampaigns();
  const deleteMutation = useDeleteCampaign();
  const pauseMutation = usePauseCampaign();
  const resumeMutation = useResumeCampaign();

  // Filter campaigns
  const filteredCampaigns = (campaigns || []).filter(campaign => {
    if (search && !campaign.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && campaign.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== "all" && campaign.campaign_type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <div className="border-b border-white/10 bg-zinc-900/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/admin/marketing" className="text-white/60 hover:text-white">
                  Marketing
                </Link>
                <span className="text-white/40">/</span>
                <h1 className="text-xl font-bold">Campaigns</h1>
              </div>
              <Link to="/admin/marketing/campaigns/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-zinc-900 border-white/10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="winback">Win-back</SelectItem>
                  <SelectItem value="restaurant_boost">Boost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaigns List */}
          <Card className="bg-zinc-900/80 border-white/10">
            {isLoading ? (
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            ) : filteredCampaigns.length === 0 ? (
              <CardContent className="p-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-white/20 mb-4" />
                {search || statusFilter !== "all" || typeFilter !== "all" ? (
                  <>
                    <h3 className="font-medium text-white/80">No campaigns found</h3>
                    <p className="text-sm text-white/60 mt-1">
                      Try adjusting your filters
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-white/80">No campaigns yet</h3>
                    <p className="text-sm text-white/60 mt-1 mb-4">
                      Create your first campaign to start engaging users
                    </p>
                    <Link to="/admin/marketing/campaigns/new">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Campaign
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredCampaigns.map(campaign => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    onPause={() => pauseMutation.mutate(campaign.id)}
                    onResume={() => resumeMutation.mutate(campaign.id)}
                    onDelete={() => setDeleteTarget(campaign.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The campaign and all its delivery history will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminProtectedRoute>
  );
}

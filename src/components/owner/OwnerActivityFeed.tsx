/**
 * Owner Activity Feed Component
 * Displays a timeline of recent owner activity (bookings, payouts, reviews)
 */

import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, isToday, isYesterday, parseISO, startOfDay } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Car,
  DollarSign,
  Star,
  Clock,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { OwnerActivityItem, OwnerActivityType } from "@/hooks/useOwnerActivity";

interface OwnerActivityFeedProps {
  activities: OwnerActivityItem[] | undefined;
  isLoading: boolean;
}

const activityConfig: Record<OwnerActivityType, {
  icon: typeof Calendar;
  iconClass: string;
  bgClass: string;
}> = {
  booking_request: {
    icon: Calendar,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  booking_confirmed: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  trip_started: {
    icon: Car,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
  },
  trip_completed: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  payout: {
    icon: DollarSign,
    iconClass: "text-green-500",
    bgClass: "bg-green-500/10",
  },
  review: {
    icon: Star,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
};

function getDateGroup(timestamp: string): string {
  const date = parseISO(timestamp);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "This Week";
  return "Earlier";
}

function groupActivitiesByDate(activities: OwnerActivityItem[]): Map<string, OwnerActivityItem[]> {
  const groups = new Map<string, OwnerActivityItem[]>();
  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  // Initialize groups in order
  groupOrder.forEach((group) => groups.set(group, []));

  activities.forEach((activity) => {
    const group = getDateGroup(activity.timestamp);
    groups.get(group)?.push(activity);
  });

  // Remove empty groups
  groupOrder.forEach((group) => {
    if (groups.get(group)?.length === 0) {
      groups.delete(group);
    }
  });

  return groups;
}

function ActivityItem({ activity, onClick }: { activity: OwnerActivityItem; onClick?: () => void }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
        onClick && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-full shrink-0", config.bgClass)}>
        <Icon className={cn("w-4 h-4", config.iconClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{activity.title}</p>
        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
      </span>
    </div>
  );
}

export default function OwnerActivityFeed({ activities, isLoading }: OwnerActivityFeedProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest bookings and earnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest bookings and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Activity will appear here once you receive bookings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  const handleActivityClick = (activity: OwnerActivityItem) => {
    if (activity.metadata?.bookingId) {
      navigate(`/owner/bookings`);
    } else if (activity.type === "payout") {
      navigate("/owner/earnings");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest bookings and earnings</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          <div className="px-6 pb-6 space-y-4">
            {Array.from(groupedActivities.entries()).map(([group, items]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onClick={() => handleActivityClick(activity)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

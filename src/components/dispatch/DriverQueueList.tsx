/**
 * Driver Queue List
 * Displays ranked drivers with score breakdowns
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { Star, MapPin, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoredDriver {
  driverId: string;
  driverName: string;
  phone?: string;
  avatarUrl?: string | null;
  rating?: number | null;
  isOnline?: boolean | null;
  lastActiveAt?: string | null;
  lastAssignedAt?: string | null;
  totalAssignedToday?: number;
  totalScore: number;
  distanceScore: number;
  ratingScore: number;
  fairnessScore: number;
  freshnessScore: number;
}

interface DriverQueueListProps {
  drivers: ScoredDriver[];
  isLoading?: boolean;
  showScoreBreakdown?: boolean;
}

export function DriverQueueList({
  drivers,
  isLoading,
  showScoreBreakdown = true,
}: DriverQueueListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Loading driver queue...
      </div>
    );
  }

  if (!drivers.length) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No online drivers in this zone
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Score</TableHead>
          {showScoreBreakdown && (
            <>
              <TableHead className="hidden md:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Dist
                    </TooltipTrigger>
                    <TooltipContent>Distance Score (40 max)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> Rating
                    </TooltipTrigger>
                    <TooltipContent>Rating Score (25 max)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Fair
                    </TooltipTrigger>
                    <TooltipContent>Fairness Score (25 max)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Fresh
                    </TooltipTrigger>
                    <TooltipContent>Freshness Score (10 max)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
            </>
          )}
          <TableHead>Last Assigned</TableHead>
          <TableHead className="hidden sm:table-cell">Today</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((driver, index) => (
          <TableRow key={driver.driverId}>
            <TableCell>
              <Badge
                variant={index === 0 ? "default" : "secondary"}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  index === 0 && "bg-amber-500"
                )}
              >
                {index + 1}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={driver.avatarUrl || undefined} />
                  <AvatarFallback>
                    {driver.driverName?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{driver.driverName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {driver.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {driver.rating.toFixed(1)}
                      </span>
                    )}
                    <Badge
                      variant={driver.isOnline ? "default" : "secondary"}
                      className={cn(
                        "text-[10px] h-4",
                        driver.isOnline && "bg-green-500"
                      )}
                    >
                      {driver.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg">
                  {driver.totalScore.toFixed(0)}
                </span>
                <Progress
                  value={driver.totalScore}
                  className="h-1.5 w-16"
                />
              </div>
            </TableCell>
            {showScoreBreakdown && (
              <>
                <TableCell className="hidden md:table-cell">
                  <ScoreCell value={driver.distanceScore} max={40} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <ScoreCell value={driver.ratingScore} max={25} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <ScoreCell value={driver.fairnessScore} max={25} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <ScoreCell value={driver.freshnessScore} max={10} />
                </TableCell>
              </>
            )}
            <TableCell>
              {driver.lastAssignedAt ? (
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(driver.lastAssignedAt), {
                    addSuffix: true,
                  })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Never</span>
              )}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant="outline">{driver.totalAssignedToday || 0}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ScoreCell({ value, max }: { value: number; max: number }) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-6">{value.toFixed(0)}</span>
      <Progress value={percentage} className="h-1.5 w-12" />
    </div>
  );
}

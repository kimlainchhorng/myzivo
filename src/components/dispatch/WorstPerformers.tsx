/**
 * WorstPerformers Component
 * Tables showing drivers and merchants with lowest ratings
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, AlertTriangle, Flag, Truck, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WorstPerformer } from "@/hooks/useQualityMetrics";

interface WorstPerformersProps {
  performers: WorstPerformer[] | undefined;
  isLoading: boolean;
}

const WorstPerformers = ({ performers, isLoading }: WorstPerformersProps) => {
  const { toast } = useToast();

  const handleFlag = (performer: WorstPerformer) => {
    toast({
      title: "Flagged for Review",
      description: `${performer.name} has been flagged for quality review.`,
    });
    // In a real implementation, this would write to admin_driver_actions or similar
  };

  const drivers = performers?.filter((p) => p.type === "driver") || [];
  const merchants = performers?.filter((p) => p.type === "merchant") || [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Worst Drivers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Lowest Rated Drivers
          </CardTitle>
          <CardDescription>Drivers with 3+ ratings, sorted by avg rating</CardDescription>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No drivers with enough ratings to display
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Reviews</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.slice(0, 5).map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        {driver.avgRating.toFixed(1)}
                        <Star className="h-3 w-3 fill-primary text-primary" />
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {driver.ratingCount}
                        {driver.complaintCount > 0 && (
                          <Badge variant="destructive" className="text-xs ml-1">
                            {driver.complaintCount} issues
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlag(driver)}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        Flag
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Worst Merchants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Lowest Rated Merchants
          </CardTitle>
          <CardDescription>Merchants with 3+ ratings, sorted by avg rating</CardDescription>
        </CardHeader>
        <CardContent>
          {merchants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No merchants with enough ratings to display
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Reviews</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchants.slice(0, 5).map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell className="font-medium">{merchant.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1">
                        {merchant.avgRating.toFixed(1)}
                        <Star className="h-3 w-3 fill-primary text-primary" />
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {merchant.ratingCount}
                        {merchant.complaintCount > 0 && (
                          <Badge variant="destructive" className="text-xs ml-1">
                            {merchant.complaintCount} issues
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlag(merchant)}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        Flag
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorstPerformers;

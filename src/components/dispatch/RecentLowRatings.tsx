/**
 * RecentLowRatings Component
 * Table of recent ratings with 2 stars or less
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, ExternalLink, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { LowRating } from "@/hooks/useQualityMetrics";
import { RATING_TAGS } from "@/components/rating/TagSelector";

interface RecentLowRatingsProps {
  ratings: LowRating[] | undefined;
  isLoading: boolean;
}

const RecentLowRatings = ({ ratings, isLoading }: RecentLowRatingsProps) => {
  const getTagLabel = (tagId: string) => {
    return RATING_TAGS.find((t) => t.id === tagId)?.label || tagId;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Low Ratings
        </CardTitle>
        <CardDescription>
          Orders rated 2 stars or below requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!ratings || ratings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No low ratings found</p>
            <p className="text-sm text-muted-foreground mt-1">
              All customers are happy! 🎉
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="text-center">Driver ⭐</TableHead>
                  <TableHead className="text-center">Merchant ⭐</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(rating.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {rating.driverName || "—"}
                    </TableCell>
                    <TableCell>
                      {rating.merchantName || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {rating.driverRating !== null ? (
                        <span className={`flex items-center justify-center gap-1 ${
                          rating.driverRating <= 2 ? "text-destructive font-semibold" : ""
                        }`}>
                          {rating.driverRating}
                          <Star className={`h-3 w-3 ${
                            rating.driverRating <= 2
                              ? "fill-destructive text-destructive"
                              : "fill-primary text-primary"
                          }`} />
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rating.merchantRating !== null ? (
                        <span className={`flex items-center justify-center gap-1 ${
                          rating.merchantRating <= 2 ? "text-destructive font-semibold" : ""
                        }`}>
                          {rating.merchantRating}
                          <Star className={`h-3 w-3 ${
                            rating.merchantRating <= 2
                              ? "fill-destructive text-destructive"
                              : "fill-primary text-primary"
                          }`} />
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {rating.tags.length > 0 ? (
                          rating.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {getTagLabel(tag)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                        {rating.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{rating.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {rating.comment ? (
                        <p className="text-sm truncate" title={rating.comment}>
                          {rating.comment}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {rating.contactBack && (
                          <Badge variant="secondary" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Callback
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <Link to={`/dispatch/orders/${rating.orderId}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLowRatings;

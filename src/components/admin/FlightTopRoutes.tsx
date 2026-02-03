/**
 * Flight Top Routes Tables
 * Shows top searched routes and routes with zero results
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plane, AlertTriangle, TrendingUp } from "lucide-react";
import { type RouteStats } from "@/hooks/useFlightAnalytics";

interface FlightTopRoutesProps {
  topSearched: RouteStats[];
  topBooked: RouteStats[];
  zeroResults: RouteStats[];
  isLoading?: boolean;
}

export function FlightTopRoutes({
  topSearched,
  topBooked,
  zeroResults,
  isLoading,
}: FlightTopRoutesProps) {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Searched Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routes with Zero Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Top Searched Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Searched Routes
          </CardTitle>
          <CardDescription>Most popular flight searches</CardDescription>
        </CardHeader>
        <CardContent>
          {topSearched.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Searches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSearched.map((route, i) => (
                  <TableRow key={`${route.origin}-${route.destination}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {route.origin}
                        </Badge>
                        <Plane className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono">
                          {route.destination}
                        </Badge>
                        {i === 0 && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            #1
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {route.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No search data available</p>
          )}
        </CardContent>
      </Card>

      {/* Zero Results Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Routes with Zero Results
          </CardTitle>
          <CardDescription>
            Routes where users found no flights - consider adding coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zeroResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Failed Searches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zeroResults.map((route) => (
                  <TableRow key={`${route.origin}-${route.destination}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {route.origin}
                        </Badge>
                        <Plane className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono">
                          {route.destination}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{route.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-emerald-600 font-medium">✓ All routes returning results</p>
              <p className="text-sm text-muted-foreground mt-1">No zero-result searches detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Revenue Routes */}
      {topBooked.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Top Revenue Routes
            </CardTitle>
            <CardDescription>Routes generating the most booking revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBooked.slice(0, 5).map((route, i) => (
                  <TableRow key={`${route.origin}-${route.destination}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {route.origin}
                        </Badge>
                        <Plane className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono">
                          {route.destination}
                        </Badge>
                        {i === 0 && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            Top Revenue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{route.count}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ${(route.revenue || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

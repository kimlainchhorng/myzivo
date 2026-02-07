/**
 * Dispatch Drivers Page
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useDispatchDrivers } from "@/hooks/useDispatchDrivers";
import { useToggleDriverOnline } from "@/hooks/useOrderMutations";
import { formatDistanceToNow } from "date-fns";

const DispatchDrivers = () => {
  const { data: drivers, isLoading } = useDispatchDrivers();
  const toggleOnline = useToggleDriverOnline();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Drivers</h1>
        <p className="text-muted-foreground">Live driver management</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Active Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(drivers || []).map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={driver.is_online ? "default" : "secondary"}>
                      {driver.is_online ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell>{driver.vehicle_type}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(driver.updated_at), { addSuffix: true })}</TableCell>
                  <TableCell>{driver.activeOrder?.restaurant_name || "-"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => toggleOnline.mutate({ driverId: driver.id, isOnline: !driver.is_online })}>
                      {driver.is_online ? "Set Offline" : "Set Online"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchDrivers;

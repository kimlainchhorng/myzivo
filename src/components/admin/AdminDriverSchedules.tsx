import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  { label: "Morning", start: "06:00", end: "12:00", icon: Sunrise, color: "text-amber-500" },
  { label: "Afternoon", start: "12:00", end: "18:00", icon: Sun, color: "text-yellow-500" },
  { label: "Evening", start: "18:00", end: "22:00", icon: Sunset, color: "text-orange-500" },
  { label: "Night", start: "22:00", end: "06:00", icon: Moon, color: "text-indigo-500" },
];

const AdminDriverSchedules = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newShift, setNewShift] = useState({
    driver_id: "",
    start_time: "09:00",
    end_time: "17:00"
  });
  const queryClient = useQueryClient();

  // Fetch verified drivers for assignment
  const { data: drivers } = useQuery({
    queryKey: ["verified-drivers-for-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, avatar_url, vehicle_type")
        .eq("status", "verified");
      if (error) throw error;
      return data;
    },
  });

  // Fetch driver schedules
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["admin-driver-schedules", currentWeekStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_schedules")
        .select(`
          *,
          driver:drivers(id, full_name, avatar_url, vehicle_type)
        `)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  // Fetch driver shifts for the current week
  const { data: shifts } = useQuery({
    queryKey: ["admin-driver-shifts", currentWeekStart.toISOString()],
    queryFn: async () => {
      const weekEnd = endOfWeek(currentWeekStart);
      
      const { data, error } = await supabase
        .from("driver_shifts")
        .select(`
          *,
          driver:drivers(id, full_name, avatar_url, vehicle_type)
        `)
        .gte("shift_date", format(currentWeekStart, "yyyy-MM-dd"))
        .lte("shift_date", format(weekEnd, "yyyy-MM-dd"));

      if (error) throw error;
      return data;
    },
  });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart(prev => addDays(prev, direction === "next" ? 7 : -7));
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const getShiftsForDay = (date: Date) => {
    return shifts?.filter(shift => 
      shift.shift_date === format(date, "yyyy-MM-dd")
    ) || [];
  };

  const getDriversForTimeSlot = (dayIndex: number, slot: typeof TIME_SLOTS[0]) => {
    const driversWithSchedule = schedules?.filter(schedule => 
      schedule.day_of_week === dayIndex &&
      schedule.start_time >= slot.start &&
      schedule.start_time < slot.end
    ) || [];

    return driversWithSchedule;
  };

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data: { driver_id: string; shift_date: string; start_time: string; end_time: string }) => {
      const { error } = await supabase
        .from("driver_shifts")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-driver-shifts"] });
      toast.success("Shift created successfully");
      setIsCreateShiftOpen(false);
      setNewShift({ driver_id: "", start_time: "09:00", end_time: "17:00" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create shift");
    },
  });

  const handleCreateShift = () => {
    if (!selectedDate || !newShift.driver_id) {
      toast.error("Please select a driver and date");
      return;
    }
    createShiftMutation.mutate({
      driver_id: newShift.driver_id,
      shift_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: newShift.start_time,
      end_time: newShift.end_time
    });
  };

  const openCreateShift = (date: Date) => {
    setSelectedDate(date);
    setIsCreateShiftOpen(true);
  };

  const weekDays = getWeekDays();
  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date()));

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Driver Schedules</CardTitle>
                <CardDescription>View and manage driver availability</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateWeek("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={isCurrentWeek ? "default" : "outline"}
                onClick={() => setCurrentWeekStart(startOfWeek(new Date()))}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateWeek("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week View */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b border-border/50">
            <div className="p-3 border-r border-border/50 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Time</span>
            </div>
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const dayShifts = getShiftsForDay(day);
              
              return (
                <div 
                  key={i}
                  className={cn(
                    "p-3 text-center border-r border-border/50 last:border-r-0 group cursor-pointer hover:bg-muted/30",
                    isToday && "bg-primary/5"
                  )}
                  onClick={() => openCreateShift(day)}
                >
                  <p className={cn(
                    "text-xs font-medium",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {DAYS[i]}
                  </p>
                  <p className={cn(
                    "text-lg font-bold",
                    isToday && "text-primary"
                  )}>
                    {format(day, "d")}
                  </p>
                  {dayShifts.length > 0 ? (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {dayShifts.length} shifts
                    </Badge>
                  ) : (
                    <Plus className="h-4 w-4 mx-auto mt-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          {TIME_SLOTS.map((slot) => (
            <div key={slot.label} className="grid grid-cols-8 border-b border-border/50 last:border-b-0">
              <div className="p-3 border-r border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <slot.icon className={cn("h-4 w-4", slot.color)} />
                  <div>
                    <p className="text-xs font-medium">{slot.label}</p>
                    <p className="text-[10px] text-muted-foreground">{slot.start} - {slot.end}</p>
                  </div>
                </div>
              </div>
              {weekDays.map((day, dayIndex) => {
                const driversInSlot = getDriversForTimeSlot(dayIndex, slot);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={dayIndex}
                    className={cn(
                      "p-2 border-r border-border/50 last:border-r-0 min-h-[80px] cursor-pointer hover:bg-muted/20",
                      isToday && "bg-primary/5"
                    )}
                    onClick={() => openCreateShift(day)}
                  >
                    {isLoading ? (
                      <div className="space-y-1">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                    ) : driversInSlot.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <Plus className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {driversInSlot.slice(0, 3).map((schedule: any) => (
                          <Avatar key={schedule.id} className="h-6 w-6 border border-background">
                            <AvatarImage src={schedule.driver?.avatar_url} />
                            <AvatarFallback className="text-[8px] bg-primary/10">
                              {schedule.driver?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {driversInSlot.length > 3 && (
                          <Badge variant="secondary" className="h-6 text-[10px]">
                            +{driversInSlot.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Today's Active Drivers */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            Today's Scheduled Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {schedules?.filter(s => s.day_of_week === new Date().getDay()).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No drivers scheduled for today</p>
                </div>
              ) : (
                schedules?.filter(s => s.day_of_week === new Date().getDay()).map((schedule: any) => (
                  <div 
                    key={schedule.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={schedule.driver?.avatar_url} />
                      <AvatarFallback className="bg-primary/10">
                        {schedule.driver?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{schedule.driver?.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {schedule.start_time} - {schedule.end_time}
                        <span className="text-muted-foreground/50">•</span>
                        <span className="capitalize">{schedule.driver?.vehicle_type}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Scheduled
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Shift Dialog */}
      <Dialog open={isCreateShiftOpen} onOpenChange={setIsCreateShiftOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Shift
            </DialogTitle>
            <DialogDescription>
              {selectedDate && `Assign a driver for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={newShift.driver_id} onValueChange={(v) => setNewShift({ ...newShift, driver_id: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={driver.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {driver.full_name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{driver.full_name}</span>
                        <Badge variant="outline" className="ml-1 text-xs capitalize">
                          {driver.vehicle_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newShift.start_time}
                  onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newShift.end_time}
                  onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateShiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateShift} disabled={createShiftMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Create Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverSchedules;
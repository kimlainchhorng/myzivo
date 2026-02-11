import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Car, User, Phone, Mail, MessageSquare, CarFront, Sparkles } from "lucide-react";
import { useCreateRideRequest, RideType } from "@/hooks/useRideRequests";
import { cn } from "@/lib/utils";

const rideRequestSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_phone: z.string().min(10, "Please enter a valid phone number"),
  customer_email: z.string().email("Please enter a valid email"),
  pickup_address: z.string().min(5, "Please enter a pickup address"),
  dropoff_address: z.string().min(5, "Please enter a drop-off address"),
  ride_type: z.enum(["standard", "xl", "premium"]),
  schedule_type: z.enum(["now", "scheduled"]),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
  notes: z.string().optional(),
});

type RideRequestFormData = z.infer<typeof rideRequestSchema>;

interface RideRequestFormProps {
  onSuccess: () => void;
}

const rideTypes = [
  {
    value: "standard",
    label: "Standard",
    description: "Everyday rides, 1-4 passengers",
    Icon: Car,
  },
  {
    value: "xl",
    label: "XL",
    description: "Larger vehicles, 1-6 passengers",
    Icon: CarFront,
  },
  {
    value: "premium",
    label: "Premium",
    description: "Luxury vehicles, premium service",
    Icon: Sparkles,
  },
];

export default function RideRequestForm({ onSuccess }: RideRequestFormProps) {
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const createRideRequest = useCreateRideRequest();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RideRequestFormData>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      ride_type: "standard",
      schedule_type: "now",
    },
  });

  const selectedRideType = watch("ride_type");

  const onSubmit = async (data: RideRequestFormData) => {
    let scheduledAt: string | null = null;
    
    if (data.schedule_type === "scheduled" && data.scheduled_date && data.scheduled_time) {
      const dateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
      scheduledAt = dateTime.toISOString();
    }

    await createRideRequest.mutateAsync({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      ride_type: data.ride_type as RideType,
      scheduled_at: scheduledAt,
      notes: data.notes || null,
    });

    onSuccess();
  };

  // Get minimum date (today) and time for scheduling
  const today = new Date().toISOString().split("T")[0];
  const minTime = new Date().toTimeString().slice(0, 5);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Pickup & Dropoff */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pickup_address" className="flex items-center gap-2 text-base font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            Pickup Address
          </Label>
          <Input
            id="pickup_address"
            placeholder="Enter pickup location"
            className="h-12"
            {...register("pickup_address")}
          />
          {errors.pickup_address && (
            <p className="text-sm text-destructive">{errors.pickup_address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dropoff_address" className="flex items-center gap-2 text-base font-medium">
            <MapPin className="h-4 w-4 text-destructive" />
            Drop-off Address
          </Label>
          <Input
            id="dropoff_address"
            placeholder="Enter destination"
            className="h-12"
            {...register("dropoff_address")}
          />
          {errors.dropoff_address && (
            <p className="text-sm text-destructive">{errors.dropoff_address.message}</p>
          )}
        </div>
      </div>

      {/* Schedule Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-medium">
          <Clock className="h-4 w-4 text-primary" />
          When do you need a ride?
        </Label>
        <RadioGroup
          defaultValue="now"
          onValueChange={(value) => {
            setScheduleType(value as "now" | "scheduled");
            setValue("schedule_type", value as "now" | "scheduled");
          }}
          className="grid grid-cols-2 gap-3"
        >
          <Label
            htmlFor="now"
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
              scheduleType === "now"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            )}
          >
            <RadioGroupItem value="now" id="now" className="sr-only" />
            <Clock className="h-5 w-5" />
            <span className="font-medium">Ride Now</span>
          </Label>
          <Label
            htmlFor="scheduled"
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
              scheduleType === "scheduled"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            )}
          >
            <RadioGroupItem value="scheduled" id="scheduled" className="sr-only" />
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Schedule</span>
          </Label>
        </RadioGroup>

        {scheduleType === "scheduled" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                min={today}
                className="h-12"
                {...register("scheduled_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                className="h-12"
                {...register("scheduled_time")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ride Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-medium">
          <Car className="h-4 w-4 text-primary" />
          Ride Type
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {rideTypes.map((type) => (
            <Card
              key={type.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedRideType === type.value
                  ? "border-2 border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => setValue("ride_type", type.value as RideType)}
            >
              <CardContent className="p-4 text-center">
                <span className="block mb-2"><type.Icon className="w-6 h-6 text-primary mx-auto" /></span>
                <p className="font-semibold">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <input type="hidden" {...register("ride_type")} />
      </div>

      {/* Customer Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="customer_name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Full Name
          </Label>
          <Input
            id="customer_name"
            placeholder="John Doe"
            className="h-12"
            {...register("customer_name")}
          />
          {errors.customer_name && (
            <p className="text-sm text-destructive">{errors.customer_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="customer_phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="h-12"
              {...register("customer_phone")}
            />
            {errors.customer_phone && (
              <p className="text-sm text-destructive">{errors.customer_phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="john@example.com"
              className="h-12"
              {...register("customer_email")}
            />
            {errors.customer_email && (
              <p className="text-sm text-destructive">{errors.customer_email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Additional Notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or instructions..."
          className="min-h-[80px] resize-none"
          {...register("notes")}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 transition-opacity"
        disabled={isSubmitting || createRideRequest.isPending}
      >
        {isSubmitting || createRideRequest.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Submitting...
          </span>
        ) : (
          "Request Ride"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No payment required now. We'll match you with an available driver.
      </p>
    </form>
  );
}

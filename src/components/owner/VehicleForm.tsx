/**
 * Vehicle Form Component
 * Form for adding/editing P2P vehicles
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { VehicleImageUpload } from "./VehicleImageUpload";
import { PricingHelper } from "./PricingHelper";

const currentYear = new Date().getFullYear();

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(2018, "Vehicle must be 2018 or newer").max(currentYear + 1),
  trim: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  vin: z.string().length(17, "VIN must be 17 characters"),
  license_plate: z.string().min(2, "License plate is required"),
  category: z.enum(["economy", "compact", "midsize", "fullsize", "suv", "luxury", "minivan", "truck"]),
  transmission: z.enum(["automatic", "manual"]),
  fuel_type: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  seats: z.number().min(2).max(15),
  doors: z.number().min(2).max(6),
  mileage: z.number().min(0),
  description: z.string().min(10, "Description must be at least 10 characters"),
  daily_rate: z.number().min(20, "Daily rate must be at least $20"),
  weekly_rate: z.number().optional(),
  monthly_rate: z.number().optional(),
  min_trip_days: z.number().min(1).max(30).default(1),
  max_trip_days: z.number().min(1).max(365).default(30),
  location_address: z.string().min(5, "Address is required"),
  location_city: z.string().min(2, "City is required"),
  location_state: z.string().length(2, "State must be 2 characters"),
  location_zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  instant_book: z.boolean().default(false),
  images: z.array(z.string()).min(1, "At least one image is required"),
  features: z.array(z.string()).default([]),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const categoryOptions = [
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "midsize", label: "Midsize" },
  { value: "fullsize", label: "Full Size" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "Luxury" },
  { value: "minivan", label: "Minivan" },
  { value: "truck", label: "Truck" },
];

const featureOptions = [
  "Air Conditioning",
  "Bluetooth",
  "Backup Camera",
  "GPS Navigation",
  "Heated Seats",
  "Leather Seats",
  "Sunroof",
  "Apple CarPlay",
  "Android Auto",
  "USB Charger",
  "All-Wheel Drive",
  "Keyless Entry",
  "Child Seat",
  "Ski Rack",
  "Bike Rack",
];

export function VehicleForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Save Vehicle",
}: VehicleFormProps) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: currentYear,
      trim: "",
      color: "",
      vin: "",
      license_plate: "",
      category: "economy",
      transmission: "automatic",
      fuel_type: "gasoline",
      seats: 5,
      doors: 4,
      mileage: 0,
      description: "",
      daily_rate: 50,
      weekly_rate: undefined,
      monthly_rate: undefined,
      min_trip_days: 1,
      max_trip_days: 30,
      location_address: "",
      location_city: "",
      location_state: "",
      location_zip: "",
      instant_book: false,
      images: [],
      features: [],
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const toggleFeature = (feature: string) => {
    const current = form.getValues("features");
    if (current.includes(feature)) {
      form.setValue("features", current.filter((f) => f !== feature));
    } else {
      form.setValue("features", [...current, feature]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <VehicleImageUpload
                      images={field.value}
                      onImagesChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make *</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <FormControl>
                    <Input placeholder="Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2018}
                      max={currentYear + 1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Must be 2018 or newer</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trim</FormLabel>
                  <FormControl>
                    <Input placeholder="SE, XLE, Limited..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <FormControl>
                    <Input placeholder="Silver" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transmission *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuel_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2}
                      max={15}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doors *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2}
                      max={6}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mileage *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="17-character VIN"
                      maxLength={17}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="license_plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC1234"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your vehicle, its condition, and any special features..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((feature) => {
                const isSelected = form.watch("features").includes(feature);
                return (
                  <Button
                    key={feature}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Smart Pricing Helper */}
            <PricingHelper
              category={form.watch("category")}
              currentPrice={form.watch("daily_rate") || 50}
              city={form.watch("location_city")}
              onSuggestedClick={(price) => form.setValue("daily_rate", price)}
            />
            
            <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={20}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Optional discount"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Leave empty for no discount</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Optional discount"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </CardContent>
        </Card>

        {/* Trip Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="min_trip_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Trip (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_trip_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Trip (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instant_book"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Instant Book</FormLabel>
                    <FormDescription>
                      Allow guests to book without your approval
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Pickup Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location_address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CA"
                      maxLength={2}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="90001" maxLength={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}

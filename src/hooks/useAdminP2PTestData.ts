/**
 * Admin P2P Test Data Hooks
 * Hooks for creating test data in P2P car rental system
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

// Sample vehicle data pool
const SAMPLE_VEHICLES = [
  { make: "Tesla", model: "Model 3", year: 2023, category: "electric", daily_rate: 85, transmission: "automatic", fuel_type: "electric", seats: 5, doors: 4, color: "Pearl White" },
  { make: "Toyota", model: "Camry", year: 2022, category: "midsize", daily_rate: 55, transmission: "automatic", fuel_type: "gasoline", seats: 5, doors: 4, color: "Silver" },
  { make: "Honda", model: "CR-V", year: 2023, category: "suv", daily_rate: 65, transmission: "automatic", fuel_type: "gasoline", seats: 5, doors: 4, color: "Obsidian Blue" },
  { make: "BMW", model: "3 Series", year: 2022, category: "luxury", daily_rate: 110, transmission: "automatic", fuel_type: "gasoline", seats: 5, doors: 4, color: "Alpine White" },
  { make: "Ford", model: "Mustang", year: 2023, category: "sports", daily_rate: 95, transmission: "automatic", fuel_type: "gasoline", seats: 4, doors: 2, color: "Race Red" },
  { make: "Chevrolet", model: "Suburban", year: 2021, category: "fullsize", daily_rate: 85, transmission: "automatic", fuel_type: "gasoline", seats: 8, doors: 4, color: "Black" },
];

// Sample locations
const SAMPLE_LOCATIONS = [
  { city: "Los Angeles", state: "CA", zip: "90001", address: "123 Sunset Blvd" },
  { city: "Miami", state: "FL", zip: "33101", address: "456 Ocean Drive" },
  { city: "New York", state: "NY", zip: "10001", address: "789 5th Avenue" },
  { city: "Austin", state: "TX", zip: "78701", address: "321 Congress Ave" },
  { city: "Denver", state: "CO", zip: "80202", address: "555 16th Street" },
];

// Sample car images from Unsplash
const SAMPLE_IMAGES: Record<string, string[]> = {
  Tesla: [
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
  ],
  Toyota: [
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
  ],
  Honda: [
    "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80",
    "https://images.unsplash.com/photo-1568844293986-8c1a5f8e6c1e?w=800&q=80",
  ],
  BMW: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
  ],
  Ford: [
    "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  ],
  Chevrolet: [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  ],
};

// Generate random VIN
function generateVIN() {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  return Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Generate random license plate
function generateLicensePlate() {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const numbers = "0123456789";
  return (
    Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("") +
    "-" +
    Array.from({ length: 4 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join("")
  );
}

// Create test owner mutation
export function useCreateTestOwner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      const location = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
      const timestamp = Date.now();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertPayload: any = {
        user_id: user.id,
        full_name: `Demo Owner ${timestamp.toString().slice(-4)}`,
        email: `demo.owner.${timestamp}@test.zivo.com`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        date_of_birth: "1990-05-15",
        address: location.address,
        city: location.city,
        state: location.state,
        zip_code: location.zip,
        status: "verified",
        documents_verified: true,
        insurance_option: "platform",
        ssn_last_four: "1234",
      };
      
      const { data, error } = await supabase
        .from("car_owner_profiles")
        .insert(insertPayload)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminCarOwners"] });
      queryClient.invalidateQueries({ queryKey: ["adminOwnerStats"] });
      toast.success(`Test owner created: ${data.full_name}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create test owner");
    },
  });
}

// Create test vehicle mutation
export function useCreateTestVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // First get an owner
      const ownerQuery = await supabase
        .from("car_owner_profiles")
        .select("id")
        .eq("status", "verified")
        .limit(1);
      
      if (ownerQuery.error) throw ownerQuery.error;
      if (!ownerQuery.data || ownerQuery.data.length === 0) {
        throw new Error("No verified owners found. Create a test owner first.");
      }
      
      const ownerId = ownerQuery.data[0].id;
      const vehicle = SAMPLE_VEHICLES[Math.floor(Math.random() * SAMPLE_VEHICLES.length)];
      const location = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
      const images = SAMPLE_IMAGES[vehicle.make] || SAMPLE_IMAGES.Toyota;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertPayload: any = {
        owner_id: ownerId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        transmission: vehicle.transmission,
        fuel_type: vehicle.fuel_type,
        seats: vehicle.seats,
        doors: vehicle.doors,
        color: vehicle.color,
        daily_rate: vehicle.daily_rate,
        weekly_rate: Math.round(vehicle.daily_rate * 6),
        monthly_rate: Math.round(vehicle.daily_rate * 22),
        mileage: Math.floor(Math.random() * 30000 + 5000),
        vin: generateVIN(),
        license_plate: generateLicensePlate(),
        location_address: location.address,
        location_city: location.city,
        location_state: location.state,
        location_zip: location.zip,
        location_lat: 34.0522 + (Math.random() - 0.5) * 0.1,
        location_lng: -118.2437 + (Math.random() - 0.5) * 0.1,
        images,
        features: ["Bluetooth", "Backup Camera", "USB Charging", "Air Conditioning"],
        description: `Well-maintained ${vehicle.year} ${vehicle.make} ${vehicle.model}. Perfect for city driving and road trips. Non-smoking vehicle.`,
        instant_book: Math.random() > 0.5,
        min_rental_days: 1,
        max_rental_days: 30,
        advance_notice_hours: 24,
        approval_status: "approved",
        is_active: true,
      };
      
      const { data, error } = await supabase
        .from("p2p_vehicles")
        .insert(insertPayload)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
      toast.success(`Test vehicle created: ${data.year} ${data.make} ${data.model}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create test vehicle");
    },
  });
}

// Create test booking mutation
export function useCreateTestBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      
      // Get an approved vehicle - use RPC-style to avoid deep type instantiation
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("p2p_vehicles")
        .select("*")
        .eq("approval_status", "approved" as const)
        .limit(1);
      
      if (vehicleError) throw vehicleError;
      if (!vehicleData || vehicleData.length === 0) {
        throw new Error("No approved vehicles found. Create a test vehicle first.");
      }
      
      const vehicle = vehicleData[0];
      const pickupDate = addDays(new Date(), 1);
      const returnDate = addDays(pickupDate, 3);
      const totalDays = 3;
      const dailyRate = vehicle.daily_rate;
      const subtotal = dailyRate * totalDays;
      const serviceFee = Math.round(subtotal * 0.12);
      const insuranceFee = 15 * totalDays;
      const taxes = Math.round(subtotal * 0.08);
      const totalAmount = subtotal + serviceFee + insuranceFee + taxes;
      const platformFee = Math.round(subtotal * 0.20);
      const ownerPayout = subtotal - platformFee;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertPayload: any = {
        vehicle_id: vehicle.id,
        owner_id: vehicle.owner_id,
        renter_id: user.id,
        pickup_date: format(pickupDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        pickup_location: `${vehicle.location_address}, ${vehicle.location_city}, ${vehicle.location_state}`,
        total_days: totalDays,
        daily_rate: dailyRate,
        subtotal,
        service_fee: serviceFee,
        insurance_fee: insuranceFee,
        taxes,
        total_amount: totalAmount,
        platform_fee: platformFee,
        owner_payout: ownerPayout,
        status: "pending",
        payment_status: "pending",
      };
      
      const { data, error } = await supabase
        .from("p2p_bookings")
        .insert(insertPayload)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PBookings"] });
      toast.success("Test booking created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create test booking");
    },
  });
}

/**
 * Shared canonical amenity → Lucide icon mapping for lodging UI.
 * Lookup is case-insensitive and normalizes spaces / underscores / dashes.
 */
import {
  Wifi, Snowflake, Waves, ParkingCircle, Coffee, Tv, Utensils, Briefcase,
  WashingMachine, Dumbbell, PawPrint, TreePalm, Flame, Bath, Umbrella, Plane,
  ShieldAlert, Wind, Bed, Bell, Sparkles, Car, Mountain, Sun, Check,
  type LucideIcon,
} from "lucide-react";

const norm = (s: string) => s.toLowerCase().replace(/[\s_\-]+/g, "");

const RAW_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  wirelessinternet: Wifi,
  internet: Wifi,
  ac: Snowflake,
  airconditioning: Snowflake,
  aircon: Snowflake,
  pool: Waves,
  swimmingpool: Waves,
  parking: ParkingCircle,
  freeparking: ParkingCircle,
  breakfast: Coffee,
  coffee: Coffee,
  tv: Tv,
  cabletv: Tv,
  smarttv: Tv,
  kitchen: Utensils,
  kitchenette: Utensils,
  workspace: Briefcase,
  desk: Briefcase,
  laundry: WashingMachine,
  washer: WashingMachine,
  dryer: WashingMachine,
  gym: Dumbbell,
  fitness: Dumbbell,
  pets: PawPrint,
  petsallowed: PawPrint,
  petfriendly: PawPrint,
  balcony: TreePalm,
  terrace: TreePalm,
  garden: TreePalm,
  heating: Flame,
  fireplace: Flame,
  hottub: Bath,
  jacuzzi: Bath,
  bathtub: Bath,
  beachaccess: Umbrella,
  beachfront: Umbrella,
  airportshuttle: Plane,
  shuttle: Plane,
  smokedetector: ShieldAlert,
  smokealarm: ShieldAlert,
  safe: ShieldAlert,
  fan: Wind,
  ceilingfan: Wind,
  kingbed: Bed,
  queenbed: Bed,
  roomservice: Bell,
  concierge: Bell,
  cleaning: Sparkles,
  housekeeping: Sparkles,
  carrental: Car,
  valet: Car,
  mountainview: Mountain,
  seaview: Sun,
  oceanview: Sun,
};

export function getAmenityIcon(name: string): LucideIcon {
  return RAW_MAP[norm(name)] ?? Check;
}

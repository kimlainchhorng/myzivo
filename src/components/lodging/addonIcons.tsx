/**
 * Shared lodge add-on icon mapping.
 * `slug` is a short keyword stored on LodgeAddon.icon — resolved here to a Lucide icon.
 * Falls back to Sparkles for unknown slugs (or legacy emoji strings).
 */
import {
  Croissant, Utensils, UtensilsCrossed, Wine, GlassWater, Martini, Bus, Car,
  CarTaxiFront, Bike, Clock, Bed, Baby, User, PawPrint, Sparkles,
  HeartHandshake, Flower2, Cake, Flower, Anchor, Palmtree, Ship, ChefHat,
  Brush, Shirt, ParkingCircle, Umbrella,
  type LucideIcon,
} from "lucide-react";

export const ADDON_ICON_MAP: Record<string, LucideIcon> = {
  breakfast: Croissant,
  halfboard: Utensils,
  fullboard: UtensilsCrossed,
  welcomedrink: Martini,
  wine: Wine,
  minibar: GlassWater,
  airportpickup: Bus,
  airportdropoff: CarTaxiFront,
  airporttransfer: Car,
  scooter: Bike,
  carrental: Car,
  bicycle: Bike,
  earlycheckin: Clock,
  latecheckout: Clock,
  extrabed: Bed,
  babycrib: Baby,
  extraguest: User,
  petfee: PawPrint,
  spa: Sparkles,
  couplesmassage: HeartHandshake,
  yoga: Sparkles,
  snorkeling: Anchor,
  island: Palmtree,
  cruise: Ship,
  chef: ChefHat,
  honeymoon: Flower2,
  cake: Cake,
  flowers: Flower,
  champagne: Wine,
  housekeeping: Brush,
  laundry: Shirt,
  parking: ParkingCircle,
  beachtowel: Umbrella,
};

export function AddonIcon({ slug, className = "h-3.5 w-3.5" }: { slug?: string; className?: string }) {
  const Icon = (slug && ADDON_ICON_MAP[slug]) || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}

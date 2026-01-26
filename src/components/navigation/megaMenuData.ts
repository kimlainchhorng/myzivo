import {
  Car,
  UtensilsCrossed,
  Plane,
  Hotel,
  Package,
  Train,
  Ticket,
  Shield,
  FileText,
  HelpCircle,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Users,
  Briefcase,
  Heart,
  Zap,
  Globe,
  CreditCard,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Scale,
  BookOpen,
  MessageCircle,
  Building2,
  Bed,
  Utensils,
  Coffee,
  Wine,
  Truck,
  LucideIcon,
} from "lucide-react";

export interface MegaMenuItem {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  color?: string;
  badge?: string;
}

export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuData {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  hoverColor: string;
  description: string;
  mainAction: {
    label: string;
    href: string;
  };
  sections: MegaMenuSection[];
  policies: MegaMenuItem[];
}

export const megaMenuData: MegaMenuData[] = [
  {
    id: "rides",
    label: "Rides",
    icon: Car,
    color: "text-rides",
    hoverColor: "hover:text-rides",
    description: "Get where you need to go",
    mainAction: {
      label: "Book a Ride",
      href: "/ride",
    },
    sections: [
      {
        title: "Ride Options",
        items: [
          { icon: Car, label: "Economy", description: "Affordable everyday rides", href: "/ride?type=economy", color: "text-rides" },
          { icon: Car, label: "Comfort", description: "Extra legroom & amenities", href: "/ride?type=comfort", color: "text-rides" },
          { icon: Car, label: "Premium", description: "Luxury vehicles & top drivers", href: "/ride?type=premium", color: "text-rides" },
          { icon: Users, label: "XL", description: "Rides for groups up to 6", href: "/ride?type=xl", color: "text-rides" },
        ],
      },
      {
        title: "More Services",
        items: [
          { icon: Briefcase, label: "Business", description: "Corporate travel solutions", href: "/ride?business=true", color: "text-muted-foreground" },
          { icon: Clock, label: "Schedule Ahead", description: "Book rides in advance", href: "/ride?schedule=true", color: "text-muted-foreground" },
          { icon: MapPin, label: "Hourly Rental", description: "Driver by the hour", href: "/ride?hourly=true", color: "text-muted-foreground" },
          { icon: Package, label: "Package Delivery", description: "Send packages across town", href: "/package-delivery", color: "text-eats", badge: "New" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Rider Terms", description: "Terms of service for riders", href: "/terms-of-service#riders" },
      { icon: ShieldCheck, label: "Safety Center", description: "Your safety is our priority", href: "/help#safety" },
      { icon: HelpCircle, label: "Ride FAQ", description: "Common questions answered", href: "/help#rides" },
      { icon: DollarSign, label: "Pricing", description: "Transparent fare breakdown", href: "/help#pricing" },
    ],
  },
  {
    id: "eats",
    label: "Eats",
    icon: UtensilsCrossed,
    color: "text-eats",
    hoverColor: "hover:text-eats",
    description: "Food delivered to your door",
    mainAction: {
      label: "Order Food",
      href: "/food",
    },
    sections: [
      {
        title: "Browse By",
        items: [
          { icon: Utensils, label: "Restaurants", description: "Full menus from local spots", href: "/food", color: "text-eats" },
          { icon: Coffee, label: "Coffee & Tea", description: "Your morning favorites", href: "/food?category=coffee", color: "text-eats" },
          { icon: Wine, label: "Alcohol", description: "Beer, wine & spirits", href: "/food?category=alcohol", color: "text-eats" },
          { icon: Package, label: "Grocery", description: "Essentials delivered fast", href: "/food?category=grocery", color: "text-eats" },
        ],
      },
      {
        title: "Partner With Us",
        items: [
          { icon: Building2, label: "Add Your Restaurant", description: "Grow your business with ZIVO", href: "/restaurant-registration", color: "text-muted-foreground" },
          { icon: Truck, label: "Become a Courier", description: "Flexible delivery earnings", href: "/drive", color: "text-muted-foreground" },
          { icon: Star, label: "Top Rated", description: "Highest rated restaurants", href: "/food?sort=rating", color: "text-muted-foreground" },
          { icon: Zap, label: "Fast Delivery", description: "Under 30 minute delivery", href: "/food?filter=fast", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Eats Terms", description: "Food delivery policies", href: "/terms-of-service#eats" },
      { icon: ShieldCheck, label: "Food Safety", description: "Quality & hygiene standards", href: "/help#food-safety" },
      { icon: HelpCircle, label: "Eats FAQ", description: "Order & delivery help", href: "/help#eats" },
      { icon: DollarSign, label: "Fees & Pricing", description: "Delivery fees explained", href: "/help#eats-pricing" },
    ],
  },
  {
    id: "flights",
    label: "Flights",
    icon: Plane,
    color: "text-sky-500",
    hoverColor: "hover:text-sky-500",
    description: "Book flights worldwide",
    mainAction: {
      label: "Search Flights",
      href: "/book-flight",
    },
    sections: [
      {
        title: "Flight Options",
        items: [
          { icon: Plane, label: "Economy", description: "Best value fares", href: "/book-flight?class=economy", color: "text-sky-500" },
          { icon: Plane, label: "Business", description: "Premium comfort & service", href: "/book-flight?class=business", color: "text-sky-500" },
          { icon: Plane, label: "First Class", description: "Ultimate luxury travel", href: "/book-flight?class=first", color: "text-sky-500" },
          { icon: Globe, label: "Multi-city", description: "Complex itineraries made easy", href: "/book-flight?type=multi", color: "text-sky-500" },
        ],
      },
      {
        title: "Travel Extras",
        items: [
          { icon: Shield, label: "Travel Insurance", description: "Protect your trip", href: "/travel-insurance", color: "text-primary", badge: "New" },
          { icon: Train, label: "Bus & Train", description: "Ground transportation", href: "/ground-transport", color: "text-amber-500", badge: "New" },
          { icon: Ticket, label: "Event Tickets", description: "Concerts, sports & more", href: "/events", color: "text-pink-500", badge: "New" },
          { icon: Car, label: "Airport Transfer", description: "Seamless pickup & drop", href: "/ride?airport=true", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Flight booking policies", href: "/terms-of-service#flights" },
      { icon: Scale, label: "Cancellation Policy", description: "Refunds & changes", href: "/refund-policy#flights" },
      { icon: HelpCircle, label: "Flight FAQ", description: "Booking & travel help", href: "/help#flights" },
      { icon: DollarSign, label: "Price Guarantee", description: "Best price promise", href: "/help#flight-pricing" },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    color: "text-amber-500",
    hoverColor: "hover:text-amber-500",
    description: "Find your perfect stay",
    mainAction: {
      label: "Search Hotels",
      href: "/book-hotel",
    },
    sections: [
      {
        title: "Stay Types",
        items: [
          { icon: Hotel, label: "Hotels", description: "Verified quality stays", href: "/book-hotel", color: "text-amber-500" },
          { icon: Building2, label: "Apartments", description: "Home away from home", href: "/book-hotel?type=apartment", color: "text-amber-500" },
          { icon: Bed, label: "Boutique", description: "Unique local experiences", href: "/book-hotel?type=boutique", color: "text-amber-500" },
          { icon: Star, label: "Luxury", description: "5-star premium properties", href: "/book-hotel?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Plan Your Trip",
        items: [
          { icon: Heart, label: "Saved", description: "Your wishlist properties", href: "/dashboard?tab=hotels", color: "text-muted-foreground" },
          { icon: CreditCard, label: "Rewards", description: "Earn points on stays", href: "/promotions", color: "text-muted-foreground" },
          { icon: Users, label: "Group Stays", description: "Book for teams & events", href: "/book-hotel?group=true", color: "text-muted-foreground" },
          { icon: MessageCircle, label: "24/7 Support", description: "We're here to help", href: "/help", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Hotel reservation policies", href: "/terms-of-service#hotels" },
      { icon: Scale, label: "Cancellation", description: "Free cancellation options", href: "/refund-policy#hotels" },
      { icon: HelpCircle, label: "Hotel FAQ", description: "Check-in & stay help", href: "/help#hotels" },
      { icon: DollarSign, label: "Price Match", description: "Best rate guarantee", href: "/help#hotel-pricing" },
    ],
  },
  {
    id: "car-rental",
    label: "Car Rental",
    icon: Car,
    color: "text-primary",
    hoverColor: "hover:text-primary",
    description: "Rent vehicles your way",
    mainAction: {
      label: "Rent a Car",
      href: "/rent-car",
    },
    sections: [
      {
        title: "Vehicle Types",
        items: [
          { icon: Car, label: "Economy", description: "Budget-friendly options", href: "/rent-car?type=economy", color: "text-primary" },
          { icon: Car, label: "SUV", description: "Space for the whole family", href: "/rent-car?type=suv", color: "text-primary" },
          { icon: Car, label: "Luxury", description: "Premium driving experience", href: "/rent-car?type=luxury", color: "text-primary" },
          { icon: Zap, label: "Electric", description: "Eco-friendly EVs", href: "/rent-car?type=electric", color: "text-primary" },
        ],
      },
      {
        title: "Rental Options",
        items: [
          { icon: Clock, label: "Hourly", description: "Pay by the hour", href: "/rent-car?duration=hourly", color: "text-muted-foreground" },
          { icon: Calendar, label: "Weekly", description: "Save on longer rentals", href: "/rent-car?duration=weekly", color: "text-muted-foreground" },
          { icon: Shield, label: "Insurance", description: "Full coverage options", href: "/insurance", color: "text-muted-foreground" },
          { icon: MapPin, label: "One-way", description: "Drop off anywhere", href: "/rent-car?oneway=true", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Rental Terms", description: "Rental agreement details", href: "/terms-of-service#rentals" },
      { icon: Shield, label: "Insurance Policy", description: "Coverage & claims", href: "/insurance" },
      { icon: HelpCircle, label: "Rental FAQ", description: "Pickup & return help", href: "/help#rentals" },
      { icon: DollarSign, label: "Pricing", description: "Rates & deposits", href: "/help#rental-pricing" },
    ],
  },
];

// Additional services for the "More" dropdown
export const moreServicesData: MegaMenuData = {
  id: "more",
  label: "More",
  icon: Package,
  color: "text-muted-foreground",
  hoverColor: "hover:text-primary",
  description: "Explore all ZIVO services",
  mainAction: {
    label: "View All Services",
    href: "/",
  },
  sections: [
    {
      title: "New Services",
      items: [
        { icon: Package, label: "Package Delivery", description: "Send packages city-wide", href: "/package-delivery", color: "text-eats", badge: "New" },
        { icon: Train, label: "Bus & Train", description: "Ground transportation booking", href: "/ground-transport", color: "text-amber-500", badge: "New" },
        { icon: Ticket, label: "Event Tickets", description: "Concerts, sports, entertainment", href: "/events", color: "text-pink-500", badge: "New" },
        { icon: Shield, label: "Travel Insurance", description: "Comprehensive trip protection", href: "/travel-insurance", color: "text-primary", badge: "New" },
      ],
    },
    {
      title: "Partner Programs",
      items: [
        { icon: Car, label: "Drive with ZIVO", description: "Earn on your schedule", href: "/drive", color: "text-rides" },
        { icon: UtensilsCrossed, label: "Restaurant Partner", description: "Add your restaurant", href: "/restaurant-registration", color: "text-eats" },
        { icon: Briefcase, label: "Business Solutions", description: "Corporate travel management", href: "/partner-agreement", color: "text-muted-foreground" },
        { icon: Globe, label: "Affiliate Program", description: "Earn by referring", href: "/partner-agreement#affiliate", color: "text-muted-foreground" },
      ],
    },
  ],
  policies: [
    { icon: FileText, label: "Terms of Service", description: "Platform usage terms", href: "/terms-of-service" },
    { icon: ShieldCheck, label: "Privacy Policy", description: "How we protect your data", href: "/privacy-policy" },
    { icon: Users, label: "Community Guidelines", description: "Standards for all users", href: "/community-guidelines" },
    { icon: Phone, label: "Contact Support", description: "Get help 24/7", href: "/help" },
  ],
};

// Import Calendar for car rental section
import { Calendar } from "lucide-react";

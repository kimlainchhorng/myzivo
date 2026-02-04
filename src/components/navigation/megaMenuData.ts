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
  Scale,
  MessageCircle,
  Building2,
  Bed,
  Utensils,
  Coffee,
  Wine,
  Truck,
  Calendar,
  LucideIcon,
  Sparkles,
  Crown,
  Compass,
  Wallet,
  Award,
  Gift,
  Luggage,
  BadgePercent,
  Timer,
  Fuel,
  Key,
  Settings,
  Navigation,
  Mountain,
  Palmtree,
  Sunrise,
  Waves,
  Landmark,
  TrendingUp,
  Bell,
  Headphones,
  CheckCircle,
  Percent,
  Receipt,
  CircleDollarSign,
  Armchair,
  Wifi,
  UtensilsCrossed as Meal,
  Monitor,
  BaggageClaim,
  PlaneTakeoff,
  PlaneLanding,
  Route,
  Building,
  TreePine,
  Snowflake,
  Sun,
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
    id: "flights",
    label: "Flights",
    icon: Plane,
    color: "text-sky-500",
    hoverColor: "hover:text-sky-500",
    description: "Compare 500+ airlines worldwide",
    mainAction: {
      label: "Compare Flights",
      href: "/flights",
    },
    sections: [
      {
        title: "Cabin Classes",
        items: [
          { icon: Armchair, label: "Economy", description: "Compare value fares", href: "/flights?class=economy", color: "text-sky-500" },
          { icon: Sparkles, label: "Premium Economy", description: "Extra space options", href: "/flights?class=premium-economy", color: "text-sky-500" },
          { icon: Crown, label: "Business Class", description: "Lie-flat seat options", href: "/flights?class=business", color: "text-amber-500" },
          { icon: Star, label: "First Class", description: "Premium cabin options", href: "/flights?class=first", color: "text-amber-500" },
        ],
      },
      {
        title: "Flight Types",
        items: [
          { icon: Route, label: "Round Trip", description: "Depart and return", href: "/flights?type=round", color: "text-sky-500" },
          { icon: PlaneTakeoff, label: "One Way", description: "Single direction", href: "/flights?type=oneway", color: "text-sky-500" },
          { icon: Globe, label: "Multi-City", description: "Multiple stops", href: "/flights?type=multi", color: "text-sky-500" },
          { icon: Compass, label: "Explore Anywhere", description: "Flexible search", href: "/flights?explore=true", color: "text-primary", badge: "New" },
        ],
      },
      {
        title: "Travel Extras",
        items: [
          { icon: Shield, label: "Travel Insurance", description: "Partner coverage options", href: "/travel-insurance", color: "text-emerald-500" },
          { icon: BaggageClaim, label: "Extra Baggage", description: "Airline baggage info", href: "/flights?addon=baggage", color: "text-sky-500" },
          { icon: Car, label: "Airport Transfer", description: "Compare transfer options", href: "/extras", color: "text-primary" },
          { icon: Hotel, label: "Hotels + Flights", description: "Search bundles", href: "/flights?bundle=hotel", color: "text-amber-500" },
        ],
      },
      {
        title: "Tools & Alerts",
        items: [
          { icon: BadgePercent, label: "Deal Finder", description: "Search current deals", href: "/flights?deals=flash", color: "text-rose-500" },
          { icon: TrendingUp, label: "Price Alerts", description: "Track price changes", href: "/profile?tab=alerts", color: "text-sky-500" },
          { icon: Heart, label: "Saved Searches", description: "Your saved trips", href: "/profile?tab=saved", color: "text-pink-500" },
          { icon: Gift, label: "Gift Cards", description: "Partner gift options", href: "/promotions?type=giftcard", color: "text-pink-500" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Partner booking policies", href: "/terms-of-service#flights" },
      { icon: Scale, label: "Cancellation Info", description: "Airline cancellation rules", href: "/refund-policy#flights" },
      { icon: HelpCircle, label: "Flight FAQ", description: "Search & booking help", href: "/help#flights" },
      { icon: Headphones, label: "Support", description: "Site support available", href: "/help" },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    color: "text-amber-500",
    hoverColor: "hover:text-amber-500",
    description: "Compare 500,000+ properties",
    mainAction: {
      label: "Compare Hotels",
      href: "/hotels",
    },
    sections: [
      {
        title: "Stay Types",
        items: [
          { icon: Hotel, label: "Hotels", description: "Compare verified stays", href: "/hotels", color: "text-amber-500" },
          { icon: Building2, label: "Apartments", description: "Extended stay options", href: "/hotels?type=apartment", color: "text-amber-500" },
          { icon: TreePine, label: "Resorts", description: "All-inclusive options", href: "/hotels?type=resort", color: "text-emerald-500" },
          { icon: Crown, label: "Luxury", description: "5-star properties", href: "/hotels?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Unique Stays",
        items: [
          { icon: Bed, label: "Boutique Hotels", description: "Local character stays", href: "/hotels?type=boutique", color: "text-pink-500" },
          { icon: Mountain, label: "Villas & Cabins", description: "Private retreats", href: "/hotels?type=villa", color: "text-emerald-500" },
          { icon: Waves, label: "Beach Resorts", description: "Oceanfront options", href: "/hotels?type=beach", color: "text-sky-500" },
          { icon: Building, label: "City Center", description: "Central locations", href: "/hotels?location=city", color: "text-amber-500" },
        ],
      },
      {
        title: "Popular Destinations",
        items: [
          { icon: Landmark, label: "New York", description: "Compare NYC hotels", href: "/hotels?city=new-york", color: "text-sky-500" },
          { icon: Palmtree, label: "Miami", description: "Beach & city stays", href: "/hotels?city=miami", color: "text-emerald-500" },
          { icon: Sunrise, label: "Los Angeles", description: "LA accommodations", href: "/hotels?city=los-angeles", color: "text-orange-500" },
          { icon: Sun, label: "Las Vegas", description: "Vegas hotel deals", href: "/hotels?city=las-vegas", color: "text-amber-500" },
        ],
      },
      {
        title: "Tools & Savings",
        items: [
          { icon: BadgePercent, label: "Last Minute Deals", description: "Search tonight's rates", href: "/hotels?deals=lastminute", color: "text-rose-500" },
          { icon: Heart, label: "Saved Hotels", description: "Your wishlist", href: "/profile?tab=saved", color: "text-pink-500" },
          { icon: Users, label: "Group Bookings", description: "Multi-room search", href: "/hotels?group=true", color: "text-muted-foreground" },
          { icon: TrendingUp, label: "Price Alerts", description: "Track rate changes", href: "/profile?tab=alerts", color: "text-sky-500" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Partner reservation policies", href: "/terms-of-service#hotels" },
      { icon: Scale, label: "Cancellation Info", description: "Property cancellation rules", href: "/refund-policy#hotels" },
      { icon: HelpCircle, label: "Hotel FAQ", description: "Check-in & stay help", href: "/help#hotels" },
      { icon: Headphones, label: "Support", description: "Site support available", href: "/help" },
    ],
  },
  {
    id: "car-rental",
    label: "Car Rental",
    icon: Car,
    color: "text-primary",
    hoverColor: "hover:text-primary",
    description: "Compare 800+ rental locations",
    mainAction: {
      label: "Compare Cars",
      href: "/rent-car",
    },
    sections: [
      {
        title: "Vehicle Categories",
        items: [
          { icon: Car, label: "Economy", description: "Budget-friendly options", href: "/rent-car?type=economy", color: "text-primary" },
          { icon: Car, label: "Compact", description: "City driving options", href: "/rent-car?type=compact", color: "text-primary" },
          { icon: Car, label: "SUV & Crossover", description: "Space for groups", href: "/rent-car?type=suv", color: "text-primary" },
          { icon: Crown, label: "Luxury & Premium", description: "Premium vehicles", href: "/rent-car?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Specialty Vehicles",
        items: [
          { icon: Zap, label: "Electric & Hybrid", description: "Eco-friendly options", href: "/rent-car?type=electric", color: "text-emerald-500", badge: "Green" },
          { icon: Car, label: "Sports Cars", description: "Performance vehicles", href: "/rent-car?type=sports", color: "text-rose-500" },
          { icon: Car, label: "Convertibles", description: "Open-air vehicles", href: "/rent-car?type=convertible", color: "text-sky-500" },
          { icon: Truck, label: "Vans & Trucks", description: "Cargo options", href: "/rent-car?type=van", color: "text-muted-foreground" },
        ],
      },
      {
        title: "Rental Options",
        items: [
          { icon: Timer, label: "Hourly Rental", description: "Short-term options", href: "/rent-car?duration=hourly", color: "text-primary" },
          { icon: Calendar, label: "Weekly Deals", description: "Extended rentals", href: "/rent-car?duration=weekly", color: "text-primary" },
          { icon: Navigation, label: "One-Way Rental", description: "Flexible drop-off", href: "/rent-car?oneway=true", color: "text-sky-500" },
          { icon: MapPin, label: "Airport Pickup", description: "Airport locations", href: "/rent-car?location=airport", color: "text-primary" },
        ],
      },
      {
        title: "Protection & Extras",
        items: [
          { icon: Shield, label: "Insurance Options", description: "Partner coverage plans", href: "/rent-car?addon=insurance", color: "text-emerald-500" },
          { icon: Fuel, label: "Prepaid Fuel", description: "Optional fuel plans", href: "/rent-car?addon=fuel", color: "text-amber-500" },
          { icon: Settings, label: "GPS Navigation", description: "Add-on available", href: "/rent-car?addon=gps", color: "text-sky-500" },
          { icon: Key, label: "Additional Driver", description: "Partner add-on", href: "/rent-car?addon=driver", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Rental Terms", description: "Partner rental agreements", href: "/terms-of-service#rentals" },
      { icon: Shield, label: "Insurance Info", description: "Partner coverage options", href: "/insurance" },
      { icon: HelpCircle, label: "Rental FAQ", description: "Pickup & return help", href: "/help#rentals" },
      { icon: Headphones, label: "Support", description: "Site support available", href: "/help" },
    ],
  },
  {
    id: "help",
    label: "Help",
    icon: HelpCircle,
    color: "text-muted-foreground",
    hoverColor: "hover:text-primary",
    description: "Get support and assistance",
    mainAction: {
      label: "Help Center",
      href: "/help",
    },
    sections: [
      {
        title: "Support",
        items: [
          { icon: HelpCircle, label: "Help Center", description: "FAQs & guides", href: "/help", color: "text-primary" },
          { icon: Phone, label: "Contact Us", description: "Customer support", href: "/contact", color: "text-primary" },
          { icon: MessageCircle, label: "Travel Bookings", description: "Partner booking help", href: "/support/travel-bookings", color: "text-sky-500" },
          { icon: Globe, label: "Site Issues", description: "Technical support", href: "/support/site-issues", color: "text-muted-foreground" },
        ],
      },
      {
        title: "Company",
        items: [
          { icon: Globe, label: "About ZIVO", description: "Our story", href: "/about", color: "text-primary" },
          { icon: Compass, label: "How It Works", description: "Search & compare", href: "/how-it-works", color: "text-primary" },
          { icon: Users, label: "Partners", description: "Travel providers", href: "/partners", color: "text-primary" },
          { icon: FileText, label: "Legal & Policies", description: "Terms & privacy", href: "/terms", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Terms of Service", description: "Platform usage terms", href: "/terms" },
      { icon: ShieldCheck, label: "Privacy Policy", description: "Data protection", href: "/privacy" },
      { icon: CircleDollarSign, label: "Partner Disclosure", description: "How we work with partners", href: "/partner-disclosure" },
    ],
  },
];

// ZIVO More dropdown - links to external ZIVO Driver services
export const moreServicesData: MegaMenuData = {
  id: "more",
  label: "Rides · Eats · Move",
  icon: Package,
  color: "text-rides",
  hoverColor: "hover:text-rides",
  description: "Local services via ZIVO Driver",
  mainAction: {
    label: "Open ZIVO Driver",
    href: "https://zivodriver.com",
  },
  sections: [
    {
      title: "ZIVO Driver Services",
      items: [
        { icon: Car, label: "ZIVO Rides", description: "Request local rides", href: "https://zivodriver.com/rides", color: "text-rides", badge: "External" },
        { icon: UtensilsCrossed, label: "ZIVO Eats", description: "Order from restaurants", href: "https://zivodriver.com/eats", color: "text-eats", badge: "External" },
        { icon: Package, label: "ZIVO Move", description: "Package & courier delivery", href: "https://zivodriver.com/move", color: "text-primary", badge: "External" },
      ],
    },
    {
      title: "For Drivers",
      items: [
        { icon: Car, label: "Become a Driver", description: "Earn on ZIVO Driver", href: "https://zivodriver.com/drive", color: "text-rides", badge: "External" },
      ],
    },
  ],
  policies: [
    { icon: HelpCircle, label: "Driver Support", description: "Independent driver services", href: "https://zivodriver.com/help" },
  ],
};

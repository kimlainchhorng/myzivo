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
    description: "Search 500+ airlines worldwide",
    mainAction: {
      label: "Search Flights",
      href: "/book-flight",
    },
    sections: [
      {
        title: "Cabin Classes",
        items: [
          { icon: Armchair, label: "Economy", description: "Best value fares worldwide", href: "/book-flight?class=economy", color: "text-sky-500" },
          { icon: Sparkles, label: "Premium Economy", description: "Extra space & comfort", href: "/book-flight?class=premium-economy", color: "text-sky-500" },
          { icon: Crown, label: "Business Class", description: "Lie-flat seats & priority", href: "/book-flight?class=business", color: "text-amber-500" },
          { icon: Star, label: "First Class", description: "Ultimate luxury experience", href: "/book-flight?class=first", color: "text-amber-500" },
        ],
      },
      {
        title: "Flight Types",
        items: [
          { icon: Route, label: "Round Trip", description: "Depart and return flights", href: "/book-flight?type=round", color: "text-sky-500" },
          { icon: PlaneTakeoff, label: "One Way", description: "Single direction booking", href: "/book-flight?type=oneway", color: "text-sky-500" },
          { icon: Globe, label: "Multi-City", description: "Multiple destinations", href: "/book-flight?type=multi", color: "text-sky-500" },
          { icon: Compass, label: "Explore Anywhere", description: "Flexible destination search", href: "/book-flight?explore=true", color: "text-primary", badge: "New" },
        ],
      },
      {
        title: "Travel Extras",
        items: [
          { icon: Shield, label: "Travel Insurance", description: "Protect your trip", href: "/travel-insurance", color: "text-emerald-500", badge: "Popular" },
          { icon: BaggageClaim, label: "Extra Baggage", description: "Add checked bags", href: "/book-flight?addon=baggage", color: "text-sky-500" },
          { icon: Car, label: "Airport Transfer", description: "Seamless pickup & drop", href: "/extras", color: "text-primary" },
          { icon: Hotel, label: "Hotels + Flights", description: "Bundle & save up to 30%", href: "/book-flight?bundle=hotel", color: "text-amber-500", badge: "Save" },
        ],
      },
      {
        title: "Deals & Rewards",
        items: [
          { icon: BadgePercent, label: "Flash Sales", description: "Limited-time flight deals", href: "/book-flight?deals=flash", color: "text-rose-500", badge: "Hot" },
          { icon: TrendingUp, label: "Price Alerts", description: "Track price drops", href: "/profile?tab=alerts", color: "text-sky-500" },
          { icon: Award, label: "ZIVO Miles", description: "Earn & redeem points", href: "/profile?tab=miles", color: "text-primary" },
          { icon: Gift, label: "Gift Cards", description: "Give the gift of travel", href: "/promotions?type=giftcard", color: "text-pink-500" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Flight booking policies", href: "/terms-of-service#flights" },
      { icon: Scale, label: "Cancellation", description: "Free cancellation options", href: "/refund-policy#flights" },
      { icon: HelpCircle, label: "Flight FAQ", description: "Booking & travel help", href: "/help#flights" },
      { icon: CheckCircle, label: "Price Guarantee", description: "Best price promise", href: "/help#flight-pricing" },
      { icon: Headphones, label: "24/7 Support", description: "Always here to help", href: "/help" },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    color: "text-amber-500",
    hoverColor: "hover:text-amber-500",
    description: "500,000+ properties worldwide",
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
          { icon: TreePine, label: "Resorts", description: "All-inclusive getaways", href: "/book-hotel?type=resort", color: "text-emerald-500" },
          { icon: Crown, label: "Luxury", description: "5-star premium properties", href: "/book-hotel?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Unique Stays",
        items: [
          { icon: Bed, label: "Boutique Hotels", description: "Unique local experiences", href: "/book-hotel?type=boutique", color: "text-pink-500" },
          { icon: Mountain, label: "Villas & Cabins", description: "Private retreats", href: "/book-hotel?type=villa", color: "text-emerald-500" },
          { icon: Waves, label: "Beach Resorts", description: "Oceanfront paradise", href: "/book-hotel?type=beach", color: "text-sky-500" },
          { icon: Building, label: "City Center", description: "Heart of the action", href: "/book-hotel?location=city", color: "text-amber-500" },
        ],
      },
      {
        title: "Popular Destinations",
        items: [
          { icon: Landmark, label: "New York", description: "The city that never sleeps", href: "/book-hotel?city=new-york", color: "text-sky-500" },
          { icon: Palmtree, label: "Miami", description: "Sun, sand & nightlife", href: "/book-hotel?city=miami", color: "text-emerald-500" },
          { icon: Sunrise, label: "Los Angeles", description: "Hollywood glamour", href: "/book-hotel?city=los-angeles", color: "text-orange-500" },
          { icon: Sun, label: "Las Vegas", description: "Entertainment capital", href: "/book-hotel?city=las-vegas", color: "text-amber-500" },
        ],
      },
      {
        title: "Rewards & Savings",
        items: [
          { icon: BadgePercent, label: "Last Minute Deals", description: "Up to 60% off tonight", href: "/book-hotel?deals=lastminute", color: "text-rose-500", badge: "Hot" },
          { icon: Award, label: "Member Rewards", description: "Earn points every stay", href: "/profile?tab=rewards", color: "text-primary" },
          { icon: Heart, label: "Saved Hotels", description: "Your wishlist", href: "/profile?tab=saved", color: "text-pink-500" },
          { icon: Users, label: "Group Bookings", description: "10+ rooms discounts", href: "/book-hotel?group=true", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Terms", description: "Hotel reservation policies", href: "/terms-of-service#hotels" },
      { icon: Scale, label: "Free Cancellation", description: "Flexible booking options", href: "/refund-policy#hotels" },
      { icon: HelpCircle, label: "Hotel FAQ", description: "Check-in & stay help", href: "/help#hotels" },
      { icon: CheckCircle, label: "Price Match", description: "Best rate guarantee", href: "/help#hotel-pricing" },
      { icon: Headphones, label: "Concierge", description: "24/7 guest support", href: "/help" },
    ],
  },
  {
    id: "car-rental",
    label: "Car Rental",
    icon: Car,
    color: "text-primary",
    hoverColor: "hover:text-primary",
    description: "Rent from 800+ locations worldwide",
    mainAction: {
      label: "Rent a Car",
      href: "/rent-car",
    },
    sections: [
      {
        title: "Vehicle Categories",
        items: [
          { icon: Car, label: "Economy", description: "Budget-friendly options", href: "/rent-car?type=economy", color: "text-primary" },
          { icon: Car, label: "Compact", description: "Perfect for city driving", href: "/rent-car?type=compact", color: "text-primary" },
          { icon: Car, label: "SUV & Crossover", description: "Space for adventure", href: "/rent-car?type=suv", color: "text-primary" },
          { icon: Crown, label: "Luxury & Premium", description: "Travel in style", href: "/rent-car?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Specialty Vehicles",
        items: [
          { icon: Zap, label: "Electric & Hybrid", description: "Eco-friendly driving", href: "/rent-car?type=electric", color: "text-emerald-500", badge: "Green" },
          { icon: Car, label: "Sports Cars", description: "Performance & thrills", href: "/rent-car?type=sports", color: "text-rose-500" },
          { icon: Car, label: "Convertibles", description: "Open-air experience", href: "/rent-car?type=convertible", color: "text-sky-500" },
          { icon: Truck, label: "Vans & Trucks", description: "Moving & cargo needs", href: "/rent-car?type=van", color: "text-muted-foreground" },
        ],
      },
      {
        title: "Rental Options",
        items: [
          { icon: Timer, label: "Hourly Rental", description: "Pay by the hour", href: "/rent-car?duration=hourly", color: "text-primary" },
          { icon: Calendar, label: "Weekly Deals", description: "Save on 7+ days", href: "/rent-car?duration=weekly", color: "text-primary", badge: "Save" },
          { icon: Navigation, label: "One-Way Rental", description: "Drop off anywhere", href: "/rent-car?oneway=true", color: "text-sky-500" },
          { icon: MapPin, label: "Airport Pickup", description: "Convenient locations", href: "/rent-car?location=airport", color: "text-primary" },
        ],
      },
      {
        title: "Protection & Extras",
        items: [
          { icon: Shield, label: "Full Insurance", description: "Complete coverage", href: "/rent-car?addon=insurance", color: "text-emerald-500" },
          { icon: Fuel, label: "Prepaid Fuel", description: "Skip the gas station", href: "/rent-car?addon=fuel", color: "text-amber-500" },
          { icon: Settings, label: "GPS Navigation", description: "Never get lost", href: "/rent-car?addon=gps", color: "text-sky-500" },
          { icon: Key, label: "Additional Driver", description: "Share the driving", href: "/rent-car?addon=driver", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Rental Terms", description: "Rental agreement details", href: "/terms-of-service#rentals" },
      { icon: Shield, label: "Insurance Info", description: "Coverage & claims", href: "/insurance" },
      { icon: HelpCircle, label: "Rental FAQ", description: "Pickup & return help", href: "/help#rentals" },
      { icon: Receipt, label: "Pricing", description: "Rates & deposits", href: "/help#rental-pricing" },
      { icon: Headphones, label: "Roadside Help", description: "24/7 assistance", href: "/help" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    icon: Sparkles,
    color: "text-violet-500",
    hoverColor: "hover:text-violet-500",
    description: "Enhance your travel experience",
    mainAction: {
      label: "Explore Extras",
      href: "/extras",
    },
    sections: [
      {
        title: "Travel Services",
        items: [
          { icon: Car, label: "Airport Transfers", description: "Seamless pickup & drop", href: "/extras", color: "text-primary" },
          { icon: Ticket, label: "Activities & Tours", description: "Experiences worldwide", href: "/things-to-do", color: "text-pink-500" },
          { icon: Wifi, label: "Travel eSIM", description: "Stay connected abroad", href: "/extras", color: "text-sky-500" },
          { icon: Luggage, label: "Luggage Storage", description: "Store bags anywhere", href: "/extras", color: "text-amber-500" },
        ],
      },
      {
        title: "Protection",
        items: [
          { icon: Shield, label: "Travel Insurance", description: "Comprehensive coverage", href: "/travel-insurance", color: "text-emerald-500" },
          { icon: PlaneLanding, label: "Flight Delay Claim", description: "Get compensation", href: "/extras", color: "text-sky-500" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Terms", description: "Service terms", href: "/terms" },
      { icon: HelpCircle, label: "Help", description: "Get support", href: "/help" },
    ],
  },
];

// ZIVO More dropdown - includes future services and company pages
export const moreServicesData: MegaMenuData = {
  id: "more",
  label: "ZIVO More",
  icon: Package,
  color: "text-muted-foreground",
  hoverColor: "hover:text-primary",
  description: "Explore all ZIVO services",
  mainAction: {
    label: "Explore ZIVO",
    href: "/",
  },
  sections: [
    {
      title: "ZIVO Services",
      items: [
        { icon: Car, label: "ZIVO Rides", description: "Request a ride in your area", href: "/rides", color: "text-primary" },
        { icon: UtensilsCrossed, label: "ZIVO Eats", description: "Order food from local restaurants", href: "/eats", color: "text-eats" },
      ],
    },
    {
      title: "Company",
      items: [
        { icon: Globe, label: "About ZIVO", description: "Our story and mission", href: "/about", color: "text-primary" },
        { icon: Compass, label: "How It Works", description: "Search, compare, book", href: "/how-it-works", color: "text-primary" },
        { icon: Users, label: "Partners", description: "Our travel partners", href: "/partners", color: "text-primary" },
        { icon: Phone, label: "Contact", description: "Get in touch", href: "/contact", color: "text-primary" },
      ],
    },
  ],
  policies: [
    { icon: FileText, label: "Terms of Service", description: "Platform usage terms", href: "/terms" },
    { icon: ShieldCheck, label: "Privacy Policy", description: "How we protect your data", href: "/privacy" },
    { icon: CircleDollarSign, label: "Affiliate Disclosure", description: "Commission transparency", href: "/affiliate-disclosure" },
    { icon: Headphones, label: "Help Center", description: "24/7 support", href: "/help" },
  ],
};

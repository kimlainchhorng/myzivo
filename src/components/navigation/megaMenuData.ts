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
    description: "Compare flights from 500+ airlines worldwide",
    mainAction: {
      label: "Compare Flights",
      href: "/flights",
    },
    sections: [
      {
        title: "Cabin Classes",
        items: [
          { icon: Armchair, label: "Economy", description: "Best value fares", href: "/flights?class=economy", color: "text-sky-500" },
          { icon: Sparkles, label: "Premium Economy", description: "Extra comfort & legroom", href: "/flights?class=premium-economy", color: "text-sky-500" },
          { icon: Crown, label: "Business Class", description: "Priority & comfort", href: "/flights?class=business", color: "text-amber-500" },
          { icon: Star, label: "First Class", description: "Premium travel experience", href: "/flights?class=first", color: "text-amber-500" },
        ],
      },
      {
        title: "Flight Types",
        items: [
          { icon: Route, label: "Round Trip", description: "Depart and return", href: "/flights?type=round", color: "text-sky-500" },
          { icon: PlaneTakeoff, label: "One Way", description: "Single destination", href: "/flights?type=oneway", color: "text-sky-500" },
          { icon: Globe, label: "Multi-City", description: "Multiple destinations", href: "/flights?type=multi", color: "text-sky-500" },
          { icon: Compass, label: "Explore Anywhere", description: "Flexible travel ideas", href: "/flights?explore=true", color: "text-primary" },
        ],
      },
      {
        title: "Travel Extras",
        items: [
          { icon: Shield, label: "Travel Insurance", description: "Provided by partners", href: "/travel-insurance", color: "text-emerald-500" },
          { icon: BaggageClaim, label: "Extra Baggage", description: "Airline-dependent", href: "/flights?addon=baggage", color: "text-sky-500" },
          { icon: Car, label: "Airport Transfers", description: "Partner services", href: "/extras", color: "text-primary" },
          { icon: Hotel, label: "Hotels & Stays", description: "Compare accommodation options", href: "/hotels", color: "text-amber-500" },
        ],
      },
      {
        title: "Deals & Tools",
        items: [
          { icon: BadgePercent, label: "Flash Deals", description: "Limited-time partner offers", href: "/flights?deals=flash", color: "text-rose-500" },
          { icon: TrendingUp, label: "Price Alerts", description: "Track price changes", href: "/profile?tab=alerts", color: "text-sky-500" },
          { icon: Compass, label: "Fare Insights", description: "When to book & save", href: "/flights?insights=true", color: "text-primary" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Notice", description: "Flight bookings are completed with licensed travel partners. Prices may change until booking is completed.", href: "/partner-disclosure" },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    color: "text-amber-500",
    hoverColor: "hover:text-amber-500",
    description: "Compare 500,000+ properties worldwide",
    mainAction: {
      label: "Compare Hotels",
      href: "/hotels",
    },
    sections: [
      {
        title: "Stay Types",
        items: [
          { icon: Hotel, label: "Hotels", description: "Verified partner properties", href: "/hotels", color: "text-amber-500" },
          { icon: Building2, label: "Apartments", description: "Home-style stays", href: "/hotels?type=apartment", color: "text-amber-500" },
          { icon: TreePine, label: "Resorts", description: "All-inclusive options", href: "/hotels?type=resort", color: "text-emerald-500" },
          { icon: Crown, label: "Luxury", description: "Premium accommodations", href: "/hotels?type=luxury", color: "text-amber-500" },
        ],
      },
      {
        title: "Unique Stays",
        items: [
          { icon: Bed, label: "Boutique Hotels", description: "Unique character stays", href: "/hotels?type=boutique", color: "text-pink-500" },
          { icon: Mountain, label: "Villas & Cabins", description: "Private retreats", href: "/hotels?type=villa", color: "text-emerald-500" },
          { icon: Waves, label: "Beach Resorts", description: "Oceanfront options", href: "/hotels?type=beach", color: "text-sky-500" },
          { icon: Building, label: "City Center Hotels", description: "Central locations", href: "/hotels?location=city", color: "text-amber-500" },
        ],
      },
      {
        title: "Popular Destinations",
        items: [
          { icon: Landmark, label: "New York", description: "Compare NYC hotels", href: "/hotels?city=new-york", color: "text-sky-500" },
          { icon: Palmtree, label: "Miami", description: "Beach & city stays", href: "/hotels?city=miami", color: "text-emerald-500" },
          { icon: Sunrise, label: "Los Angeles", description: "LA accommodations", href: "/hotels?city=los-angeles", color: "text-orange-500" },
          { icon: Sun, label: "Las Vegas", description: "Vegas hotel options", href: "/hotels?city=las-vegas", color: "text-amber-500" },
        ],
      },
      {
        title: "Tools & Savings",
        items: [
          { icon: BadgePercent, label: "Last-Minute Deals", description: "Partner offers", href: "/hotels?deals=lastminute", color: "text-rose-500" },
          { icon: Heart, label: "Saved Hotels", description: "Wishlist", href: "/profile?tab=saved", color: "text-pink-500" },
          { icon: Users, label: "Group Bookings", description: "Partner discounts", href: "/hotels?group=true", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Notice", description: "Hotel bookings are completed with licensed accommodation partners.", href: "/partner-disclosure" },
    ],
  },
  {
    id: "car-rental",
    label: "Car Rental",
    icon: Car,
    color: "text-primary",
    hoverColor: "hover:text-primary",
    description: "Rent cars from 800+ locations worldwide",
    mainAction: {
      label: "Compare Car Rentals",
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
          { icon: Zap, label: "Electric Vehicles", description: "Eco-friendly options", href: "/rent-car?type=electric", color: "text-emerald-500" },
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
          { icon: Shield, label: "Insurance Options", description: "Offered by partners", href: "/rent-car?addon=insurance", color: "text-emerald-500" },
          { icon: Fuel, label: "Prepaid Fuel", description: "Optional", href: "/rent-car?addon=fuel", color: "text-amber-500" },
          { icon: Settings, label: "GPS Navigation", description: "Add-on available", href: "/rent-car?addon=gps", color: "text-sky-500" },
          { icon: Key, label: "Additional Driver", description: "Partner add-on", href: "/rent-car?addon=driver", color: "text-muted-foreground" },
        ],
      },
    ],
    policies: [
      { icon: FileText, label: "Booking Notice", description: "Car rentals are provided by licensed rental partners.", href: "/partner-disclosure" },
    ],
  },
  {
    id: "help",
    label: "Help",
    icon: HelpCircle,
    color: "text-muted-foreground",
    hoverColor: "hover:text-primary",
    description: "ZIVO Help Center",
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
          { icon: MessageCircle, label: "Travel Bookings", description: "Partner booking assistance", href: "/support/travel-bookings", color: "text-sky-500" },
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
      { icon: FileText, label: "Booking Help", description: "ZIVO compares prices and redirects users to trusted partners. For changes, cancellations, or refunds, please contact the booking provider directly.", href: "/partner-disclosure" },
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
  description: "Local services powered by ZIVO Driver",
  mainAction: {
    label: "Open ZIVO Driver",
    href: "https://zivodriver.com",
  },
  sections: [
    {
      title: "Services",
      items: [
        { icon: Car, label: "ZIVO Rides", description: "Request local rides", href: "https://zivodriver.com/rides", color: "text-rides", badge: "External" },
        { icon: UtensilsCrossed, label: "ZIVO Eats", description: "Order food from local restaurants", href: "https://zivodriver.com/eats", color: "text-eats", badge: "External" },
        { icon: Package, label: "ZIVO Move", description: "Package and courier delivery", href: "https://zivodriver.com/move", color: "text-primary", badge: "External" },
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
    { icon: HelpCircle, label: "Legal Note", description: "Mobility services are provided by independent drivers using the ZIVO Driver platform.", href: "https://zivodriver.com/terms" },
  ],
};

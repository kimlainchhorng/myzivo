/**
 * EatsLanding - Food delivery hub page with full ordering flow
 * Premium glassmorphism style matching the ZIVO super-app
 */
import { useState, useEffect } from "react";
import { Star, Clock, ArrowRight, Truck, ShoppingCart, Search, MapPin, UtensilsCrossed, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, Package, Timer, Heart, MessageSquare, Gift, PartyPopper, Navigation, RefreshCw, Flame, Award, Sparkles, Phone, Share2, Copy, Leaf, AlertTriangle, Filter, X, ThumbsUp, Percent, History, Bookmark, ChevronRight, Users, Calendar, Bell, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEatsNotifications } from "@/hooks/useEatsNotifications";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const categories = ["All", "American", "Italian", "Asian", "Mexican", "Healthy", "Desserts", "Breakfast", "Seafood"];

const dietaryFilters = [
  { id: "vegetarian", label: "🥬 Vegetarian", icon: Leaf },
  { id: "vegan", label: "🌱 Vegan", icon: Leaf },
  { id: "gluten-free", label: "🚫 Gluten-Free", icon: AlertTriangle },
  { id: "halal", label: "☪️ Halal", icon: Award },
];

const restaurants = [
  { id: "joes-grill", name: "Joe's Grill", cuisine: "American", price: "$", rating: 4.7, time: "20-30 min", prepTime: 15, freeDelivery: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400", featured: "Classic Burger · $12.99", popular: true, dietary: ["halal"],
    menu: [
      { id: "m1", name: "Classic Burger", price: 12.99, description: "Angus beef, lettuce, tomato, special sauce", calories: 650, allergens: ["gluten", "dairy"] },
      { id: "m2", name: "Double Stack", price: 16.99, description: "Double patty with cheese and bacon", calories: 950, allergens: ["gluten", "dairy"] },
      { id: "m3", name: "Crispy Fries", price: 4.99, description: "Golden fries with sea salt", calories: 320, allergens: ["gluten"] },
      { id: "m4", name: "Milkshake", price: 6.99, description: "Vanilla, chocolate, or strawberry", calories: 480, allergens: ["dairy"] },
    ]
  },
  { id: "bella-napoli", name: "Bella Napoli", cuisine: "Italian", price: "$$", rating: 4.9, time: "25-35 min", prepTime: 20, freeDelivery: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400", featured: "Margherita Pizza · $14.99", popular: true, dietary: ["vegetarian"],
    menu: [
      { id: "m5", name: "Margherita Pizza", price: 14.99, description: "Fresh mozzarella, basil, San Marzano", calories: 780, allergens: ["gluten", "dairy"] },
      { id: "m6", name: "Pasta Carbonara", price: 16.99, description: "Guanciale, egg, pecorino", calories: 820, allergens: ["gluten", "dairy", "egg"] },
      { id: "m7", name: "Bruschetta", price: 8.99, description: "Tomato, garlic, fresh basil", calories: 280, allergens: ["gluten"] },
      { id: "m8", name: "Tiramisu", price: 9.99, description: "Classic Italian dessert", calories: 450, allergens: ["dairy", "egg", "gluten"] },
    ]
  },
  { id: "thai-palace", name: "Thai Palace", cuisine: "Asian", price: "$$", rating: 4.6, time: "20-30 min", prepTime: 18, freeDelivery: true, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=400", featured: "Pad Thai · $13.50", popular: false, dietary: ["gluten-free"],
    menu: [
      { id: "m9", name: "Pad Thai", price: 13.50, description: "Rice noodles, shrimp, peanuts", calories: 620, allergens: ["peanuts", "shellfish"] },
      { id: "m10", name: "Green Curry", price: 14.99, description: "Coconut milk, Thai basil, vegetables", calories: 550, allergens: [] },
      { id: "m11", name: "Spring Rolls", price: 7.99, description: "Crispy rolls with dipping sauce", calories: 240, allergens: ["gluten"] },
      { id: "m12", name: "Mango Sticky Rice", price: 8.99, description: "Sweet coconut sticky rice", calories: 380, allergens: [] },
    ]
  },
  { id: "el-azteca", name: "El Azteca", cuisine: "Mexican", price: "$", rating: 4.8, time: "15-25 min", prepTime: 12, freeDelivery: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400", featured: "Chicken Tacos · $10.99", popular: true, dietary: ["gluten-free"],
    menu: [
      { id: "m13", name: "Chicken Tacos", price: 10.99, description: "Three tacos with salsa verde", calories: 420, allergens: [] },
      { id: "m14", name: "Burrito Bowl", price: 12.99, description: "Rice, beans, guac, and protein", calories: 680, allergens: [] },
      { id: "m15", name: "Chips & Guac", price: 6.99, description: "Fresh guacamole with tortilla chips", calories: 350, allergens: [] },
      { id: "m16", name: "Churros", price: 5.99, description: "Cinnamon sugar with chocolate sauce", calories: 310, allergens: ["gluten", "dairy"] },
    ]
  },
  { id: "green-bowl", name: "Green Bowl", cuisine: "Healthy", price: "$$", rating: 4.5, time: "15-25 min", prepTime: 10, freeDelivery: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400", featured: "Acai Bowl · $11.99", popular: false, dietary: ["vegan", "vegetarian", "gluten-free"],
    menu: [
      { id: "m17", name: "Acai Bowl", price: 11.99, description: "Acai, granola, banana, berries", calories: 380, allergens: ["nuts"] },
      { id: "m18", name: "Quinoa Salad", price: 13.99, description: "Mixed greens, avocado, feta", calories: 420, allergens: ["dairy"] },
      { id: "m19", name: "Green Smoothie", price: 8.99, description: "Spinach, banana, mango", calories: 220, allergens: [] },
      { id: "m20", name: "Protein Wrap", price: 12.99, description: "Grilled chicken, hummus, veggies", calories: 480, allergens: ["gluten"] },
    ]
  },
  { id: "sakura-sushi", name: "Sakura Sushi", cuisine: "Asian", price: "$$$", rating: 4.9, time: "30-40 min", prepTime: 25, freeDelivery: false, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400", featured: "Dragon Roll · $16.99", popular: true, dietary: [],
    menu: [
      { id: "m21", name: "Dragon Roll", price: 16.99, description: "Shrimp tempura, avocado, eel sauce", calories: 520, allergens: ["shellfish", "gluten"] },
      { id: "m22", name: "Salmon Sashimi", price: 18.99, description: "8 pieces of fresh salmon", calories: 280, allergens: ["fish"] },
      { id: "m23", name: "Miso Soup", price: 4.99, description: "Tofu, seaweed, green onion", calories: 80, allergens: ["soy"] },
      { id: "m24", name: "Edamame", price: 5.99, description: "Steamed with sea salt", calories: 190, allergens: ["soy"] },
    ]
  },
  { id: "sweet-dreams", name: "Sweet Dreams Bakery", cuisine: "Desserts", price: "$$", rating: 4.8, time: "15-25 min", prepTime: 8, freeDelivery: true, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400", featured: "Red Velvet Cake · $8.99", popular: true, dietary: ["vegetarian"],
    menu: [
      { id: "m25", name: "Red Velvet Cake", price: 8.99, description: "Cream cheese frosting, rich cocoa", calories: 420, allergens: ["gluten", "dairy", "egg"] },
      { id: "m26", name: "Chocolate Lava Cake", price: 9.99, description: "Warm molten center, vanilla ice cream", calories: 580, allergens: ["gluten", "dairy", "egg"] },
      { id: "m27", name: "Macarons Box (6)", price: 12.99, description: "Assorted French macarons", calories: 360, allergens: ["nuts", "dairy", "egg"] },
      { id: "m28", name: "Crème Brûlée", price: 7.99, description: "Classic French custard", calories: 320, allergens: ["dairy", "egg"] },
    ]
  },
  { id: "morning-glory", name: "Morning Glory", cuisine: "Breakfast", price: "$", rating: 4.6, time: "15-20 min", prepTime: 10, freeDelivery: false, image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=400", featured: "Avocado Toast · $10.99", popular: false, dietary: ["vegetarian"],
    menu: [
      { id: "m29", name: "Avocado Toast", price: 10.99, description: "Sourdough, poached egg, chili flakes", calories: 380, allergens: ["gluten", "egg"] },
      { id: "m30", name: "Pancake Stack", price: 11.99, description: "Buttermilk pancakes, maple syrup, berries", calories: 650, allergens: ["gluten", "dairy", "egg"] },
      { id: "m31", name: "Breakfast Burrito", price: 12.99, description: "Eggs, chorizo, cheese, salsa", calories: 720, allergens: ["gluten", "dairy", "egg"] },
      { id: "m32", name: "Cold Brew Coffee", price: 4.99, description: "24-hour cold brew with oat milk", calories: 80, allergens: [] },
    ]
  },
  { id: "ocean-catch", name: "Ocean Catch", cuisine: "Seafood", price: "$$$", rating: 4.7, time: "30-40 min", prepTime: 22, freeDelivery: false, image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=400", featured: "Lobster Roll · $22.99", popular: false, dietary: ["gluten-free"],
    menu: [
      { id: "m33", name: "Lobster Roll", price: 22.99, description: "Maine lobster, butter, brioche bun", calories: 580, allergens: ["shellfish", "gluten", "dairy"] },
      { id: "m34", name: "Fish & Chips", price: 16.99, description: "Beer-battered cod, tartar sauce", calories: 780, allergens: ["gluten", "fish"] },
      { id: "m35", name: "Clam Chowder", price: 9.99, description: "New England style, sourdough bowl", calories: 420, allergens: ["shellfish", "dairy", "gluten"] },
      { id: "m36", name: "Grilled Shrimp Skewers", price: 18.99, description: "Garlic butter, lemon, herbs", calories: 340, allergens: ["shellfish"] },
    ]
  },
];

interface CartItem {
  menuItemId: string; name: string; price: number; quantity: number; restaurantId: string;
  specialInstructions?: string;
}

const tipOptions = [
  { id: "none", label: "No tip", pct: 0 },
  { id: "15", label: "15%", pct: 0.15 },
  { id: "20", label: "20%", pct: 0.20 },
  { id: "25", label: "25%", pct: 0.25 },
  { id: "30", label: "30%", pct: 0.30 },
];

const loyaltyInfo = {
  pointsPerDollar: 10,
  pointsForFreeDelivery: 500,
  currentPoints: 320,
  tier: "Silver",
  nextTier: "Gold",
  pointsToNextTier: 180,
};

const mealDeals = [
  { id: "deal1", name: "Lunch Combo", description: "Any main + drink for $14.99", savings: "Save $3", restaurant: "joes-grill" },
  { id: "deal2", name: "Family Pack", description: "4 mains + 2 sides for $39.99", savings: "Save $12", restaurant: "el-azteca" },
  { id: "deal3", name: "Sweet Tooth", description: "Any 2 desserts for $14.99", savings: "Save $5", restaurant: "sweet-dreams" },
];

const previousOrders = [
  { id: "po1", restaurantId: "joes-grill", items: ["Classic Burger", "Crispy Fries"], total: 17.98, date: "2 days ago" },
  { id: "po2", restaurantId: "el-azteca", items: ["Chicken Tacos", "Chips & Guac"], total: 17.98, date: "Last week" },
  { id: "po3", restaurantId: "sakura-sushi", items: ["Dragon Roll", "Miso Soup"], total: 21.98, date: "Last week" },
  { id: "po4", restaurantId: "sweet-dreams", items: ["Red Velvet Cake", "Macarons Box"], total: 21.98, date: "2 weeks ago" },
];

// Group ordering
const groupOrderOptions = [
  { id: "solo", label: "Just me", icon: "👤" },
  { id: "couple", label: "2 people", icon: "👥" },
  { id: "group", label: "Group (3-6)", icon: "👨‍👩‍👧‍👦" },
  { id: "office", label: "Office catering", icon: "🏢" },
];

// Delivery speed options
const eatsDeliveryOptions = [
  { id: "standard", label: "Standard", time: "25-40 min", extraCost: 0 },
  { id: "priority", label: "Priority", time: "15-25 min", extraCost: 2.99, badge: "Faster" },
  { id: "scheduled", label: "Scheduled", time: "Pick a time", extraCost: 0 },
];

// Restaurant reviews inline
const restaurantReviews: Record<string, Array<{ user: string; rating: number; text: string; date: string }>> = {
  "joes-grill": [
    { user: "Mike R.", rating: 5, text: "Best burger in town! Always fresh and juicy.", date: "3 days ago" },
    { user: "Sarah L.", rating: 4, text: "Great food, delivery was a bit slow.", date: "1 week ago" },
  ],
  "sakura-sushi": [
    { user: "Emily T.", rating: 5, text: "Authentic sushi, tastes like Tokyo!", date: "2 days ago" },
    { user: "John K.", rating: 5, text: "Dragon roll is incredible. Must try.", date: "5 days ago" },
  ],
  "sweet-dreams": [
    { user: "Lisa M.", rating: 5, text: "Red velvet cake is to die for!", date: "Yesterday" },
    { user: "David P.", rating: 4, text: "Macarons are perfect, a bit pricey though.", date: "1 week ago" },
  ],
};

// Step indicator
function EatsStepIndicator({ currentStep }: { currentStep: string }) {
  const steps = [
    { id: "browse", label: "Browse" },
    { id: "restaurant", label: "Menu" },
    { id: "cart", label: "Cart" },
    { id: "checkout", label: "Pay" },
  ];
  const idx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
            i <= idx ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground border border-border/40"
          )}>
            {i < idx ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={cn("text-[10px] font-bold hidden sm:inline", i <= idx ? "text-primary" : "text-muted-foreground/50")}>{s.label}</span>
          {i < steps.length - 1 && <div className={cn("w-4 sm:w-8 h-[2px] rounded-full", i < idx ? "bg-primary" : "bg-border/40")} />}
        </div>
      ))}
    </div>
  );
}

// Live order tracking
function OrderTrackingTimeline({ orderNumber }: { orderNumber: string }) {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveStep(1), 2000),
      setTimeout(() => setActiveStep(2), 5000),
      setTimeout(() => setActiveStep(3), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const trackingSteps = [
    { label: "Order placed", icon: CheckCircle, time: "Just now" },
    { label: "Preparing your food", icon: Flame, time: "~10 min" },
    { label: "Driver picking up", icon: Package, time: "~20 min" },
    { label: "On the way!", icon: Truck, time: "~25 min" },
  ];

  return (
    <div className="space-y-2">
      {trackingSteps.map((s, i) => {
        const Icon = s.icon;
        const isDone = i <= activeStep;
        const isActive = i === activeStep;
        return (
          <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className={cn("flex items-center gap-3 p-2.5 rounded-xl", isDone ? "opacity-100" : "opacity-40")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isDone ? "bg-primary/10" : "bg-muted/30")}>
              <Icon className={cn("w-4 h-4", isDone ? "text-primary" : "text-muted-foreground", isActive && "animate-pulse")} />
            </div>
            <div className="flex-1">
              <p className={cn("text-xs font-bold", isDone ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.time}</p>
            </div>
            {isDone && i < activeStep && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
            {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </motion.div>
        );
      })}
    </div>
  );
}

// Prep time progress bar
function PrepTimeBar({ prepTime }: { prepTime: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (30 - prepTime) / 30 * 100 + 30)}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" />
      </div>
      <span className="text-[10px] font-bold text-primary">{prepTime}m</span>
    </div>
  );
}

export default function EatsLanding() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"browse" | "restaurant" | "cart" | "checkout" | "confirmation">("browse");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState<Record<string, string>>({});
  const [selectedTip, setSelectedTip] = useState("20");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "time" | "price">("recommended");
  const [activeDietary, setActiveDietary] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [scheduledDelivery, setScheduledDelivery] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("asap");
  const [rateOrder, setRateOrder] = useState<number | null>(null);
  const [noUtensils, setNoUtensils] = useState(false);
  const [showMealDeals, setShowMealDeals] = useState(false);
  const [giftOrderOld, setGiftOrderOld] = useState(false);
  const [giftMessageOld, setGiftMessageOld] = useState("");
  const [groupSize, setGroupSize] = useState("solo");
  const [selectedDeliverySpeed, setSelectedDeliverySpeed] = useState("standard");
  const [showReviews, setShowReviews] = useState(false);
  const [allergenAlert, setAllergenAlert] = useState(true);
  const [ecoPackaging, setEcoPackaging] = useState(false);
  const [driverTipSplit, setDriverTipSplit] = useState(false);

  // === NEW: DoorDash-inspired features ===
  const [dashPassActive, setDashPassActive] = useState(false);
  const [showDashPass, setShowDashPass] = useState(false);
  const [pickupOrder, setPickupOrder] = useState(false);
  const [alcoholDelivery, setAlcoholDelivery] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [livePhotoUpdates, setLivePhotoUpdates] = useState(true);
  const [recurringOrder, setRecurringOrder] = useState<"none" | "daily" | "weekly" | "biweekly">("none");
  const [showRecurringSetup, setShowRecurringSetup] = useState(false);
  const [doubleDashItems, setDoubleDashItems] = useState(false);
  const [convenienceItems] = useState([
    { id: "water", name: "Water 6-Pack", price: 4.99, icon: "💧" },
    { id: "snacks", name: "Chip Variety Pack", price: 6.99, icon: "🍿" },
    { id: "ice-cream", name: "Ice Cream Pint", price: 5.99, icon: "🍨" },
    { id: "medicine", name: "Pain Reliever", price: 8.99, icon: "💊" },
  ]);
  const [doubleDashCart, setDoubleDashCart] = useState<string[]>([]);
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [priorityFee] = useState(2.99);
  const [showDriverMap, setShowDriverMap] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState("18 min");
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [happyHour, setHappyHour] = useState(Math.random() > 0.5);
  const [dashPassSavings] = useState(47.50);
  const [monthlyOrders] = useState(8);
  const [freeDeliveryThreshold] = useState(12);
  const [showSurpriseMe, setShowSurpriseMe] = useState(false);
  const [itemPhotoView, setItemPhotoView] = useState(true);
  const [orderNotes, setOrderNotes] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(true);
  const [handItToMe, setHandItToMe] = useState(false);
  const [sendAsGiftNew, setSendAsGiftNew] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [curbsidePickup, setCurbsidePickup] = useState(false);
  const [reorderSuggestion, setReorderSuggestion] = useState(true);
  const [splitBill, setSplitBill] = useState(false);
  const [splitBillCount, setSplitBillCount] = useState(2);
  const [mealCombo, setMealCombo] = useState(false);
  const [loyaltyStamps, setLoyaltyStamps] = useState(7);
  const [showQA, setShowQA] = useState(false);
  const [liveTrackingStep, setLiveTrackingStep] = useState(0);
  const [substitutePreference, setSubstitutePreference] = useState<"contact" | "similar" | "refund">("contact");
  const [tableReservation, setTableReservation] = useState(false);
  const [mealPlanActive, setMealPlanActive] = useState(false);
  const [nutritionMode, setNutritionMode] = useState(false);
  const [moodQuiz, setMoodQuiz] = useState<"none" | "comfort" | "healthy" | "adventurous" | "quick">("none");
  const [restaurantChat, setRestaurantChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{from: string; text: string}>>([
    { from: "restaurant", text: "Hi! How can we help with your order?" },
  ]);
  const [restaurantChatInput, setRestaurantChatInput] = useState("");
  const [allergyPassport, setAllergyPassport] = useState<string[]>([]);
  const [cateringMode, setCateringMode] = useState(false);
  const [cateringHeadcount, setCateringHeadcount] = useState(10);
  const [orderCountdown, setOrderCountdown] = useState<number | null>(null);
  const [photoMenuView, setPhotoMenuView] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [mealReminder, setMealReminder] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [dineInOption, setDineInOption] = useState(false);
  const [scheduledOrder, setScheduledOrder] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [cuisineRoulette, setCuisineRoulette] = useState(false);
  const [rouletteResult, setRouletteResult] = useState("");
  const [photoRating, setPhotoRating] = useState(false);
  const [pantryMode, setPantryMode] = useState(false);
  const [chefsSpecial, setChefsSpecial] = useState(false);
  const [giftOrder, setGiftOrder] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftRecipient, setGiftRecipient] = useState("");
  const [showNutritionSummary, setShowNutritionSummary] = useState(false);
  const [showCuisineStats, setShowCuisineStats] = useState(false);
  const [cuisineStats] = useState([
    { cuisine: "Japanese", count: 12, pct: 30 },
    { cuisine: "Italian", count: 8, pct: 20 },
    { cuisine: "Mexican", count: 7, pct: 17 },
    { cuisine: "Indian", count: 6, pct: 15 },
    { cuisine: "Other", count: 7, pct: 18 },
  ]);
  const [socialShare, setSocialShare] = useState(false);
  const [orderStreak] = useState(5);
  const [maxStreak] = useState(14);
  const [dietGoal, setDietGoal] = useState<"none" | "low-cal" | "high-protein" | "low-carb">("none");
  const [showReorderHistory, setShowReorderHistory] = useState(false);
  const [pastOrders] = useState([
    { id: "1", restaurant: "Sakura Sushi", items: "Dragon Roll x2", total: "$24.50", date: "Yesterday" },
    { id: "2", restaurant: "Pizza Palace", items: "Margherita + Garlic Bread", total: "$18.00", date: "3 days ago" },
    { id: "3", restaurant: "Green Bowl", items: "Buddha Bowl", total: "$13.50", date: "Last week" },
  ]);

  // === WAVE 3: Discovery & Intelligence ===
  const [showTasteProfile, setShowTasteProfile] = useState(false);
  const [showFoodSafety, setShowFoodSafety] = useState(false);
  const [showFlavorMap, setShowFlavorMap] = useState(false);
  const [showRestaurantAwards, setShowRestaurantAwards] = useState(false);
  const [showSpendingInsights, setShowSpendingInsights] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);

  // Taste profile
  const tasteProfile = {
    spicy: 72, sweet: 45, savory: 88, sour: 30, umami: 65,
    topCuisines: ["Japanese", "Italian", "Mexican"],
    adventureScore: 78,
    healthScore: 62,
  };

  // Food safety scores (Yelp/DoorDash)
  const foodSafetyScores = [
    { restaurant: "Joe's Grill", grade: "A", score: 96, lastInspection: "Jan 2026", icon: "🏆" },
    { restaurant: "Bella Napoli", grade: "A", score: 98, lastInspection: "Feb 2026", icon: "🏆" },
    { restaurant: "Thai Palace", grade: "A-", score: 92, lastInspection: "Dec 2025", icon: "✅" },
    { restaurant: "El Azteca", grade: "A", score: 95, lastInspection: "Jan 2026", icon: "🏆" },
  ];

  // Restaurant awards
  const restaurantAwards = [
    { restaurant: "Sakura Sushi", award: "Best Sushi 2025", org: "City Eats Awards", icon: "🏅" },
    { restaurant: "Bella Napoli", award: "Top Italian Restaurant", org: "Food & Wine", icon: "🍷" },
    { restaurant: "Green Bowl", award: "Healthiest Menu", org: "Wellness Weekly", icon: "🥗" },
  ];

  // Spending insights
  const spendingInsights = {
    thisMonth: 127.50,
    lastMonth: 142.80,
    avgOrderValue: 18.20,
    ordersThisMonth: 7,
    topCategory: "Asian",
    savingsFromDeals: 23.50,
    loyaltyValue: "$4.70",
  };

  // Meal planner
  const mealPlanSuggestions = [
    { day: "Mon", meal: "Quinoa Salad", restaurant: "Green Bowl", cal: 420, price: 13.99 },
    { day: "Tue", meal: "Chicken Tacos", restaurant: "El Azteca", cal: 420, price: 10.99 },
    { day: "Wed", meal: "Pad Thai", restaurant: "Thai Palace", cal: 620, price: 13.50 },
    { day: "Thu", meal: "Margherita Pizza", restaurant: "Bella Napoli", cal: 780, price: 14.99 },
    { day: "Fri", meal: "Dragon Roll", restaurant: "Sakura Sushi", cal: 520, price: 16.99 },
  ];
  const totalCalories = cart.reduce((sum, item) => {
    const restaurant = restaurants.find(r => r.id === item.restaurantId);
    const menuItem = restaurant?.menu.find(m => m.id === item.menuItemId);
    return sum + (menuItem?.calories ?? 0) * item.quantity;
  }, 0);

  const filtered = restaurants.filter(r => {
    const matchesCategory = active === "All" || r.cuisine === active;
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) || r.menu.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDietary = activeDietary.length === 0 || activeDietary.some(d => r.dietary.includes(d));
    return matchesCategory && matchesSearch && matchesDietary;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "time") return a.prepTime - b.prepTime;
    if (sortBy === "price") return a.price.length - b.price.length;
    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
  });

  const orderNumber = `ZE-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurant);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = currentRestaurant?.freeDelivery ? 0 : 3.99;
  const serviceFee = Math.round(cartTotal * 0.05 * 100) / 100;
  const tipPct = tipOptions.find(t => t.id === selectedTip)?.pct ?? 0;
  const tipAmount = Math.round(cartTotal * tipPct * 100) / 100;
  const promoDiscount = promoApplied ? Math.round(cartTotal * 0.1 * 100) / 100 : 0;
  const grandTotal = Math.round((cartTotal + deliveryFee + serviceFee + tipAmount - promoDiscount) * 100) / 100;

  const addToCart = (item: { id: string; name: string; price: number }, restaurantId: string) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      toast.error("You can only order from one restaurant at a time. Clear your cart first.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, restaurantId }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItemId === menuItemId) { const newQty = c.quantity + delta; return newQty <= 0 ? null! : { ...c, quantity: newQty }; }
      return c;
    }).filter(Boolean));
  };

  const handleBack = () => {
    if (step === "confirmation") { setStep("browse"); setCart([]); setSelectedRestaurant(null); }
    else if (step === "checkout") setStep("cart");
    else if (step === "cart") setStep(selectedRestaurant ? "restaurant" : "browse");
    else if (step === "restaurant") { setStep("browse"); setSelectedRestaurant(null); }
    else navigate(-1);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "EATS10") { setPromoApplied(true); toast.success("10% off applied!"); }
    else toast.error("Invalid promo code");
  };

  const toggleFavorite = (id: string) => {
    setIsFavorite(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(isFavorite[id] ? "Removed from favorites" : "Added to favorites");
  };

  const toggleSaved = (id: string) => {
    setSavedRestaurants(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    toast.success(savedRestaurants.includes(id) ? "Removed from saved" : "Saved for later");
  };

  const handleReorder = () => {
    setCart([]); setStep("browse"); setSelectedRestaurant(null);
    toast.success("Browse to place a new order!");
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({ title: `ZIVO Eats Order #${orderNumber}`, text: `Check out my order from ${currentRestaurant?.name}!` });
    } else {
      navigator.clipboard.writeText(`ZIVO Eats Order #${orderNumber}`);
      toast.success("Order details copied!");
    }
  };

  const handleQuickReorder = (order: typeof previousOrders[0]) => {
    const restaurant = restaurants.find(r => r.id === order.restaurantId);
    if (!restaurant) return;
    setSelectedRestaurant(restaurant.id);
    const newCart: CartItem[] = [];
    order.items.forEach(itemName => {
      const menuItem = restaurant.menu.find(m => m.name === itemName);
      if (menuItem) newCart.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1, restaurantId: restaurant.id });
    });
    setCart(newCart);
    setStep("cart");
    toast.success("Previous order loaded!");
  };

  return (
    <div className="min-h-screen bg-background">
      {step === "browse" && <NavBar />}

      <AnimatePresence mode="wait">
        {/* BROWSE */}
        {step === "browse" && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="relative pt-24 pb-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="container mx-auto px-4 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
                    <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">ZIVO <span className="text-primary">Eats</span></h1>
                  <p className="text-muted-foreground text-lg">Delicious food from local restaurants, delivered fast.</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search restaurants or dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                      className={cn("h-12 w-12 rounded-xl border flex items-center justify-center touch-manipulation active:scale-95 transition-all",
                        showFilters || activeDietary.length > 0 ? "border-primary bg-primary/5 text-primary" : "border-border/50 bg-card text-muted-foreground"
                      )}>
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dietary Filters */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 flex-wrap overflow-hidden">
                        {dietaryFilters.map(f => (
                          <button key={f.id} onClick={() => setActiveDietary(prev => prev.includes(f.id) ? prev.filter(d => d !== f.id) : [...prev, f.id])}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all touch-manipulation active:scale-95",
                              activeDietary.includes(f.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground border border-border/40"
                            )}>
                            {f.label}
                          </button>
                        ))}
                        {activeDietary.length > 0 && (
                          <button onClick={() => setActiveDietary([])} className="px-2 py-1.5 text-xs text-destructive font-bold touch-manipulation">
                            <X className="w-3 h-3 inline mr-0.5" /> Clear
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Enter your delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="pl-10 h-12 rounded-xl bg-card border-border/50" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="py-12 sm:py-16">
              <div className="container mx-auto px-4">
                {/* === DOORDASH-INSPIRED FEATURES === */}

                {/* DashPass Membership Banner */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 p-4 mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{dashPassActive ? "ZIVO Eats Pass ✓" : "ZIVO Eats Pass"}</p>
                      <p className="text-[10px] text-muted-foreground">{dashPassActive ? `Saved $${dashPassSavings.toFixed(2)} this month` : "$0 delivery fee on orders $12+"}</p>
                    </div>
                    {!dashPassActive && (
                      <button onClick={() => { setDashPassActive(true); toast.success("🎉 ZIVO Eats Pass activated! $0 delivery fee on orders $12+"); }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold touch-manipulation active:scale-95 shadow-md">
                        Try Free
                      </button>
                    )}
                  </div>
                  {dashPassActive && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-card/60 p-2 text-center"><p className="text-sm font-bold text-primary">{monthlyOrders}</p><p className="text-[9px] text-muted-foreground">Orders</p></div>
                      <div className="rounded-lg bg-card/60 p-2 text-center"><p className="text-sm font-bold text-emerald-500">${dashPassSavings.toFixed(0)}</p><p className="text-[9px] text-muted-foreground">Saved</p></div>
                      <div className="rounded-lg bg-card/60 p-2 text-center"><p className="text-sm font-bold text-amber-500">{loyaltyInfo.currentPoints}</p><p className="text-[9px] text-muted-foreground">Points</p></div>
                    </div>
                  )}
                </motion.div>

                {/* Loyalty Points Banner */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 p-4 flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{loyaltyInfo.tier} Member · {loyaltyInfo.currentPoints} pts</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500" style={{ width: `${(loyaltyInfo.currentPoints / (loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier)) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{loyaltyInfo.pointsToNextTier} to {loyaltyInfo.nextTier}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Pickup vs Delivery Toggle (DoorDash) */}
                <div className="flex gap-2 mb-6">
                  <button onClick={() => { setPickupOrder(false); }}
                    className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-2",
                      !pickupOrder ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                    <Truck className="w-4 h-4" /> Delivery
                  </button>
                  <button onClick={() => { setPickupOrder(true); toast.info("🏃 Pickup — save on delivery fees!"); }}
                    className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-2",
                      pickupOrder ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                    <Package className="w-4 h-4" /> Pickup
                  </button>
                </div>

                {/* Happy Hour / Flash Deal */}
                {happyHour && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4 flex items-center gap-3 mb-6">
                    <span className="text-2xl">⚡</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-orange-500">Happy Hour! 25% off select restaurants</p>
                      <p className="text-[10px] text-muted-foreground">Ends in 47 min — order now</p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                  </motion.div>
                )}

                {/* DoubleDash — Add convenience items (DoorDash) */}
                <div className="mb-6">
                  <button onClick={() => setDoubleDashItems(!doubleDashItems)}
                    className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all touch-manipulation mb-3">
                    <Sparkles className="w-4 h-4 text-primary" /> DoubleDash™ — Add Essentials
                    <ChevronRight className={cn("w-3 h-3 transition-transform", doubleDashItems && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {doubleDashItems && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <p className="text-[10px] text-muted-foreground mb-2">Add convenience store items — delivered with your food, no extra fee!</p>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                          {convenienceItems.map(item => (
                            <button key={item.id} onClick={() => {
                              setDoubleDashCart(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                              toast.success(`${doubleDashCart.includes(item.id) ? "Removed" : "Added"} ${item.name}`);
                            }}
                              className={cn("flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all touch-manipulation active:scale-95",
                                doubleDashCart.includes(item.id) ? "border-primary bg-primary/5" : "border-border/40 bg-card")}>
                              <span className="text-xl">{item.icon}</span>
                              <p className="text-[10px] font-bold text-foreground mt-1">{item.name}</p>
                              <p className="text-[10px] text-primary font-bold">${item.price.toFixed(2)}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Recurring Order Setup (DoorDash) */}
                <div className="mb-6">
                  <button onClick={() => setShowRecurringSetup(!showRecurringSetup)}
                    className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all touch-manipulation mb-3">
                    <RefreshCw className="w-4 h-4 text-primary" /> Schedule Recurring Order
                    <ChevronRight className={cn("w-3 h-3 transition-transform", showRecurringSetup && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {showRecurringSetup && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden flex gap-2 flex-wrap">
                        {(["none", "daily", "weekly", "biweekly"] as const).map(opt => (
                          <button key={opt} onClick={() => { setRecurringOrder(opt); if (opt !== "none") toast.success(`📅 Order will repeat ${opt}`); }}
                            className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all touch-manipulation active:scale-95 capitalize",
                              recurringOrder === opt ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                            {opt === "none" ? "One-time" : opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Delivery Instructions (DoorDash) */}
                <div className="rounded-2xl bg-card border border-border/40 p-4 mb-6 space-y-3">
                  <p className="text-xs font-bold text-foreground">Delivery Instructions</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setLeaveAtDoor(true); setHandItToMe(false); }}
                      className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold transition-all touch-manipulation",
                        leaveAtDoor ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
                      🚪 Leave at door
                    </button>
                    <button onClick={() => { setHandItToMe(true); setLeaveAtDoor(false); }}
                      className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold transition-all touch-manipulation",
                        handItToMe ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
                      🤝 Hand it to me
                    </button>
                  </div>
                  <Input placeholder="Add delivery note (e.g., gate code #1234)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="h-10 rounded-xl text-sm" />
                </div>

                {/* Meal Deals */}
                <div className="mb-6">
                  <button onClick={() => setShowMealDeals(!showMealDeals)}
                    className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all touch-manipulation mb-3">
                    <Gift className="w-4 h-4 text-orange-500" /> Meal Deals
                    <ChevronRight className={cn("w-3 h-3 transition-transform", showMealDeals && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {showMealDeals && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 overflow-hidden">
                        {mealDeals.map(deal => (
                          <div key={deal.id} className="flex-shrink-0 w-56 p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20">
                            <p className="text-xs font-bold text-foreground">{deal.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{deal.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] font-bold text-orange-500">{deal.savings}</span>
                              <button onClick={() => {
                                const r = restaurants.find(res => res.id === deal.restaurant);
                                if (r) { setSelectedRestaurant(r.id); setStep("restaurant"); }
                              }} className="text-[10px] font-bold text-primary touch-manipulation">Order →</button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Previous orders */}
                <div className="mb-6">
                  <button onClick={() => setShowPreviousOrders(!showPreviousOrders)}
                    className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all touch-manipulation mb-3">
                    <History className="w-4 h-4" /> Order Again
                    <ChevronRight className={cn("w-3 h-3 transition-transform", showPreviousOrders && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {showPreviousOrders && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 overflow-hidden">
                        {previousOrders.map(order => {
                          const r = restaurants.find(res => res.id === order.restaurantId);
                          return (
                            <button key={order.id} onClick={() => handleQuickReorder(order)}
                              className="flex-shrink-0 w-56 p-3 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-all touch-manipulation active:scale-[0.98] text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-bold text-foreground">{r?.name}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{order.items.join(", ")}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-bold text-primary">${order.total.toFixed(2)}</span>
                                <span className="text-[10px] text-muted-foreground">{order.date}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category + Sort */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {categories.map((c) => (
                      <button key={c} onClick={() => setActive(c)} className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all touch-manipulation active:scale-95",
                        active === c ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                      )}>{c}</button>
                    ))}
                  </div>
                </div>
                {/* Sort options */}
                <div className="flex gap-2 mb-6">
                  {(["recommended", "rating", "time", "price"] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all touch-manipulation active:scale-95 capitalize",
                        sortBy === s ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
                      )}>{s === "recommended" ? "🔥 Recommended" : s === "rating" ? "⭐ Top Rated" : s === "time" ? "⚡ Fastest" : "💰 Price"}</button>
                  ))}
                </div>

                {/* Popular section */}
                {active === "All" && !searchQuery && activeDietary.length === 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4"><Flame className="w-5 h-5 text-orange-500" /> Popular Near You</h2>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {restaurants.filter(r => r.popular).map(r => (
                        <button key={r.id} onClick={() => { setSelectedRestaurant(r.id); setStep("restaurant"); }}
                          className="flex-shrink-0 w-36 rounded-xl bg-card border border-border/40 overflow-hidden hover:shadow-md transition-all touch-manipulation active:scale-[0.98]">
                          <img src={r.image} alt={r.name} className="w-full h-20 object-cover" loading="lazy" />
                          <div className="p-2.5">
                            <p className="text-xs font-bold text-foreground truncate">{r.name}</p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {r.rating} · {r.time}
                            </div>
                            <PrepTimeBar prepTime={r.prepTime} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.length === 0 && (
                    <div className="col-span-full text-center py-16">
                      <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No restaurants found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or category</p>
                    </div>
                  )}
                  {filtered.map((restaurant, i) => (
                    <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                      <div className="group relative rounded-2xl bg-card border border-border/40 overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-200">
                        <button onClick={() => { setSelectedRestaurant(restaurant.id); setStep("restaurant"); }} className="block w-full text-left touch-manipulation active:scale-[0.99]">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50" />
                            {restaurant.freeDelivery && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Free Delivery
                              </span>
                            )}
                            {restaurant.popular && (
                              <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-primary-foreground flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Popular
                              </span>
                            )}
                            {/* Dietary badges */}
                            {restaurant.dietary.length > 0 && (
                              <div className="absolute bottom-3 right-3 flex gap-1">
                                {restaurant.dietary.slice(0, 2).map(d => (
                                  <span key={d} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-card/80 backdrop-blur text-foreground capitalize">{d}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-base">{restaurant.name}</h3>
                              <span className="text-xs text-muted-foreground">{restaurant.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{restaurant.cuisine} · {restaurant.featured}</p>
                            <PrepTimeBar prepTime={restaurant.prepTime} />
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {restaurant.rating}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.time}</span>
                                {restaurantReviews[restaurant.id] && (
                                  <span className="flex items-center gap-1 text-primary"><MessageSquare className="w-3 h-3" /> {restaurantReviews[restaurant.id].length}</span>
                                )}
                              </div>
                              <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">Order <ArrowRight className="w-3.5 h-3.5" /></span>
                            </div>
                          </div>
                        </button>
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); toggleSaved(restaurant.id); }}
                            className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center touch-manipulation active:scale-90 shadow-sm">
                            <Bookmark className={cn("w-4 h-4 transition-all", savedRestaurants.includes(restaurant.id) ? "fill-primary text-primary" : "text-muted-foreground")} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(restaurant.id); }}
                            className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center touch-manipulation active:scale-90 shadow-sm">
                            <Heart className={cn("w-4 h-4 transition-all", isFavorite[restaurant.id] ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {cartCount > 0 && (
              <motion.button initial={{ y: 100 }} animate={{ y: 0 }} onClick={() => setStep("cart")}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-xl shadow-primary/30 font-bold text-sm touch-manipulation active:scale-[0.97]">
                <ShoppingCart className="w-5 h-5" /><span>View Cart · {cartCount} items</span><span className="font-bold">${cartTotal.toFixed(2)}</span>
              </motion.button>
            )}
            <Footer />

            {/* Reorder Suggestion Banner */}
            {reorderSuggestion && previousOrders.length > 0 && step === "browse" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="fixed bottom-36 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md rounded-2xl bg-card border border-border/40 shadow-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">Reorder your last meal?</p>
                  <p className="text-[10px] text-muted-foreground truncate">{previousOrders[0].items.join(", ")} · ${previousOrders[0].total.toFixed(2)}</p>
                </div>
                <button onClick={() => {
                  const r = restaurants.find(res => res.id === previousOrders[0].restaurantId);
                  if (r) { setSelectedRestaurant(r.id); setStep("restaurant"); }
                  setReorderSuggestion(false);
                }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold touch-manipulation active:scale-95">
                  Reorder
                </button>
                <button onClick={() => setReorderSuggestion(false)} className="text-muted-foreground touch-manipulation">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* RESTAURANT DETAIL */}
        {step === "restaurant" && currentRestaurant && (
          <motion.div key="restaurant" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <div className="flex-1">
                  <h1 className="text-base font-bold text-foreground">{currentRestaurant.name}</h1>
                  <p className="text-[10px] text-muted-foreground">{currentRestaurant.cuisine} · {currentRestaurant.time} · {currentRestaurant.price}</p>
                </div>
                <button onClick={() => toggleFavorite(currentRestaurant.id)}
                  className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <Heart className={cn("w-5 h-5", isFavorite[currentRestaurant.id] ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </button>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {currentRestaurant.rating}
                </div>
              </div>
              <EatsStepIndicator currentStep="restaurant" />
            </div>

            {/* Inline Reviews Section */}
            {restaurantReviews[currentRestaurant.id] && (
              <div className="px-4 mt-2">
                <button onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all touch-manipulation mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Customer Reviews ({restaurantReviews[currentRestaurant.id].length})
                  <ChevronRight className={cn("w-3 h-3 transition-transform", showReviews && "rotate-90")} />
                </button>
                <AnimatePresence>
                  {showReviews && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden">
                      {restaurantReviews[currentRestaurant.id].map((review, i) => (
                        <div key={i} className="rounded-xl bg-card border border-border/30 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-foreground">{review.user}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, s) => (
                                <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{review.text}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-1">{review.date}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="relative h-48 overflow-hidden">
              <img src={currentRestaurant.image} alt={currentRestaurant.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {currentRestaurant.freeDelivery && <Badge className="bg-primary text-primary-foreground text-[10px] font-bold gap-1"><Truck className="w-3 h-3" /> Free Delivery</Badge>}
                <Badge variant="outline" className="bg-card/80 backdrop-blur text-[10px] font-bold gap-1"><Timer className="w-3 h-3" /> {currentRestaurant.prepTime}m prep</Badge>
                {currentRestaurant.dietary.map(d => (
                  <Badge key={d} variant="outline" className="bg-card/80 backdrop-blur text-[10px] font-bold capitalize">{d}</Badge>
                ))}
              </div>
            </div>

            {/* Group order banner */}
            <div className="px-4 pt-4 max-w-lg mx-auto">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Group Order</p>
                  <p className="text-[10px] text-muted-foreground">Invite friends to add items to this order</p>
                </div>
                <button onClick={() => toast.info("Group ordering coming soon!")} className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/10 touch-manipulation active:scale-95">
                  Start
                </button>
              </div>
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-3">
              <h2 className="text-lg font-bold text-foreground mb-4">Menu</h2>
              {currentRestaurant.menu.map((item, i) => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                const instrKey = item.id;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 transition-all space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                          {item.calories && <span className="text-[10px] text-muted-foreground/60">{item.calories} cal</span>}
                        </div>
                        {/* Allergen badges */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {item.allergens.map(a => (
                              <span key={a} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 capitalize">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                          <button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => addToCart(item, currentRestaurant.id)} className="rounded-xl h-9 px-4 gap-1.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary/5">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </Button>
                      )}
                    </div>
                    {inCart && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input placeholder="Special instructions (e.g., no onions)" value={specialInstructions[instrKey] || ""}
                          onChange={(e) => setSpecialInstructions(prev => ({ ...prev, [instrKey]: e.target.value }))}
                          className="h-8 text-xs rounded-lg border-border/30 bg-muted/30" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {cartCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-2xl border-t border-border/30 safe-area-bottom">
                <Button onClick={() => setStep("cart")} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]">
                  <ShoppingCart className="w-5 h-5" /> View Cart · {cartCount} items <span className="ml-auto">${cartTotal.toFixed(2)}</span>
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* CART */}
        {step === "cart" && (
          <motion.div key="cart" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <h1 className="text-base font-bold text-foreground">Your Cart</h1>
                <Badge variant="outline" className="ml-auto text-xs font-bold">{cartCount} items</Badge>
              </div>
              <EatsStepIndicator currentStep="cart" />
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <Button variant="outline" onClick={() => setStep("browse")} className="mt-4 rounded-xl">Browse Restaurants</Button>
                </div>
              ) : (
                <>
                  {currentRestaurant && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{currentRestaurant.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{currentRestaurant.time}</span>
                    </div>
                  )}

                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                        {specialInstructions[item.menuItemId] && (
                          <p className="text-[10px] text-primary mt-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {specialInstructions[item.menuItemId]}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.menuItemId, -1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center touch-manipulation active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => updateQuantity(item.menuItemId, 1)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center touch-manipulation active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="font-bold text-sm text-foreground w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  {/* Add more items */}
                  <button onClick={() => setStep("restaurant")}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border/60 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all touch-manipulation active:scale-[0.98]">
                    <Plus className="w-3.5 h-3.5" /> Add more items
                  </button>

                  {/* Utensils opt-out + calories */}
                  <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                    <button onClick={() => setNoUtensils(!noUtensils)}
                      className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", noUtensils ? "bg-emerald-500" : "bg-muted/60")}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", noUtensils ? "left-[18px]" : "left-0.5")} />
                    </button>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> Skip utensils</p>
                      <p className="text-[10px] text-muted-foreground">Help reduce plastic waste 🌍</p>
                    </div>
                  </div>

                  {/* Gift order toggle */}
                  <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                    <button onClick={() => setGiftOrder(!giftOrder)}
                      className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", giftOrder ? "bg-primary" : "bg-muted/60")}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", giftOrder ? "left-[18px]" : "left-0.5")} />
                    </button>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-primary" /> Send as gift</p>
                      <p className="text-[10px] text-muted-foreground">Add a personal message</p>
                    </div>
                  </div>
                  {giftOrder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <Input placeholder="Write a gift message..." value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="h-10 rounded-xl text-sm" />
                    </motion.div>
                  )}

                  <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-primary">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="font-bold">${serviceFee.toFixed(2)}</span></div>
                    {totalCalories > 0 && (
                      <div className="flex justify-between text-muted-foreground/60">
                        <span className="flex items-center gap-1 text-xs"><Flame className="w-3 h-3" /> Total calories</span>
                        <span className="text-xs font-medium">{totalCalories} cal</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-primary/60">
                      <span className="flex items-center gap-1 text-xs"><Award className="w-3 h-3" /> Loyalty points earned</span>
                      <span className="text-xs font-bold text-primary">+{Math.floor(cartTotal * loyaltyInfo.pointsPerDollar)} pts</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border/30">
                      <span className="font-bold text-base">Total</span>
                      <span className="font-bold text-xl text-primary">${(cartTotal + deliveryFee + serviceFee).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-2xl border-t border-border/30 safe-area-bottom">
                <Button onClick={() => setStep("checkout")} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]">
                  <CreditCard className="w-5 h-5" /> Checkout · ${(cartTotal + deliveryFee + serviceFee).toFixed(2)}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* CHECKOUT */}
        {step === "checkout" && (
          <motion.div key="checkout" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="min-h-screen pb-32">
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-2xl border-b border-border/30">
              <div className="px-4 py-3 flex items-center gap-3 safe-area-top">
                <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack} className="w-10 h-10 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </motion.button>
                <h1 className="text-base font-bold text-foreground">Checkout</h1>
              </div>
              <EatsStepIndicator currentStep="checkout" />
            </div>

            <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</h3>
                <Input placeholder="Enter delivery address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="h-12 rounded-xl" />
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Delivery instructions (e.g., buzz #204)" value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className="h-10 rounded-xl text-sm" />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setContactlessDelivery(!contactlessDelivery)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", contactlessDelivery ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", contactlessDelivery ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <p className="text-xs font-medium text-foreground">Contactless delivery</p>
                </div>
              </div>

              {/* Schedule delivery */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setScheduledDelivery(!scheduledDelivery)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", scheduledDelivery ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", scheduledDelivery ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Schedule delivery</p>
                    <p className="text-[10px] text-muted-foreground">{scheduledDelivery ? "Choose a time" : "ASAP delivery"}</p>
                  </div>
                </div>
                {scheduledDelivery && (
                  <div className="flex gap-2 mt-3">
                    {["12:00 PM", "1:00 PM", "5:00 PM", "7:00 PM"].map(t => (
                      <button key={t} onClick={() => setDeliveryTime(t)}
                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all touch-manipulation active:scale-95",
                          deliveryTime === t ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground border border-border/40"
                        )}>{t}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Group ordering */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3" /> Who's eating?
                </h3>
                <div className="flex gap-2">
                  {groupOrderOptions.map(opt => (
                    <button key={opt.id} onClick={() => setGroupSize(opt.id)}
                      className={cn("flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        groupSize === opt.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      <span className="text-base">{opt.icon}</span>
                      <span className="text-[10px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery speed */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-3 h-3" /> Delivery speed
                </h3>
                <div className="space-y-2">
                  {eatsDeliveryOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedDeliverySpeed(opt.id)}
                      className={cn("w-full flex items-center justify-between p-3 rounded-xl transition-all touch-manipulation active:scale-[0.98]",
                        selectedDeliverySpeed === opt.id ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border/30")}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{opt.label}</span>
                        {opt.badge && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">{opt.time}</span>
                        {opt.extraCost > 0 && <span className="text-[10px] text-primary font-bold block">+${opt.extraCost.toFixed(2)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>



              {/* Split Bill */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setSplitBill(!splitBill)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", splitBill ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", splitBill ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> Split the bill</p>
                    <p className="text-[10px] text-muted-foreground">Divide equally among friends</p>
                  </div>
                </div>
                {splitBill && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">Split with:</span>
                    {[2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSplitBillCount(n)}
                        className={cn("w-8 h-8 rounded-full text-xs font-bold transition-all touch-manipulation",
                          splitBillCount === n ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
                        {n}
                      </button>
                    ))}
                    <span className="text-[10px] text-primary font-bold ml-auto">${(cartTotal / splitBillCount).toFixed(2)} each</span>
                  </motion.div>
                )}
              </div>

              {/* Loyalty Stamps */}
              <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500" /> Loyalty Stamps</p>
                  <span className="text-[10px] text-primary font-bold">{loyaltyStamps}/10</span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all",
                      i < loyaltyStamps ? "bg-amber-500 text-primary-foreground" : "bg-muted/40 text-muted-foreground/40")}>
                      {i < loyaltyStamps ? "★" : "☆"}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{10 - loyaltyStamps} more orders for a free meal! 🎉</p>
              </div>

              {/* Substitute Preference */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> If item unavailable
                </h3>
                <div className="flex gap-2">
                  {([
                    { id: "contact" as const, label: "Contact me", icon: "📱" },
                    { id: "similar" as const, label: "Similar item", icon: "🔄" },
                    { id: "refund" as const, label: "Refund", icon: "💰" },
                  ]).map(opt => (
                    <button key={opt.id} onClick={() => setSubstitutePreference(opt.id)}
                      className={cn("flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        substitutePreference === opt.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      <span>{opt.icon}</span>
                      <span className="text-[10px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition Mode */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => setNutritionMode(!nutritionMode)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", nutritionMode ? "bg-emerald-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", nutritionMode ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">🥗 Nutrition tracking mode</p>
                  <p className="text-[10px] text-muted-foreground">Show detailed macros & vitamins for each item</p>
                </div>
              </div>

              {/* Mood Quiz */}
              <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-500/20 p-4">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">🎯 What's your food mood?</p>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: "comfort" as const, emoji: "🍔", label: "Comfort" },
                    { id: "healthy" as const, emoji: "🥗", label: "Healthy" },
                    { id: "adventurous" as const, emoji: "🌮", label: "Adventurous" },
                    { id: "quick" as const, emoji: "⚡", label: "Quick bite" },
                  ]).map(m => (
                    <button key={m.id} onClick={() => { setMoodQuiz(m.id); toast.info(`${m.emoji} Showing ${m.label.toLowerCase()} picks!`); }}
                      className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold transition-all touch-manipulation active:scale-95",
                        moodQuiz === m.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergy Passport */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Allergy Passport</p>
                <div className="flex gap-2 flex-wrap">
                  {["Dairy", "Gluten", "Nuts", "Shellfish", "Egg", "Soy"].map(a => (
                    <button key={a} onClick={() => setAllergyPassport(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                      className={cn("px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all touch-manipulation active:scale-95",
                        allergyPassport.includes(a) ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      {allergyPassport.includes(a) ? "⚠️ " : ""}{a}
                    </button>
                  ))}
                </div>
                {allergyPassport.length > 0 && (
                  <p className="text-[10px] text-red-500 mt-2 font-medium">Items with {allergyPassport.join(", ")} will be flagged</p>
                )}
              </div>

              {/* Catering Mode */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setCateringMode(!cateringMode)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", cateringMode ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", cateringMode ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">🏢 Catering mode</p>
                    <p className="text-[10px] text-muted-foreground">Large order with platters & setup</p>
                  </div>
                </div>
                {cateringMode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                    <p className="text-[10px] text-muted-foreground mb-1">Headcount</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCateringHeadcount(Math.max(5, cateringHeadcount - 5))}
                        className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-foreground font-bold touch-manipulation">-</button>
                      <span className="text-sm font-bold text-foreground">{cateringHeadcount} people</span>
                      <button onClick={() => setCateringHeadcount(cateringHeadcount + 5)}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold touch-manipulation">+</button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Dine-In Option */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => { setDineInOption(!dineInOption); if (!dineInOption) toast.info("🍽️ Switched to dine-in — skip delivery!"); }}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", dineInOption ? "bg-primary" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", dineInOption ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5 text-primary" /> Dine-in instead</p>
                  <p className="text-[10px] text-muted-foreground">Order ahead & eat at the restaurant</p>
                </div>
              </div>

              {/* Meal Reminder */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => { setMealReminder(!mealReminder); if (!mealReminder) toast.success("⏰ We'll remind you to order at your usual time!"); }}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", mealReminder ? "bg-primary" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", mealReminder ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-primary" /> Daily meal reminder</p>
                  <p className="text-[10px] text-muted-foreground">Get nudged at your usual lunch/dinner time</p>
                </div>
              </div>

              {/* Restaurant Chat */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <button onClick={() => setRestaurantChat(!restaurantChat)}
                  className="w-full flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-primary" /> Chat with restaurant</p>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", restaurantChat && "rotate-90")} />
                </button>
                <AnimatePresence>
                  {restaurantChat && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn("rounded-xl px-3 py-2 text-xs max-w-[80%]",
                            msg.from === "restaurant" ? "bg-muted/50 text-foreground" : "bg-primary text-primary-foreground ml-auto")}>
                            {msg.text}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input value={restaurantChatInput} onChange={e => setRestaurantChatInput(e.target.value)}
                          placeholder="Type a message..." className="h-8 text-xs" />
                        <button onClick={() => {
                          if (restaurantChatInput.trim()) {
                            setChatMessages(prev => [...prev, { from: "user", text: restaurantChatInput }]);
                            setRestaurantChatInput("");
                            setTimeout(() => setChatMessages(prev => [...prev, { from: "restaurant", text: "Got it! We'll take care of that. 👍" }]), 1000);
                          }
                        }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95">
                          Send
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scheduled Order */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setScheduledOrder(!scheduledOrder)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", scheduledOrder ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", scheduledOrder ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Schedule for later</p>
                    <p className="text-[10px] text-muted-foreground">Pick a delivery time</p>
                  </div>
                </div>
                {scheduledOrder && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                    <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="h-9 text-xs" />
                  </motion.div>
                )}
              </div>

              {/* Cuisine Roulette */}
              <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 to-amber-500/10 border border-pink-500/20 p-4">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">🎰 Feeling lucky?</p>
                <button onClick={() => {
                  const cuisines = ["Japanese", "Italian", "Mexican", "Indian", "Thai", "Chinese", "Mediterranean", "Korean"];
                  const pick = cuisines[Math.floor(Math.random() * cuisines.length)];
                  setRouletteResult(pick);
                  toast.success(`🎲 The wheel says: ${pick}!`);
                }} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold touch-manipulation active:scale-95 transition-all">
                  {rouletteResult ? `🎲 ${rouletteResult} — Spin again?` : "🎲 Spin the cuisine wheel!"}
                </button>
              </div>

              {/* Gift Order */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setGiftOrder(!giftOrder)}
                    className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", giftOrder ? "bg-pink-500" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", giftOrder ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-pink-500" /> Send as gift</p>
                    <p className="text-[10px] text-muted-foreground">Surprise someone with food 🎁</p>
                  </div>
                </div>
                {giftOrder && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-2">
                    <Input value={giftRecipient} onChange={e => setGiftRecipient(e.target.value)} placeholder="Recipient name or address" className="h-9 text-xs" />
                    <Input value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="Add a gift message..." className="h-9 text-xs" />
                  </motion.div>
                )}
              </div>

              {/* Diet Goal */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">🎯 Diet goal</p>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: "none" as const, label: "None" },
                    { id: "low-cal" as const, label: "🔥 Low-Cal" },
                    { id: "high-protein" as const, label: "💪 High Protein" },
                    { id: "low-carb" as const, label: "🥑 Low Carb" },
                  ]).map(d => (
                    <button key={d.id} onClick={() => setDietGoal(d.id)}
                      className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold transition-all touch-manipulation active:scale-95",
                        dietGoal === d.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Streak */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 p-4">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2"><Flame className="w-3.5 h-3.5 text-amber-500" /> Order streak</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all" style={{ width: `${(orderStreak / maxStreak) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-amber-500">{orderStreak}/{maxStreak} 🔥</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Keep ordering to earn free delivery!</p>
              </div>

              {/* Cuisine Stats */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <button onClick={() => setShowCuisineStats(!showCuisineStats)} className="w-full flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary" /> Your cuisine breakdown</p>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showCuisineStats && "rotate-90")} />
                </button>
                <AnimatePresence>
                  {showCuisineStats && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 mt-3">
                        {cuisineStats.map(s => (
                          <div key={s.cuisine} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-foreground w-16">{s.cuisine}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${s.pct}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-8">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Past Orders Quick Reorder */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <button onClick={() => setShowReorderHistory(!showReorderHistory)} className="w-full flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-primary" /> Quick reorder</p>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showReorderHistory && "rotate-90")} />
                </button>
                <AnimatePresence>
                  {showReorderHistory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 mt-3">
                        {pastOrders.map(o => (
                          <button key={o.id} onClick={() => toast.info(`Reordering from ${o.restaurant}...`)}
                            className="w-full rounded-xl bg-muted/30 p-3 text-left hover:bg-muted/50 transition-colors touch-manipulation">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-foreground">{o.restaurant}</p>
                                <p className="text-[10px] text-muted-foreground">{o.items} · {o.date}</p>
                              </div>
                              <span className="text-xs font-bold text-primary">{o.total}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Eco packaging + curbside */}
              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => setEcoPackaging(!ecoPackaging)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", ecoPackaging ? "bg-emerald-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", ecoPackaging ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> Eco-friendly packaging</p>
                  <p className="text-[10px] text-muted-foreground">Biodegradable containers 🌱</p>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <button onClick={() => setCurbsidePickup(!curbsidePickup)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", curbsidePickup ? "bg-primary" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", curbsidePickup ? "left-[18px]" : "left-0.5")} />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Curbside pickup instead</p>
                  <p className="text-[10px] text-muted-foreground">Pick up at the restaurant · No delivery fee</p>
                </div>
              </div>

              {/* Order summary */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-primary" /> Order Summary</h3>
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Heart className="w-3 h-3" /> Tip Your Driver
                </h3>
                <div className="flex gap-2">
                  {tipOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedTip(opt.id)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                        selectedTip === opt.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                      )}>{opt.label}</button>
                  ))}
                </div>
                {tipAmount > 0 && <p className="text-xs text-primary font-medium mt-2">Tip: ${tipAmount.toFixed(2)}</p>}
              </div>

              {/* Promo */}
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Gift className="w-3 h-3" /> Promo Code
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter code (try EATS10)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied} className="h-10 rounded-xl flex-1 text-sm" />
                  <Button variant={promoApplied ? "outline" : "default"} size="sm" onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()} className="rounded-xl h-10 px-4 text-xs font-bold">
                    {promoApplied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied</> : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Final total */}
              <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-bold">{deliveryFee === 0 ? <span className="text-primary">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="font-bold">${serviceFee.toFixed(2)}</span></div>
                {tipAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Driver tip</span><span className="font-bold">${tipAmount.toFixed(2)}</span></div>}
                {promoDiscount > 0 && <div className="flex justify-between text-primary"><span className="font-bold flex items-center gap-1"><Percent className="w-3 h-3" /> Promo</span><span className="font-bold">-${promoDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between pt-3 border-t border-border/30">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-xl text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* ETA */}
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {scheduledDelivery ? `Scheduled: ${deliveryTime}` : `Estimated delivery: ${currentRestaurant ? `${currentRestaurant.prepTime + 10}-${currentRestaurant.prepTime + 20} min` : "25-35 min"}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Your order will be prepared fresh</p>
                </div>
              </div>

              <Button onClick={() => { notifyEats("order_placed", { orderId: orderNumber, restaurantName: currentRestaurant?.name }); setStep("confirmation"); }} className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]" disabled={!deliveryAddress.trim()}>
                <CheckCircle className="w-5 h-5" /> Place Order · ${grandTotal.toFixed(2)}
              </Button>
            </div>
          </motion.div>
        )}

        {/* CONFIRMATION */}
        {step === "confirmation" && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                <PartyPopper className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed! 🎉</h1>
                <p className="text-muted-foreground">Your food is being prepared</p>
                <p className="text-xs font-mono text-primary/80 mt-2 bg-primary/5 px-3 py-1.5 rounded-full inline-block">Order #{orderNumber}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl bg-card border border-border/40 p-4 text-left">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-primary" /> Live Tracking</h3>
                <OrderTrackingTimeline orderNumber={orderNumber} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="rounded-2xl bg-card border border-border/40 p-5 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Navigation className="w-5 h-5 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground">Delivering to</p><p className="text-sm font-bold text-foreground">{deliveryAddress}</p></div>
                </div>
                {contactlessDelivery && (
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                    <CheckCircle className="w-3 h-3" /> Contactless delivery
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-500" /></div>
                  <div><p className="text-xs text-muted-foreground">Total charged</p><p className="text-sm font-bold text-primary">${grandTotal.toFixed(2)}</p></div>
                </div>
              </motion.div>

              {/* Rate order */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => { setRateOrder(s); toast.success(`Rated ${s} stars! Thank you!`); }}
                      className="touch-manipulation active:scale-90 transition-transform">
                      <Star className={cn("w-8 h-8 transition-all", rateOrder && s <= rateOrder ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                <Button variant="outline" onClick={handleReorder} className="flex-1 h-12 rounded-xl font-bold gap-2">
                  <RefreshCw className="w-4 h-4" /> Reorder
                </Button>
                <Button onClick={handleShareOrder} className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </motion.div>
              <Button variant="ghost" onClick={() => navigate("/")} className="text-sm text-muted-foreground">
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* === WAVE 3: Discovery & Intelligence Sections (browse step) === */}
      {step === "browse" && (
        <div className="container mx-auto px-4 pb-8 space-y-4">
          {/* Taste Profile */}
          <button onClick={() => setShowTasteProfile(!showTasteProfile)}
            className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Your Taste Profile
            <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[8px] ml-auto">AI</Badge>
            <ChevronRight className={cn("w-3 h-3 transition-transform", showTasteProfile && "rotate-90")} />
          </button>
          {showTasteProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card border border-amber-500/20 p-4 space-y-3">
              <div className="space-y-2">
                {Object.entries({ Spicy: tasteProfile.spicy, Sweet: tasteProfile.sweet, Savory: tasteProfile.savory, Umami: tasteProfile.umami }).map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-12">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-8 text-right">{val}%</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 text-center p-2 rounded-xl bg-muted/30"><p className="text-xs font-bold text-foreground">{tasteProfile.adventureScore}%</p><p className="text-[9px] text-muted-foreground">Adventure</p></div>
                <div className="flex-1 text-center p-2 rounded-xl bg-muted/30"><p className="text-xs font-bold text-foreground">{tasteProfile.healthScore}%</p><p className="text-[9px] text-muted-foreground">Health</p></div>
              </div>
            </motion.div>
          )}

          {/* Food Safety Scores */}
          <button onClick={() => setShowFoodSafety(!showFoodSafety)}
            className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Food Safety Scores
            <ChevronRight className={cn("w-3 h-3 ml-auto transition-transform", showFoodSafety && "rotate-90")} />
          </button>
          {showFoodSafety && (
            <div className="space-y-2">
              {foodSafetyScores.map(r => (
                <div key={r.restaurant} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                  <span className="text-lg">{r.icon}</span>
                  <div className="flex-1"><p className="text-xs font-bold text-foreground">{r.restaurant}</p><p className="text-[10px] text-muted-foreground">Inspected {r.lastInspection}</p></div>
                  <div className="text-center"><p className="text-sm font-bold text-emerald-500">{r.grade}</p><p className="text-[9px] text-muted-foreground">{r.score}/100</p></div>
                </div>
              ))}
            </div>
          )}

          {/* Restaurant Awards */}
          <button onClick={() => setShowRestaurantAwards(!showRestaurantAwards)}
            className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Restaurant Awards
            <ChevronRight className={cn("w-3 h-3 ml-auto transition-transform", showRestaurantAwards && "rotate-90")} />
          </button>
          {showRestaurantAwards && (
            <div className="space-y-2">
              {restaurantAwards.map(a => (
                <div key={a.restaurant} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1"><p className="text-xs font-bold text-foreground">{a.restaurant}</p><p className="text-[10px] text-amber-500 font-bold">{a.award}</p><p className="text-[9px] text-muted-foreground">{a.org}</p></div>
                </div>
              ))}
            </div>
          )}

          {/* Spending Insights */}
          <button onClick={() => setShowSpendingInsights(!showSpendingInsights)}
            className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Spending Insights
            <ChevronRight className={cn("w-3 h-3 ml-auto transition-transform", showSpendingInsights && "rotate-90")} />
          </button>
          {showSpendingInsights && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 rounded-xl bg-muted/30"><p className="text-sm font-bold text-foreground">${spendingInsights.thisMonth}</p><p className="text-[9px] text-muted-foreground">This month</p></div>
                <div className="text-center p-2 rounded-xl bg-muted/30"><p className="text-sm font-bold text-foreground">${spendingInsights.avgOrderValue}</p><p className="text-[9px] text-muted-foreground">Avg order</p></div>
                <div className="text-center p-2 rounded-xl bg-emerald-500/10"><p className="text-sm font-bold text-emerald-500">${spendingInsights.savingsFromDeals}</p><p className="text-[9px] text-muted-foreground">Saved from deals</p></div>
                <div className="text-center p-2 rounded-xl bg-amber-500/10"><p className="text-sm font-bold text-amber-500">{spendingInsights.loyaltyValue}</p><p className="text-[9px] text-muted-foreground">Loyalty value</p></div>
              </div>
            </div>
          )}

          {/* Meal Planner */}
          <button onClick={() => setShowMealPlanner(!showMealPlanner)}
            className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">
            <Calendar className="w-3.5 h-3.5 text-violet-500" /> AI Meal Planner
            <Badge className="bg-violet-500/10 text-violet-500 border-0 text-[8px] ml-auto">NEW</Badge>
            <ChevronRight className={cn("w-3 h-3 transition-transform", showMealPlanner && "rotate-90")} />
          </button>
          {showMealPlanner && (
            <div className="space-y-2">
              {mealPlanSuggestions.map(m => (
                <div key={m.day} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-500">{m.day}</div>
                  <div className="flex-1"><p className="text-xs font-bold text-foreground">{m.meal}</p><p className="text-[10px] text-muted-foreground">{m.restaurant} · {m.cal} cal</p></div>
                  <span className="text-xs font-bold text-primary">${m.price}</span>
                </div>
              ))}
              <button onClick={() => toast.success("🍽️ Meal plan saved!")} className="w-full py-2 rounded-xl bg-violet-500/10 text-violet-500 text-xs font-bold border border-violet-500/20">
                Save Meal Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * GroceryCategoryBrowser - Massive category browser with lazy-loaded product carousels
 * Categories only fetch products when scrolled into view (IntersectionObserver)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Check, ChevronRight, Loader2, ShoppingBag, ChevronDown } from "lucide-react";
import type { StoreName } from "@/config/groceryStores";
import { getStoreConfig } from "@/config/groceryStores";
import type { StoreProduct } from "@/hooks/useStoreSearch";
import { Skeleton } from "@/components/ui/skeleton";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://slirphzzwcogdbkeicff.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI";

const CATEGORIES = [
  // 🥩 Meat & Protein
  { emoji: "🥩", label: "Fresh Beef", query: "fresh beef steak ground beef", gradient: "from-rose-500/10 to-rose-400/5" },
  { emoji: "🍗", label: "Chicken & Poultry", query: "fresh chicken breast wings thighs", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥓", label: "Pork & Bacon", query: "pork chops bacon sausage ham", gradient: "from-rose-400/10 to-rose-300/5" },
  { emoji: "🐟", label: "Fresh Seafood", query: "salmon shrimp tilapia fish", gradient: "from-blue-500/10 to-blue-400/5" },
  { emoji: "🦃", label: "Turkey & Ground", query: "turkey ground turkey deli meat", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🌭", label: "Hot Dogs & Sausage", query: "hot dogs sausage bratwurst kielbasa", gradient: "from-red-400/10 to-red-300/5" },

  // 🥦 Fresh Produce
  { emoji: "🍎", label: "Fresh Fruits", query: "apple banana orange strawberry grapes", gradient: "from-red-500/10 to-red-400/5" },
  { emoji: "🥦", label: "Fresh Vegetables", query: "broccoli carrots lettuce tomato onion", gradient: "from-emerald-500/10 to-emerald-400/5" },
  { emoji: "🥑", label: "Avocado & Guac", query: "avocado guacamole lime lemon", gradient: "from-green-500/10 to-green-400/5" },
  { emoji: "🍇", label: "Berries & Grapes", query: "strawberries blueberries raspberries grapes", gradient: "from-purple-500/10 to-purple-400/5" },
  { emoji: "🥬", label: "Salad & Greens", query: "salad mix spinach kale romaine lettuce", gradient: "from-lime-500/10 to-lime-400/5" },
  { emoji: "🧅", label: "Onions & Garlic", query: "onion garlic ginger shallot", gradient: "from-yellow-600/10 to-yellow-500/5" },
  { emoji: "🥔", label: "Potatoes & Root Veg", query: "potato sweet potato yam beet carrot", gradient: "from-amber-600/10 to-amber-500/5" },
  { emoji: "🌽", label: "Corn & Squash", query: "corn squash zucchini cucumber", gradient: "from-yellow-500/10 to-yellow-400/5" },
  { emoji: "🍄", label: "Mushrooms & Herbs", query: "mushroom herbs basil cilantro parsley", gradient: "from-stone-500/10 to-stone-400/5" },
  { emoji: "🌶️", label: "Peppers & Chili", query: "bell pepper jalapeno habanero chili", gradient: "from-red-600/10 to-red-500/5" },
  { emoji: "🍅", label: "Tomatoes", query: "tomato cherry tomato roma grape tomato", gradient: "from-red-500/10 to-red-400/5" },

  // 🥛 Dairy & Eggs
  { emoji: "🥛", label: "Milk", query: "whole milk 2% milk skim milk gallon", gradient: "from-sky-500/10 to-sky-400/5" },
  { emoji: "🧀", label: "Cheese", query: "cheddar cheese mozzarella american swiss", gradient: "from-yellow-500/10 to-yellow-400/5" },
  { emoji: "🥚", label: "Eggs", query: "eggs dozen large eggs organic eggs", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🧈", label: "Butter & Margarine", query: "butter margarine cream cheese spread", gradient: "from-yellow-400/10 to-yellow-300/5" },
  { emoji: "🍦", label: "Yogurt", query: "yogurt greek yogurt yoplait chobani", gradient: "from-pink-400/10 to-pink-300/5" },
  { emoji: "🍶", label: "Cream & Creamer", query: "heavy cream coffee creamer sour cream", gradient: "from-sky-300/10 to-sky-200/5" },

  // 🍞 Bakery
  { emoji: "🍞", label: "Bread & Loaves", query: "white bread wheat bread sourdough", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥐", label: "Rolls & Buns", query: "dinner rolls hamburger buns hot dog buns", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🧁", label: "Cakes & Cupcakes", query: "cake cupcake birthday cake dessert", gradient: "from-pink-500/10 to-pink-400/5" },
  { emoji: "🥧", label: "Pies & Pastries", query: "pie pastry croissant danish muffin", gradient: "from-amber-600/10 to-amber-500/5" },
  { emoji: "🍩", label: "Donuts & Bagels", query: "donut bagel english muffin", gradient: "from-orange-500/10 to-orange-400/5" },
  { emoji: "🍪", label: "Bakery Cookies", query: "cookies brownies bakery treats", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🫓", label: "Tortillas & Wraps", query: "tortilla wrap pita flatbread naan", gradient: "from-yellow-500/10 to-yellow-400/5" },

  // 🥤 Drinks & Beverages
  { emoji: "🥤", label: "Soda & Pop", query: "coca cola pepsi sprite mountain dew", gradient: "from-red-500/10 to-red-400/5" },
  { emoji: "💧", label: "Water", query: "bottled water spring water sparkling water", gradient: "from-sky-500/10 to-sky-400/5" },
  { emoji: "🧃", label: "Juice", query: "orange juice apple juice cranberry grape juice", gradient: "from-orange-500/10 to-orange-400/5" },
  { emoji: "☕", label: "Coffee", query: "folgers coffee maxwell house keurig pods", gradient: "from-amber-700/10 to-amber-600/5" },
  { emoji: "🍵", label: "Tea", query: "green tea black tea herbal tea lipton", gradient: "from-emerald-400/10 to-emerald-300/5" },
  { emoji: "⚡", label: "Energy Drinks", query: "red bull monster energy gatorade powerade", gradient: "from-lime-500/10 to-lime-400/5" },
  { emoji: "🥛", label: "Almond & Oat Milk", query: "almond milk oat milk soy milk coconut milk", gradient: "from-stone-400/10 to-stone-300/5" },
  { emoji: "🍺", label: "Beer", query: "beer bud light coors miller modelo", gradient: "from-yellow-600/10 to-yellow-500/5" },
  { emoji: "🍷", label: "Wine", query: "red wine white wine rose wine", gradient: "from-purple-600/10 to-purple-500/5" },
  { emoji: "🧊", label: "Lemonade & Iced Tea", query: "lemonade iced tea arizona simply lemonade", gradient: "from-yellow-400/10 to-yellow-300/5" },

  // 🍿 Snacks
  { emoji: "🍿", label: "Chips", query: "lays doritos cheetos pringles chips", gradient: "from-yellow-500/10 to-yellow-400/5" },
  { emoji: "🍪", label: "Cookies", query: "oreo chips ahoy cookies nutter butter", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥨", label: "Pretzels & Crackers", query: "pretzels goldfish crackers ritz cheez-it", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🥜", label: "Nuts & Trail Mix", query: "peanuts almonds cashews trail mix mixed nuts", gradient: "from-amber-600/10 to-amber-500/5" },
  { emoji: "🍫", label: "Chocolate & Candy", query: "chocolate snickers reeses m&ms candy bar", gradient: "from-amber-700/10 to-amber-600/5" },
  { emoji: "🍬", label: "Gummy & Sour Candy", query: "gummy bears sour patch haribo skittles", gradient: "from-pink-400/10 to-pink-300/5" },
  { emoji: "🧁", label: "Snack Cakes", query: "little debbie hostess snack cakes twinkies", gradient: "from-pink-500/10 to-pink-400/5" },
  { emoji: "🍘", label: "Popcorn", query: "popcorn microwave popcorn smartfood", gradient: "from-yellow-400/10 to-yellow-300/5" },
  { emoji: "🥤", label: "Dips & Salsa", query: "salsa queso dip hummus guacamole", gradient: "from-red-400/10 to-red-300/5" },
  { emoji: "🥢", label: "Jerky & Meat Snacks", query: "beef jerky slim jim meat sticks", gradient: "from-rose-500/10 to-rose-400/5" },

  // 🧊 Frozen
  { emoji: "🍕", label: "Frozen Pizza", query: "digiorno totinos frozen pizza red baron", gradient: "from-red-500/10 to-red-400/5" },
  { emoji: "🍦", label: "Ice Cream", query: "ice cream ben jerry haagen dazs popsicle", gradient: "from-pink-400/10 to-pink-300/5" },
  { emoji: "🥟", label: "Frozen Meals", query: "hungry man stouffers lean cuisine tv dinner", gradient: "from-blue-400/10 to-blue-300/5" },
  { emoji: "🍟", label: "Frozen Fries & Sides", query: "frozen french fries tater tots onion rings", gradient: "from-yellow-500/10 to-yellow-400/5" },
  { emoji: "🥦", label: "Frozen Vegetables", query: "frozen broccoli corn peas mixed vegetables", gradient: "from-emerald-400/10 to-emerald-300/5" },
  { emoji: "🍗", label: "Frozen Chicken", query: "frozen chicken nuggets tenders wings strips", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🧇", label: "Frozen Breakfast", query: "frozen waffles pancakes breakfast burrito", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🍨", label: "Frozen Treats", query: "popsicle ice cream sandwich drumstick", gradient: "from-cyan-400/10 to-cyan-300/5" },
  { emoji: "🐟", label: "Frozen Seafood", query: "frozen shrimp fish sticks salmon fillet", gradient: "from-blue-500/10 to-blue-400/5" },

  // 🍝 Pantry
  { emoji: "🍝", label: "Pasta & Noodles", query: "spaghetti pasta penne ramen noodles", gradient: "from-orange-500/10 to-orange-400/5" },
  { emoji: "🍚", label: "Rice & Grains", query: "white rice brown rice jasmine basmati quinoa", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🥫", label: "Canned Soup", query: "campbell soup chicken noodle tomato soup", gradient: "from-red-400/10 to-red-300/5" },
  { emoji: "🫘", label: "Canned Beans", query: "black beans kidney beans pinto chickpeas", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥫", label: "Canned Vegetables", query: "canned corn green beans tomatoes mushrooms", gradient: "from-green-400/10 to-green-300/5" },
  { emoji: "🍅", label: "Pasta Sauce", query: "ragu prego marinara alfredo pasta sauce", gradient: "from-red-500/10 to-red-400/5" },
  { emoji: "🥣", label: "Cereal", query: "cheerios frosted flakes lucky charms cereal", gradient: "from-sky-400/10 to-sky-300/5" },
  { emoji: "🥞", label: "Pancake & Syrup", query: "pancake mix syrup aunt jemima bisquick", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥜", label: "Peanut Butter & Jelly", query: "peanut butter jif skippy jelly jam", gradient: "from-amber-600/10 to-amber-500/5" },
  { emoji: "🫒", label: "Cooking Oil", query: "vegetable oil olive oil canola coconut oil", gradient: "from-yellow-500/10 to-yellow-400/5" },
  { emoji: "🧂", label: "Spices & Seasonings", query: "salt pepper garlic powder seasoning spice", gradient: "from-stone-500/10 to-stone-400/5" },
  { emoji: "🍯", label: "Honey & Spreads", query: "honey maple syrup nutella spread", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🥫", label: "Canned Tuna & Meat", query: "canned tuna chicken spam vienna sausage", gradient: "from-blue-400/10 to-blue-300/5" },
  { emoji: "🍜", label: "Ramen & Instant Noodles", query: "ramen maruchan cup noodles instant noodle", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🫙", label: "Pickles & Olives", query: "pickles olives relish peppers jalapeno jar", gradient: "from-green-500/10 to-green-400/5" },

  // 🧈 Condiments & Sauces
  { emoji: "🍅", label: "Ketchup & Mustard", query: "ketchup mustard heinz french", gradient: "from-red-500/10 to-red-400/5" },
  { emoji: "🥫", label: "BBQ & Hot Sauce", query: "bbq sauce hot sauce sriracha buffalo sauce", gradient: "from-red-600/10 to-red-500/5" },
  { emoji: "🥗", label: "Salad Dressing", query: "ranch dressing italian caesar vinaigrette", gradient: "from-green-400/10 to-green-300/5" },
  { emoji: "🫘", label: "Soy Sauce & Asian", query: "soy sauce teriyaki hoisin sesame oil", gradient: "from-amber-700/10 to-amber-600/5" },
  { emoji: "🥄", label: "Mayo & Miracle Whip", query: "mayonnaise miracle whip hellmanns", gradient: "from-yellow-300/10 to-yellow-200/5" },

  // 🌮 International Foods
  { emoji: "🌮", label: "Mexican Food", query: "taco shells salsa tortilla chips queso refried beans", gradient: "from-lime-500/10 to-lime-400/5" },
  { emoji: "🍜", label: "Asian Food", query: "soy sauce rice noodles stir fry teriyaki tofu", gradient: "from-red-400/10 to-red-300/5" },
  { emoji: "🍛", label: "Indian Food", query: "curry naan tikka masala basmati rice", gradient: "from-orange-500/10 to-orange-400/5" },
  { emoji: "🥙", label: "Mediterranean", query: "hummus pita falafel olive oil feta", gradient: "from-emerald-400/10 to-emerald-300/5" },
  { emoji: "🍚", label: "Hispanic & Latino", query: "goya beans adobo sofrito plantain mole", gradient: "from-yellow-500/10 to-yellow-400/5" },

  // 🥣 Breakfast
  { emoji: "🥣", label: "Oatmeal & Granola", query: "oatmeal granola quaker instant oats", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🥞", label: "Frozen Waffles", query: "eggo waffles frozen pancakes french toast", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🥓", label: "Breakfast Meat", query: "bacon breakfast sausage ham links patties", gradient: "from-rose-400/10 to-rose-300/5" },
  { emoji: "🧇", label: "Pop Tarts & Bars", query: "pop tarts granola bar breakfast bar nutri grain", gradient: "from-pink-400/10 to-pink-300/5" },

  // 🧴 Personal Care
  { emoji: "🧴", label: "Shampoo & Hair", query: "shampoo conditioner hair gel head shoulders", gradient: "from-teal-500/10 to-teal-400/5" },
  { emoji: "🪥", label: "Dental Care", query: "toothpaste toothbrush mouthwash colgate crest", gradient: "from-sky-400/10 to-sky-300/5" },
  { emoji: "🧼", label: "Body Wash & Soap", query: "body wash dove soap bar soap irish spring", gradient: "from-blue-400/10 to-blue-300/5" },
  { emoji: "💊", label: "Deodorant", query: "deodorant antiperspirant old spice secret", gradient: "from-indigo-400/10 to-indigo-300/5" },
  { emoji: "🧴", label: "Lotion & Skin Care", query: "lotion moisturizer sunscreen chapstick", gradient: "from-pink-300/10 to-pink-200/5" },
  { emoji: "🪒", label: "Razors & Shaving", query: "razors shaving cream gillette venus", gradient: "from-slate-500/10 to-slate-400/5" },
  { emoji: "🩹", label: "First Aid", query: "band aid bandage neosporin hydrogen peroxide", gradient: "from-red-300/10 to-red-200/5" },

  // 💊 Health & Wellness
  { emoji: "💊", label: "Pain Relief", query: "tylenol advil ibuprofen aspirin pain relief", gradient: "from-blue-500/10 to-blue-400/5" },
  { emoji: "🫁", label: "Cold & Flu", query: "dayquil nyquil cough syrup cold medicine", gradient: "from-teal-400/10 to-teal-300/5" },
  { emoji: "💊", label: "Vitamins", query: "multivitamin vitamin c d3 b12 fish oil", gradient: "from-emerald-400/10 to-emerald-300/5" },
  { emoji: "🤧", label: "Allergy Medicine", query: "claritin zyrtec benadryl allegra allergy", gradient: "from-violet-400/10 to-violet-300/5" },
  { emoji: "🩹", label: "Stomach & Digestive", query: "tums pepto bismol gas-x antacid probiotic", gradient: "from-pink-400/10 to-pink-300/5" },

  // 🧹 Household & Cleaning
  { emoji: "🧻", label: "Toilet Paper", query: "charmin toilet paper cottonelle angel soft", gradient: "from-sky-300/10 to-sky-200/5" },
  { emoji: "🧻", label: "Paper Towels", query: "bounty paper towels brawny viva", gradient: "from-blue-300/10 to-blue-200/5" },
  { emoji: "🧽", label: "Dish Soap & Sponge", query: "dawn dish soap palmolive sponge scrubber", gradient: "from-green-400/10 to-green-300/5" },
  { emoji: "🧹", label: "Laundry Detergent", query: "tide gain laundry detergent downy fabric softener", gradient: "from-indigo-500/10 to-indigo-400/5" },
  { emoji: "🧴", label: "All Purpose Cleaner", query: "lysol clorox windex mr clean spray cleaner", gradient: "from-teal-400/10 to-teal-300/5" },
  { emoji: "🗑️", label: "Trash Bags", query: "glad trash bags hefty garbage bag kitchen bag", gradient: "from-slate-400/10 to-slate-300/5" },
  { emoji: "🧹", label: "Broom & Mop", query: "swiffer broom mop dust pan floor cleaner", gradient: "from-violet-400/10 to-violet-300/5" },
  { emoji: "🧤", label: "Bleach & Disinfectant", query: "clorox bleach disinfectant spray wipes", gradient: "from-yellow-400/10 to-yellow-300/5" },
  { emoji: "📦", label: "Aluminum Foil & Wrap", query: "aluminum foil plastic wrap parchment paper ziploc", gradient: "from-slate-500/10 to-slate-400/5" },
  { emoji: "🍽️", label: "Paper Plates & Cups", query: "paper plates cups plastic utensils napkins", gradient: "from-amber-300/10 to-amber-200/5" },

  // 🍼 Baby
  { emoji: "🍼", label: "Baby Formula", query: "similac enfamil baby formula infant", gradient: "from-pink-400/10 to-pink-300/5" },
  { emoji: "👶", label: "Diapers & Wipes", query: "pampers huggies diapers baby wipes", gradient: "from-blue-300/10 to-blue-200/5" },
  { emoji: "🍼", label: "Baby Food", query: "gerber baby food baby snacks puffs", gradient: "from-green-300/10 to-green-200/5" },
  { emoji: "🧴", label: "Baby Care", query: "baby lotion shampoo bath soap johnson", gradient: "from-pink-300/10 to-pink-200/5" },

  // 🐶 Pets
  { emoji: "🐶", label: "Dog Food", query: "pedigree purina dog food kibble treats", gradient: "from-amber-500/10 to-amber-400/5" },
  { emoji: "🐱", label: "Cat Food", query: "meow mix friskies cat food litter treats", gradient: "from-orange-400/10 to-orange-300/5" },
  { emoji: "🦴", label: "Pet Treats", query: "dog treats milk bone greenies pet snacks", gradient: "from-amber-400/10 to-amber-300/5" },
  { emoji: "🐾", label: "Pet Supplies", query: "pet toy leash collar bed pet supplies", gradient: "from-stone-400/10 to-stone-300/5" },

  // 🏠 Home & Garden
  { emoji: "💡", label: "Light Bulbs", query: "led light bulbs lamp batteries flashlight", gradient: "from-yellow-400/10 to-yellow-300/5" },
  { emoji: "🔋", label: "Batteries", query: "duracell energizer aa aaa batteries 9v", gradient: "from-green-500/10 to-green-400/5" },
  { emoji: "🌸", label: "Air Freshener", query: "febreze glade air freshener candle room spray", gradient: "from-fuchsia-400/10 to-fuchsia-300/5" },
  { emoji: "🌻", label: "Flowers & Plants", query: "flowers bouquet potted plant garden soil seeds", gradient: "from-emerald-400/10 to-emerald-300/5" },
  { emoji: "🧯", label: "Bug & Pest Control", query: "raid ant killer roach spray bug repellent", gradient: "from-red-400/10 to-red-300/5" },

  // 🎉 Party & Seasonal
  { emoji: "🎈", label: "Party Supplies", query: "balloons party plates cups decorations birthday", gradient: "from-pink-500/10 to-pink-400/5" },
  { emoji: "🎁", label: "Gift Cards & Wrap", query: "gift card wrapping paper gift bag tissue paper", gradient: "from-violet-500/10 to-violet-400/5" },
  { emoji: "🧊", label: "Ice & Coolers", query: "bag ice cooler ice chest styrofoam cups", gradient: "from-cyan-400/10 to-cyan-300/5" },

  // 🧰 Misc Essentials
  { emoji: "🧴", label: "Hand Soap & Sanitizer", query: "hand soap hand sanitizer purell softsoap", gradient: "from-teal-400/10 to-teal-300/5" },
  { emoji: "🩹", label: "Feminine Care", query: "tampons pads feminine hygiene always kotex", gradient: "from-pink-400/10 to-pink-300/5" },
  { emoji: "🧻", label: "Tissues & Kleenex", query: "kleenex tissues facial tissue puffs", gradient: "from-sky-300/10 to-sky-200/5" },
  { emoji: "📰", label: "Office & School", query: "pens pencils notebook paper glue tape", gradient: "from-blue-400/10 to-blue-300/5" },
];

interface CategorySectionProps {
  category: typeof CATEGORIES[0];
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
  index: number;
}

function CategorySection({ category, store, onAdd, cartProductIds, onBrowse, index }: CategorySectionProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

  // Lazy load: only fetch when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || fetched.current) return;
    fetched.current = true;

    const cfg = getStoreConfig(store);
    const baseUrl = `${SUPABASE_URL}/functions/v1/${cfg.edgeFunction}`;
    const headers = { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY };

    // Fetch page 1 and page 2 in parallel for more products
    Promise.all([
      fetch(`${baseUrl}?q=${encodeURIComponent(category.query)}&page=1`, { headers }).then((r) => r.json()).catch(() => ({ products: [] })),
      fetch(`${baseUrl}?q=${encodeURIComponent(category.query)}&page=2`, { headers }).then((r) => r.json()).catch(() => ({ products: [] })),
    ])
      .then(([data1, data2]) => {
        const all = [...(data1.products || []), ...(data2.products || [])];
        const seen = new Set<string>();
        const unique = all.filter((p: any) => {
          if (seen.has(p.productId)) return false;
          seen.add(p.productId);
          return true;
        });
        const items: StoreProduct[] = unique.slice(0, 25).map((p: any) => ({ ...p, store }));
        setProducts(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isVisible, store, category.query]);

  const handleAdd = (p: StoreProduct) => {
    onAdd(p);
    setAddedIds((prev) => new Set(prev).add(p.productId));
    setTimeout(() => setAddedIds((prev) => { const next = new Set(prev); next.delete(p.productId); return next; }), 800);
  };

  if (!loading && products.length === 0 && isVisible) return null;

  return (
    <div ref={containerRef} className="pt-4 pb-1">
      {!isVisible ? (
        // Placeholder before visible
        <div className="flex items-center gap-2 mb-3 px-4">
          <div className={`flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br ${category.gradient}`}>
            <span className="text-sm">{category.emoji}</span>
          </div>
          <span className="text-[13px] font-bold text-foreground tracking-tight">{category.label}</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3 px-4">
            <div className={`flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br ${category.gradient}`}>
              <span className="text-sm">{category.emoji}</span>
            </div>
            <span className="text-[13px] font-bold text-foreground tracking-tight">{category.label}</span>
            <button
              onClick={() => onBrowse(category.query)}
              className="ml-auto flex items-center gap-0.5 text-[10px] text-primary font-semibold hover:underline group"
            >
              See all <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="flex gap-2.5 px-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[130px] rounded-2xl border border-border/20 overflow-hidden">
                  <div className="h-[90px] bg-muted/20 animate-pulse" />
                  <div className="p-2 space-y-1.5">
                    <div className="h-2.5 w-full bg-muted/30 rounded animate-pulse" />
                    <div className="h-3.5 w-14 bg-muted/30 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex gap-2.5 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
            >
              {products.map((p, i) => {
                const inCart = cartProductIds.has(p.productId);
                const justAdded = addedIds.has(p.productId);
                return (
                  <motion.div
                    key={p.productId}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 24 }}
                    className="snap-start shrink-0 w-[130px] rounded-2xl border border-border/30 bg-card overflow-hidden group hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`relative h-[90px] bg-gradient-to-br ${category.gradient} flex items-center justify-center p-2.5`}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/10" />
                      )}
                      <span className={`absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-destructive"}`} />
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-[10px] font-semibold line-clamp-2 text-foreground/90 leading-tight min-h-[24px]">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-extrabold text-foreground">${p.price.toFixed(2)}</span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleAdd(p)}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            inCart || justAdded
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                              : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15"
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {justAdded ? (
                              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Check className="h-3 w-3" />
                              </motion.div>
                            ) : (
                              <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Plus className="h-3 w-3" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

interface GroceryCategoryBrowserProps {
  store: StoreName;
  onAdd: (product: StoreProduct) => void;
  cartProductIds: Set<string>;
  onBrowse: (query: string) => void;
}

export function GroceryCategoryBrowser({ store, onAdd, cartProductIds, onBrowse }: GroceryCategoryBrowserProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const STEP = 15;

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2 px-4 pt-5 pb-1">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <span className="text-[14px] font-bold text-foreground tracking-tight">Browse by Category</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{CATEGORIES.length} categories</span>
      </div>

      {CATEGORIES.slice(0, visibleCount).map((cat, i) => (
        <CategorySection
          key={cat.label}
          category={cat}
          store={store}
          onAdd={onAdd}
          cartProductIds={cartProductIds}
          onBrowse={onBrowse}
          index={i}
        />
      ))}

      {visibleCount < CATEGORIES.length && (
        <div className="px-4 pt-2 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, CATEGORIES.length))}
            className="w-full py-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-[12px] font-bold text-primary hover:bg-primary/10 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Show more ({CATEGORIES.length - visibleCount} remaining)
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ============= Full file contents =============

1: /**
2:  * Sponsored Restaurant Card
3:  * Displays a restaurant with "Sponsored" badge and tracks impressions/clicks
4:  */
5: 
6: import { useEffect, useRef } from "react";
7: import { useNavigate } from "react-router-dom";
8: import { Card, CardContent } from "@/components/ui/card";
9: import { Star, Clock, Bike } from "lucide-react";
10: import SponsoredBadge from "@/components/shared/SponsoredBadge";
11: import { useRecordImpression, useRecordClick } from "@/hooks/useRestaurantAds";
12: import { useAuth } from "@/contexts/AuthContext";
13: import { cn } from "@/lib/utils";
14: import type { SponsoredRestaurant } from "@/lib/restaurantAds";
15: 
16: interface SponsoredRestaurantCardProps {
17:   restaurant: SponsoredRestaurant;
18:   className?: string;
19:   variant?: "default" | "compact" | "carousel";
20: }
21: 
22: const SponsoredRestaurantCard = ({
23:   restaurant,
24:   className,
25:   variant = "default",
26: }: SponsoredRestaurantCardProps) => {
27:   const navigate = useNavigate();
28:   const { user } = useAuth();
29:   const impressionRecorded = useRef(false);
30:   const recordImpression = useRecordImpression();
31:   const recordClick = useRecordClick();
32: 
33:   // Record impression on mount (once)
34:   useEffect(() => {
35:     if (!impressionRecorded.current && restaurant.adId) {
36:       impressionRecorded.current = true;
37:       recordImpression.mutate({
38:         adId: restaurant.adId,
39:         userId: user?.id || null,
40:       });
41:     }
42:   }, [restaurant.adId, user?.id]);
43: 
44:   const handleClick = async () => {
45:     // Record click
46:     if (restaurant.adId) {
47:       const result = await recordClick.mutateAsync({
48:         adId: restaurant.adId,
49:         userId: user?.id || null,
50:       });
51: 
52:       // Store click for conversion tracking
53:       if (result) {
54:         localStorage.setItem(
55:           `ad_click_${restaurant.id}`,
56:           JSON.stringify({
57:             clickId: result,
58:             adId: restaurant.adId,
59:             timestamp: Date.now(),
60:           })
61:         );
62:       }
63:     }
64: 
65:     navigate(`/eats/restaurant/${restaurant.id}`);
66:   };
67: 
68:   const isCompact = variant === "compact";
69:   const isCarousel = variant === "carousel";
70: 
71:   return (
72:     <Card
73:       className={cn(
74:         "overflow-hidden cursor-pointer transition-all duration-300",
75:         "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] touch-manipulation",
76:         "border-amber-500/20 bg-gradient-to-br from-background to-amber-500/5",
77:         isCarousel && "min-w-[280px] w-[280px] flex-shrink-0",
78:         className
79:       )}
80:       onClick={handleClick}
81:     >
82:       <div className="relative">
83:         {/* Restaurant Image */}
84:         <div
85:           className={cn(
86:             "bg-cover bg-center",
87:             isCompact ? "h-24" : "h-32"
88:           )}
89:           style={{
90:             backgroundImage: restaurant.image_url
91:               ? `url(${restaurant.image_url})`
92:               : "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted-foreground)/0.2))",
93:           }}
94:         >
95:           {/* Gradient overlay */}
96:           <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
97:         </div>
98: 
99:         {/* Sponsored Badge */}
100:         <div className="absolute top-2 left-2">
101:           <SponsoredBadge variant="default" size="sm" showTooltip />
102:         </div>
103: 
104:         {/* Open/Closed Badge */}
105:         {restaurant.is_open === false && (
106:           <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground text-xs px-2 py-0.5 rounded">
107:             Closed
108:           </div>
109:         )}
110:       </div>
111: 
112:       <CardContent className={cn("p-3", isCompact && "p-2")}>
113:         {/* Restaurant Name */}
114:         <h3 className={cn(
115:           "font-semibold text-foreground truncate",
116:           isCompact ? "text-sm" : "text-base"
117:         )}>
118:           {restaurant.name}
119:         </h3>
120: 
121:         {/* Cuisine Type */}
122:         {restaurant.cuisine_type && (
123:           <p className="text-xs text-muted-foreground truncate mt-0.5">
124:             {restaurant.cuisine_type}
125:           </p>
126:         )}
127: 
128:         {/* Stats Row */}
129:         <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
130:           {/* Rating */}
131:           {restaurant.rating && (
132:             <div className="flex items-center gap-1">
133:               <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
134:               <span>{restaurant.rating.toFixed(1)}</span>
135:             </div>
136:           )}
137: 
138:           {/* Delivery Time */}
139:           {restaurant.delivery_time_min && (
140:             <div className="flex items-center gap-1">
141:               <Clock className="h-3 w-3" />
142:               <span>{restaurant.delivery_time_min} min</span>
143:             </div>
144:           )}
145: 
146:           {/* Delivery Fee */}
147:           {restaurant.delivery_fee !== null && restaurant.delivery_fee !== undefined && (
148:             <div className="flex items-center gap-1">
149:               <Bike className="h-3 w-3" />
150:               <span>
151:                 {restaurant.delivery_fee === 0
152:                   ? "Free"
153:                   : `$${restaurant.delivery_fee.toFixed(2)}`}
154:               </span>
155:             </div>
156:           )}
157:         </div>
158:       </CardContent>
159:     </Card>
160:   );
161: };
162: 
163: export default SponsoredRestaurantCard;
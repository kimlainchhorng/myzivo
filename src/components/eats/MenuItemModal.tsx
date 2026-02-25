// ============= Full file contents =============

1: /**
2:  * Menu Item Modal Component
3:  * Add items to cart with quantity and notes
4:  */
5: import { useState } from "react";
6: import { Minus, Plus, X, UtensilsCrossed } from "lucide-react";
7: import { cn } from "@/lib/utils";
8: import { Button } from "@/components/ui/button";
9: import { Textarea } from "@/components/ui/textarea";
10: import {
11:   Dialog,
12:   DialogContent,
13:   DialogHeader,
14:   DialogTitle,
15: } from "@/components/ui/dialog";
16: import { useCart } from "@/contexts/CartContext";
17: import type { MenuItem } from "@/hooks/useEatsOrders";
18: import { toast } from "sonner";
19: 
20: interface MenuItemModalProps {
21:   item: MenuItem | null;
22:   restaurantId: string;
23:   restaurantName: string;
24:   open: boolean;
25:   onOpenChange: (open: boolean) => void;
26:   groupSessionId?: string | null;
27:   onAddGroupItem?: (item: {
28:     menu_item_id: string;
29:     item_name: string;
30:     price: number;
31:     quantity: number;
32:     notes?: string;
33:   }) => Promise<boolean>;
34: }
35: 
36: export function MenuItemModal({
37:   item,
38:   restaurantId,
39:   restaurantName,
40:   open,
41:   onOpenChange,
42:   groupSessionId,
43:   onAddGroupItem,
44: }: MenuItemModalProps) {
45:   const { addItem, getRestaurantId } = useCart();
46:   const [quantity, setQuantity] = useState(1);
47:   const [notes, setNotes] = useState("");
48: 
49:   const currentRestaurantId = getRestaurantId();
50: 
51:   const isGroupMode = !!groupSessionId && !!onAddGroupItem;
52: 
53:   const handleAdd = async () => {
54:     if (!item) return;
55: 
56:     if (isGroupMode) {
57:       const success = await onAddGroupItem({
58:         menu_item_id: item.id,
59:         item_name: item.name,
60:         price: item.price,
61:         quantity,
62:         notes: notes.trim() || undefined,
63:       });
64:       if (success) {
65:         toast.success(`${quantity}x ${item.name} added to group order`);
66:         onOpenChange(false);
67:         setQuantity(1);
68:         setNotes("");
69:       }
70:       return;
71:     }
72: 
73:     // Check if adding from different restaurant
74:     if (currentRestaurantId && currentRestaurantId !== restaurantId) {
75:       toast.warning("Cart cleared - adding from new restaurant", {
76:         description: "You can only order from one restaurant at a time",
77:       });
78:     }
79: 
80:     addItem({
81:       id: item.id,
82:       restaurantId,
83:       restaurantName,
84:       name: item.name,
85:       price: item.price,
86:       imageUrl: item.image_url || undefined,
87:       notes: notes.trim() || undefined,
88:       quantity,
89:     });
90: 
91:     toast.success(`${quantity}x ${item.name} added to cart`);
92:     onOpenChange(false);
93:     setQuantity(1);
94:     setNotes("");
95:   };
96: 
97:   if (!item) return null;
98: 
99:   const totalPrice = item.price * quantity;
100:   const isItemAvailable = item.is_available !== false;
101: 
102:   return (
103:     <Dialog open={open} onOpenChange={onOpenChange}>
104:       <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
105:         {/* Image */}
106:         <div className={cn(
107:           "h-48 bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center relative",
108:           !isItemAvailable && "grayscale"
109:         )}>
110:           {item.image_url ? (
111:             <img
112:               src={item.image_url}
113:               alt={item.name}
114:               className="w-full h-full object-cover"
115:             />
116:           ) : (
117:             <UtensilsCrossed className="w-16 h-16 text-orange-500/30" />
118:           )}
119:           {/* Out of Stock overlay */}
120:           {!isItemAvailable && (
121:             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
122:               <div className="bg-red-500/90 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2">
123:                 <X className="w-5 h-5" />
124:                 Out of Stock
125:               </div>
126:             </div>
127:           )}
128:         </div>
129: 
130:         <div className="p-6 space-y-6">
131:           <DialogHeader>
132:             <DialogTitle className="text-xl font-bold text-white">
133:               {item.name}
134:             </DialogTitle>
135:             {item.description && (
136:               <p className="text-sm text-zinc-400 mt-2">{item.description}</p>
137:             )}
138:           </DialogHeader>
139: 
140:           {/* Out of Stock Warning */}
141:           {!isItemAvailable && (
142:             <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
143:               <p className="text-red-400 font-medium text-sm">
144:                 This item is currently out of stock and cannot be added to your cart.
145:               </p>
146:             </div>
147:           )}
148: 
149:           {/* Special Instructions - only show if available */}
150:           {isItemAvailable && (
151:             <div>
152:               <label className="text-sm text-zinc-400 mb-2 block">
153:                 Special Instructions (optional)
154:               </label>
155:               <Textarea
156:                 value={notes}
157:                 onChange={(e) => setNotes(e.target.value)}
158:                 placeholder="e.g., No onions, extra sauce..."
159:                 className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 resize-none"
160:                 rows={2}
161:               />
162:             </div>
163:           )}
164: 
165:           {/* Quantity Selector - only show if available */}
166:           {isItemAvailable && (
167:             <div className="flex items-center justify-between">
168:               <span className="text-sm text-zinc-400">Quantity</span>
169:               <div className="flex items-center gap-4">
170:                 <Button
171:                   type="button"
172:                   variant="outline"
173:                   size="icon"
174:                   className="h-10 w-10 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
175:                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
176:                   disabled={quantity <= 1}
177:                 >
178:                   <Minus className="w-4 h-4" />
179:                 </Button>
180:                 <span className="text-xl font-bold w-8 text-center">{quantity}</span>
181:                 <Button
182:                   type="button"
183:                   variant="outline"
184:                   size="icon"
185:                   className="h-10 w-10 rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
186:                   onClick={() => setQuantity(quantity + 1)}
187:                 >
188:                   <Plus className="w-4 h-4" />
189:                 </Button>
190:               </div>
191:             </div>
192:           )}
193: 
194:           {/* Add to Cart Button */}
195:           <Button
196:             onClick={handleAdd}
197:             disabled={!isItemAvailable}
198:             className={cn(
199:               "w-full h-14 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg active:scale-[0.98] touch-manipulation",
200:               isItemAvailable 
201:                 ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/20"
202:                 : "bg-zinc-700 cursor-not-allowed"
203:             )}
204:           >
205:             {isItemAvailable ? (isGroupMode ? `Add to Group Order · $${totalPrice.toFixed(2)}` : `Add to Cart · $${totalPrice.toFixed(2)}`) : "Out of Stock"}
206:           </Button>
207:         </div>
208:       </DialogContent>
209:     </Dialog>
210:   );
211: }
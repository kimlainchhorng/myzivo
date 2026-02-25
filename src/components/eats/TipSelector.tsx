// ============= Full file contents =============

1: /**
2:  * ZIVO Eats — Tip Selector
3:  * Percentage-based tips with custom amount option
4:  */
5: import { useState } from "react";
6: import { Heart } from "lucide-react";
7: import { cn } from "@/lib/utils";
8: import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
9: import { Input } from "@/components/ui/input";
10: import { Button } from "@/components/ui/button";
11: 
12: interface TipSelectorProps {
13:   subtotal: number;
14:   tipAmount: number;
15:   onTipChange: (amount: number) => void;
16:   className?: string;
17: }
18: 
19: const TIP_PERCENTAGES = [0, 5, 10, 15] as const;
20: 
21: export function TipSelector({ subtotal, tipAmount, onTipChange, className }: TipSelectorProps) {
22:   const [customModalOpen, setCustomModalOpen] = useState(false);
23:   const [customValue, setCustomValue] = useState("");
24: 
25:   // Calculate tip from percentage
26:   const calculateTip = (percentage: number): number => {
27:     return Math.round(subtotal * (percentage / 100) * 100) / 100;
28:   };
29: 
30:   // Check if current tip matches a percentage option
31:   const getActivePercentage = (): number | "custom" | null => {
32:     for (const pct of TIP_PERCENTAGES) {
33:       if (Math.abs(calculateTip(pct) - tipAmount) < 0.01) {
34:         return pct;
35:       }
36:     }
37:     return tipAmount > 0 ? "custom" : null;
38:   };
39: 
40:   const activeOption = getActivePercentage();
41: 
42:   const handleCustomSubmit = () => {
43:     const value = parseFloat(customValue);
44:     if (!isNaN(value) && value >= 0) {
45:       onTipChange(Math.round(value * 100) / 100);
46:       setCustomModalOpen(false);
47:       setCustomValue("");
48:     }
49:   };
50: 
51:   return (
52:     <div className={cn("bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-5", className)}>
53:       <div className="flex items-center gap-2 mb-4">
54:         <Heart className="w-4 h-4 text-orange-500" />
55:         <span className="font-bold text-sm">Add a tip</span>
56:       </div>
57: 
58:       <div className="flex gap-2">
59:         {/* Percentage options */}
60:         {TIP_PERCENTAGES.map((pct) => {
61:           const amount = calculateTip(pct);
62:           const isActive = activeOption === pct;
63:           
64:           return (
65:             <button
66:               key={pct}
67:               onClick={() => onTipChange(amount)}
68:               className={cn(
69:                 "flex-1 py-3 rounded-xl border text-center transition-all duration-200 active:scale-[0.97] touch-manipulation",
70:                 isActive
71:                   ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
72:                   : "bg-zinc-800/50 border-white/10 text-zinc-300 hover:border-orange-500/50"
73:               )}
74:             >
75:               <div className="text-sm font-bold">
76:                 {pct === 0 ? "None" : `${pct}%`}
77:               </div>
78:               {pct > 0 && (
79:                 <div className="text-xs opacity-70">
80:                   ${amount.toFixed(2)}
81:                 </div>
82:               )}
83:             </button>
84:           );
85:         })}
86: 
87:         {/* Custom option */}
88:         <button
89:           onClick={() => {
90:             setCustomValue(tipAmount > 0 && activeOption === "custom" ? tipAmount.toString() : "");
91:             setCustomModalOpen(true);
92:           }}
93:           className={cn(
94:             "flex-1 py-3 rounded-xl border text-center transition-all duration-200 active:scale-[0.97] touch-manipulation",
95:             activeOption === "custom"
96:               ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
97:               : "bg-zinc-800/50 border-white/10 text-zinc-300 hover:border-orange-500/50"
98:           )}
99:         >
100:           <div className="text-sm font-bold">Other</div>
101:           {activeOption === "custom" && (
102:             <div className="text-xs opacity-70">
103:               ${tipAmount.toFixed(2)}
104:             </div>
105:           )}
106:         </button>
107:       </div>
108: 
109:       <p className="text-xs text-zinc-500 mt-3 text-center">
110:         100% of tip goes to your driver
111:       </p>
112: 
113:       {/* Custom Tip Modal */}
114:       <Dialog open={customModalOpen} onOpenChange={setCustomModalOpen}>
115:         <DialogContent className="bg-zinc-900 border-white/10 max-w-xs">
116:           <DialogHeader>
117:             <DialogTitle>Custom Tip</DialogTitle>
118:           </DialogHeader>
119:           <div className="space-y-4">
120:             <div className="relative">
121:               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
122:               <Input
123:                 type="number"
124:                 min="0"
125:                 step="0.01"
126:                 placeholder="0.00"
127:                 value={customValue}
128:                 onChange={(e) => setCustomValue(e.target.value)}
129:                 className="pl-7 bg-zinc-800 border-white/10 text-lg h-12"
130:                 autoFocus
131:               />
132:             </div>
133:             <Button
134:               onClick={handleCustomSubmit}
135:               className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation shadow-md"
136:             >
137:               Add Tip
138:             </Button>
139:           </div>
140:         </DialogContent>
141:       </Dialog>
142:     </div>
143:   );
144: }
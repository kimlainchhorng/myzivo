 /**
  * ZIVO Wallet Premium - "Secure Vault" Mobile Experience
  * 3D card carousel with transaction history
  */
 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useNavigate } from "react-router-dom";
 import { 
   Wallet, TrendingUp, ArrowUpRight, 
   ArrowDownLeft, History, ShieldCheck, Plus, ArrowLeft
 } from "lucide-react";
 
 const cards = [
   {
     id: 1,
     type: "Visa Infinite",
     last4: "4242",
     balance: "$8,450.00",
     color: "from-zinc-900 to-zinc-800",
     border: "border-zinc-700",
   },
   {
     id: 2,
     type: "ZIVO Titanium",
     last4: "8899",
     balance: "24,500 pts",
     color: "from-blue-600 to-purple-600",
     border: "border-blue-400",
   }
 ];
 
 const transactions = [
   { id: 1, name: "Uber Ride", date: "Today, 10:23 AM", amount: "-$24.50", icon: ArrowUpRight, positive: false },
   { id: 2, name: "Refund: Hotel", date: "Yesterday", amount: "+$450.00", icon: ArrowDownLeft, positive: true },
   { id: 3, name: "Starbucks", date: "Yesterday", amount: "-$12.40", icon: ArrowUpRight, positive: false },
   { id: 4, name: "Delta Flight", date: "Feb 20", amount: "-$840.00", icon: ArrowUpRight, positive: false },
 ];
 
 const quickActions = [
   { icon: Wallet, label: "Top Up" },
   { icon: TrendingUp, label: "Analytics" },
   { icon: History, label: "Statements" }
 ];
 
 export default function MobileWalletPremium() {
   const [activeCard, setActiveCard] = useState(0);
   const navigate = useNavigate();
 
   return (
     <div className="relative min-h-screen bg-zinc-950 font-sans text-white overflow-hidden selection:bg-purple-500/30">
       
       {/* Back Button */}
       <button 
         onClick={() => navigate("/")}
         className="fixed top-6 left-6 z-50 w-10 h-10 bg-zinc-900/80 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/10 touch-manipulation active:scale-95 transition-transform"
       >
         <ArrowLeft className="w-5 h-5" />
       </button>
 
       {/* 1. HEADER */}
       <div className="pt-16 px-6 pb-6 flex justify-between items-end">
         <div>
           <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
             <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Vault
           </div>
           <h1 className="text-4xl font-black tracking-tighter">
             My <span className="text-purple-500">Wallet</span>
           </h1>
         </div>
         <button className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all duration-200 touch-manipulation active:scale-90 min-w-[44px] min-h-[44px]">
           <Plus className="w-5 h-5" />
         </button>
       </div>
 
       {/* 2. CARD CAROUSEL (3D Effect) */}
       <div className="relative h-64 px-6 mb-8 overflow-hidden">
         {cards.map((card, index) => (
           <motion.div
             key={card.id}
             onClick={() => setActiveCard(index)}
             initial={{ scale: 0.9, y: 20 }}
             animate={{ 
               scale: activeCard === index ? 1 : 0.9, 
               y: activeCard === index ? 0 : 20,
               zIndex: activeCard === index ? 10 : 0,
               opacity: activeCard === index ? 1 : 0.5
             }}
             transition={{ type: "spring", stiffness: 200, damping: 20 }}
             className={`absolute top-0 left-6 right-6 h-56 rounded-3xl bg-gradient-to-br ${card.color} border ${card.border} p-8 shadow-2xl cursor-pointer touch-manipulation`}
           >
             <div className="flex justify-between items-start mb-12">
               <div className="text-xs font-bold text-white/60 uppercase tracking-widest">
                 {card.type}
               </div>
               <div className="w-10 h-6 bg-yellow-500/20 rounded border border-yellow-500/40" />
             </div>
             <div className="font-mono text-xl tracking-widest mb-2">
               •••• •••• •••• {card.last4}
             </div>
             <div className="flex justify-between items-end">
               <div>
                 <div className="text-[10px] text-white/60 uppercase font-bold">Balance</div>
                 <div className="text-2xl font-bold">{card.balance}</div>
               </div>
               <div className="flex gap-1">
                 {cards.map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-2 h-2 rounded-full transition-colors ${
                       activeCard === i ? "bg-white" : "bg-white/30"
                     }`}
                   />
                 ))}
               </div>
             </div>
           </motion.div>
         ))}
       </div>
 
       {/* 3. QUICK ACTIONS */}
       <div className="grid grid-cols-3 gap-4 px-6 mb-10">
         {quickActions.map((action, i) => (
            <button 
              key={i} 
              className="bg-zinc-900 border border-white/5 rounded-2xl py-4 flex flex-col items-center gap-2 hover:bg-zinc-800 hover:border-white/10 transition-all duration-200 touch-manipulation active:scale-[0.93] min-h-[80px]"
            >
             <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
               <action.icon className="w-5 h-5" />
             </div>
             <span className="text-xs font-bold">{action.label}</span>
           </button>
         ))}
       </div>
 
       {/* 4. TRANSACTION HISTORY */}
       <div className="bg-white/5 rounded-t-[2.5rem] p-8 min-h-[400px]">
         <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
         <div className="space-y-6">
           {transactions.map((tx) => {
             const Icon = tx.icon;
             return (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between group cursor-pointer touch-manipulation active:scale-[0.98] transition-all duration-200 rounded-2xl p-2 -mx-2 hover:bg-white/5"
                >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-purple-500/50 transition-colors">
                     <Icon className="w-5 h-5 text-zinc-400" />
                   </div>
                   <div>
                     <div className="font-bold">{tx.name}</div>
                     <div className="text-xs text-zinc-500">{tx.date}</div>
                   </div>
                 </div>
                 <div className={`font-mono font-bold ${tx.positive ? "text-emerald-400" : "text-white"}`}>
                   {tx.amount}
                 </div>
               </div>
             );
           })}
         </div>
 
         {/* Coming Soon Notice */}
         <div className="text-center py-8 mt-4">
           <p className="text-sm text-zinc-500">
             ZIVO Wallet is coming soon. This is a preview.
           </p>
         </div>
       </div>
     </div>
   );
 }
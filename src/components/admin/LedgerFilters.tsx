 /**
  * LedgerFilters - Filter bar for booking ledger
  */
 import { Search } from "lucide-react";
 
 interface LedgerFiltersProps {
   searchQuery: string;
   onSearchChange: (value: string) => void;
   supplierFilter: string;
   onSupplierChange: (value: string) => void;
 }
 
 const suppliers = [
   { value: "all", label: "All Suppliers" },
   { value: "duffel", label: "Duffel (Flights)" },
   { value: "hotelbeds", label: "Hotelbeds" },
   { value: "ratehawk", label: "RateHawk" },
   { value: "viator", label: "Viator" },
 ];
 
 const LedgerFilters = ({
   searchQuery,
   onSearchChange,
   supplierFilter,
   onSupplierChange,
 }: LedgerFiltersProps) => {
   return (
     <div className="flex flex-wrap gap-4 mb-6">
       {/* Search Input */}
       <div className="relative flex-1 min-w-[280px] max-w-md">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
         <input
           type="text"
           placeholder="Search PNR, Email, or Ticket #"
           value={searchQuery}
           onChange={(e) => onSearchChange(e.target.value)}
           className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
         />
       </div>
 
       {/* Supplier Filter */}
       <select
         value={supplierFilter}
         onChange={(e) => onSupplierChange(e.target.value)}
         className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 outline-none cursor-pointer hover:border-white/20 focus:border-primary transition-colors"
       >
         {suppliers.map((s) => (
           <option key={s.value} value={s.value}>
             {s.label}
           </option>
         ))}
       </select>
     </div>
   );
 };
 
 export default LedgerFilters;
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
  placeholder: string; // example local number format
  digits: string;      // e.g. "10 digits" hint
}

const COUNTRY_CODES: CountryCode[] = [
  // North America
  { code: "US", dial: "+1", name: "United States", flag: "/flags/us.svg", placeholder: "201 555 0123", digits: "10 digits" },
  { code: "CA", dial: "+1", name: "Canada", flag: "/flags/ca.svg", placeholder: "416 555 0123", digits: "10 digits" },
  { code: "MX", dial: "+52", name: "Mexico", flag: "/flags/mx.svg", placeholder: "55 1234 5678", digits: "10 digits" },

  // Central America & Caribbean
  { code: "DO", dial: "+1", name: "Dominican Republic", flag: "/flags/do.svg", placeholder: "809 234 5678", digits: "10 digits" },
  { code: "JM", dial: "+1", name: "Jamaica", flag: "/flags/jm.svg", placeholder: "876 234 5678", digits: "10 digits" },

  // South America
  { code: "BR", dial: "+55", name: "Brazil", flag: "/flags/br.svg", placeholder: "11 91234 5678", digits: "10-11 digits" },
  { code: "AR", dial: "+54", name: "Argentina", flag: "/flags/ar.svg", placeholder: "11 1234 5678", digits: "10 digits" },
  { code: "CO", dial: "+57", name: "Colombia", flag: "/flags/co.svg", placeholder: "301 234 5678", digits: "10 digits" },
  { code: "CL", dial: "+56", name: "Chile", flag: "/flags/cl.svg", placeholder: "9 1234 5678", digits: "9 digits" },
  { code: "PE", dial: "+51", name: "Peru", flag: "/flags/pe.svg", placeholder: "912 345 678", digits: "9 digits" },

  // Western Europe
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "/flags/gb.svg", placeholder: "7911 123456", digits: "10-11 digits" },
  { code: "FR", dial: "+33", name: "France", flag: "/flags/fr.svg", placeholder: "6 12 34 56 78", digits: "9 digits" },
  { code: "DE", dial: "+49", name: "Germany", flag: "/flags/de.svg", placeholder: "151 2345 6789", digits: "10-11 digits" },
  { code: "IT", dial: "+39", name: "Italy", flag: "/flags/it.svg", placeholder: "312 345 6789", digits: "10 digits" },
  { code: "ES", dial: "+34", name: "Spain", flag: "/flags/es.svg", placeholder: "612 345 678", digits: "9 digits" },
  { code: "PT", dial: "+351", name: "Portugal", flag: "/flags/pt.svg", placeholder: "912 345 678", digits: "9 digits" },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "/flags/nl.svg", placeholder: "6 12345678", digits: "9 digits" },
  { code: "BE", dial: "+32", name: "Belgium", flag: "/flags/be.svg", placeholder: "470 12 34 56", digits: "9 digits" },
  { code: "CH", dial: "+41", name: "Switzerland", flag: "/flags/ch.svg", placeholder: "78 123 45 67", digits: "9 digits" },
  { code: "AT", dial: "+43", name: "Austria", flag: "/flags/at.svg", placeholder: "664 123 4567", digits: "10-11 digits" },
  { code: "IE", dial: "+353", name: "Ireland", flag: "/flags/ie.svg", placeholder: "85 123 4567", digits: "9 digits" },

  // Scandinavia
  { code: "SE", dial: "+46", name: "Sweden", flag: "/flags/se.svg", placeholder: "70 123 45 67", digits: "7-10 digits" },
  { code: "DK", dial: "+45", name: "Denmark", flag: "/flags/dk.svg", placeholder: "20 12 34 56", digits: "8 digits" },
  { code: "NO", dial: "+47", name: "Norway", flag: "/flags/no.svg", placeholder: "412 34 567", digits: "8 digits" },
  { code: "FI", dial: "+358", name: "Finland", flag: "/flags/fi.svg", placeholder: "41 234 5678", digits: "7-10 digits" },

  // Eastern Europe
  { code: "PL", dial: "+48", name: "Poland", flag: "/flags/pl.svg", placeholder: "512 345 678", digits: "9 digits" },
  { code: "CZ", dial: "+420", name: "Czech Republic", flag: "/flags/cz.svg", placeholder: "601 123 456", digits: "9 digits" },
  { code: "SK", dial: "+421", name: "Slovakia", flag: "/flags/sk.svg", placeholder: "901 234 567", digits: "9 digits" },
  { code: "RO", dial: "+40", name: "Romania", flag: "/flags/ro.svg", placeholder: "712 345 678", digits: "9 digits" },
  { code: "HU", dial: "+36", name: "Hungary", flag: "/flags/hu.svg", placeholder: "20 123 4567", digits: "9 digits" },
  { code: "HR", dial: "+385", name: "Croatia", flag: "/flags/hr.svg", placeholder: "91 234 5678", digits: "8-9 digits" },
  { code: "BG", dial: "+359", name: "Bulgaria", flag: "/flags/bg.svg", placeholder: "87 123 4567", digits: "8-9 digits" },
  { code: "LT", dial: "+370", name: "Lithuania", flag: "/flags/lt.svg", placeholder: "612 34567", digits: "8 digits" },
  { code: "UA", dial: "+380", name: "Ukraine", flag: "/flags/ua.svg", placeholder: "50 123 4567", digits: "9 digits" },
  { code: "RU", dial: "+7", name: "Russia", flag: "/flags/ru.svg", placeholder: "912 345 67 89", digits: "10 digits" },

  // Mediterranean & Middle East
  { code: "GR", dial: "+30", name: "Greece", flag: "/flags/gr.svg", placeholder: "691 234 5678", digits: "10 digits" },
  { code: "TR", dial: "+90", name: "Turkey", flag: "/flags/tr.svg", placeholder: "501 234 5678", digits: "10 digits" },
  { code: "AE", dial: "+971", name: "UAE", flag: "/flags/ae.svg", placeholder: "50 123 4567", digits: "9 digits" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "/flags/sa.svg", placeholder: "50 123 4567", digits: "9 digits" },
  { code: "QA", dial: "+974", name: "Qatar", flag: "/flags/qa.svg", placeholder: "3312 3456", digits: "8 digits" },
  { code: "KW", dial: "+965", name: "Kuwait", flag: "/flags/kw.svg", placeholder: "5012 3456", digits: "8 digits" },
  { code: "BH", dial: "+973", name: "Bahrain", flag: "/flags/bh.svg", placeholder: "3612 3456", digits: "8 digits" },
  { code: "OM", dial: "+968", name: "Oman", flag: "/flags/om.svg", placeholder: "9212 3456", digits: "8 digits" },
  { code: "JO", dial: "+962", name: "Jordan", flag: "/flags/jo.svg", placeholder: "7 9012 3456", digits: "9 digits" },
  { code: "LB", dial: "+961", name: "Lebanon", flag: "/flags/lb.svg", placeholder: "71 123 456", digits: "7-8 digits" },
  { code: "IL", dial: "+972", name: "Israel", flag: "/flags/il.svg", placeholder: "50 123 4567", digits: "9 digits" },
  { code: "EG", dial: "+20", name: "Egypt", flag: "/flags/eg.svg", placeholder: "100 234 5678", digits: "10 digits" },

  // Africa
  { code: "ZA", dial: "+27", name: "South Africa", flag: "/flags/za.svg", placeholder: "71 234 5678", digits: "9 digits" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "/flags/ng.svg", placeholder: "802 345 6789", digits: "10 digits" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "/flags/ke.svg", placeholder: "712 345 678", digits: "9 digits" },
  { code: "GH", dial: "+233", name: "Ghana", flag: "/flags/gh.svg", placeholder: "24 123 4567", digits: "9 digits" },
  { code: "TZ", dial: "+255", name: "Tanzania", flag: "/flags/tz.svg", placeholder: "712 345 678", digits: "9 digits" },
  { code: "ET", dial: "+251", name: "Ethiopia", flag: "/flags/et.svg", placeholder: "91 123 4567", digits: "9 digits" },
  { code: "MA", dial: "+212", name: "Morocco", flag: "/flags/ma.svg", placeholder: "6 12 34 56 78", digits: "9 digits" },

  // South Asia
  { code: "IN", dial: "+91", name: "India", flag: "/flags/in.svg", placeholder: "91234 56789", digits: "10 digits" },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "/flags/pk.svg", placeholder: "301 234 5678", digits: "10 digits" },
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "/flags/bd.svg", placeholder: "1712 345678", digits: "10 digits" },
  { code: "LK", dial: "+94", name: "Sri Lanka", flag: "/flags/lk.svg", placeholder: "71 234 5678", digits: "9 digits" },
  { code: "NP", dial: "+977", name: "Nepal", flag: "/flags/np.svg", placeholder: "984 123 4567", digits: "10 digits" },

  // Southeast Asia
  { code: "KH", dial: "+855", name: "Cambodia", flag: "/flags/kh.svg", placeholder: "12 345 678", digits: "8-9 digits" },
  { code: "TH", dial: "+66", name: "Thailand", flag: "/flags/th.svg", placeholder: "81 234 5678", digits: "9 digits" },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "/flags/vn.svg", placeholder: "912 345 678", digits: "9-10 digits" },
  { code: "SG", dial: "+65", name: "Singapore", flag: "/flags/sg.svg", placeholder: "9123 4567", digits: "8 digits" },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "/flags/my.svg", placeholder: "12 345 6789", digits: "9-10 digits" },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "/flags/id.svg", placeholder: "812 3456 7890", digits: "10-12 digits" },
  { code: "PH", dial: "+63", name: "Philippines", flag: "/flags/ph.svg", placeholder: "917 123 4567", digits: "10 digits" },
  { code: "MM", dial: "+95", name: "Myanmar", flag: "/flags/mm.svg", placeholder: "9 123 4567", digits: "7-10 digits" },
  { code: "LA", dial: "+856", name: "Laos", flag: "/flags/la.svg", placeholder: "20 5678 9012", digits: "8-10 digits" },

  // East Asia
  { code: "JP", dial: "+81", name: "Japan", flag: "/flags/jp.svg", placeholder: "90 1234 5678", digits: "10 digits" },
  { code: "KR", dial: "+82", name: "South Korea", flag: "/flags/kr.svg", placeholder: "10 1234 5678", digits: "10-11 digits" },
  { code: "CN", dial: "+86", name: "China", flag: "/flags/cn.svg", placeholder: "131 2345 6789", digits: "11 digits" },
  { code: "TW", dial: "+886", name: "Taiwan", flag: "/flags/tw.svg", placeholder: "912 345 678", digits: "9 digits" },
  { code: "HK", dial: "+852", name: "Hong Kong", flag: "/flags/hk.svg", placeholder: "5123 4567", digits: "8 digits" },

  // Oceania
  { code: "AU", dial: "+61", name: "Australia", flag: "/flags/au.svg", placeholder: "412 345 678", digits: "9 digits" },
  { code: "NZ", dial: "+64", name: "New Zealand", flag: "/flags/nz.svg", placeholder: "21 123 4567", digits: "8-10 digits" },
];

function FlagImg({ src, alt, size = 22 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      className="rounded-[3px] object-cover shadow-sm border border-white/20"
      style={{ width: size, height: Math.round(size * 0.68) }}
      loading="lazy"
    />
  );
}

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

export function CountryPhoneInput({ value, onChange, onBlur, name }: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [localNumber, setLocalNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !localNumber) {
      // Sort by longest dial code first to match +855 before +8
      const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
      const match = sorted.find(c => value.startsWith(c.dial));
      if (match) {
        setSelectedCountry(match);
        setLocalNumber(value.slice(match.dial.length).trim());
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch("");
    onChange(`${country.dial}${localNumber}`);
  };

  const handleNumberChange = (num: string) => {
    const cleaned = num.replace(/[^\d\s\-]/g, "");
    setLocalNumber(cleaned);
    onChange(`${selectedCountry.dial}${cleaned}`);
  };

  const filtered = search
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 border-r-0 rounded-l-xl px-3 py-2 text-sm text-white hover:bg-white/15 transition-all shrink-0 touch-manipulation active:scale-[0.97] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <FlagImg src={selectedCountry.flag} alt={selectedCountry.name} size={24} />
          <span className="text-xs font-semibold text-white/70 tracking-tight">{selectedCountry.dial}</span>
          <ChevronDown className={cn("w-3 h-3 text-white/50 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          name={name}
          placeholder={selectedCountry.placeholder}
          autoComplete="tel-national"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 border-l-0 rounded-r-xl py-2 pr-4 pl-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]"
        />
      </div>
      {/* Digit hint */}
      <p className="text-[11px] text-white/50 mt-1 ml-1">
        {selectedCountry.name} • {selectedCountry.digits}
      </p>

      {/* 3D Glassmorphism Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[99]" onClick={() => { setIsOpen(false); setSearch(""); }} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[calc(100vw-3rem)] max-w-sm max-h-[70vh] overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/50"
            >
            <div className="relative bg-black/85 backdrop-blur-2xl overflow-hidden">
              {/* Large background flag watermark */}
              <div className="absolute -right-6 -top-6 w-44 h-44 opacity-[0.07] pointer-events-none select-none">
                <img
                  src={selectedCountry.flag}
                  alt=""
                  className="w-full h-full object-cover rounded-3xl blur-[2px]"
                  style={{ transform: "rotate(-15deg) scale(1.3)" }}
                />
              </div>

              {/* Search bar */}
              <div className="p-2.5 border-b border-white/10 relative z-10">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/40 backdrop-blur-sm"
                />
              </div>

              {/* Country list */}
              <div className="overflow-y-auto max-h-60 relative z-10">
                {filtered.map((c, idx) => {
                  const isSelected = selectedCountry.code === c.code && selectedCountry.dial === c.dial;
                  return (
                    <motion.button
                      key={`${c.code}-${c.dial}`}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.012, 0.18), duration: 0.15 }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all touch-manipulation group relative overflow-hidden",
                        isSelected
                          ? "bg-primary/20 text-primary font-semibold"
                          : "hover:bg-white/10 text-white/90"
                      )}
                    >
                      {/* Per-row background flag on hover */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-200 pointer-events-none">
                        <img src={c.flag} alt="" className="w-full h-full object-cover rounded-md" />
                      </div>

                      {/* Flag image */}
                      <div className="shrink-0 relative">
                        <FlagImg src={c.flag} alt={c.name} size={26} />
                        {isSelected && (
                          <motion.div
                            layoutId="phoneSelectedFlag"
                            className="absolute -inset-1 rounded-md border-2 border-primary/50 shadow-sm shadow-primary/20"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        )}
                      </div>

                      {/* Country code badge */}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 w-6 shrink-0">{c.code}</span>

                      {/* Name + digits hint */}
                      <div className="flex-1 text-left min-w-0">
                        <span className="block truncate">{c.name}</span>
                        <span className="block text-[10px] text-white/40">{c.digits}</span>
                      </div>

                      {/* Dial code */}
                      <span className="text-xs text-white/60 font-mono tabular-nums">{c.dial}</span>
                    </motion.button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-sm text-white/50 text-center">No country found</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

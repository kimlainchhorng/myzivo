import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag?: string; // path to SVG in /flags/
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "US", dial: "+1", name: "United States", flag: "/flags/us.svg" },
  { code: "CA", dial: "+1", name: "Canada" },
  { code: "GB", dial: "+44", name: "United Kingdom" },
  { code: "KH", dial: "+855", name: "Cambodia", flag: "/flags/kh.svg" },
  { code: "TH", dial: "+66", name: "Thailand", flag: "/flags/th.svg" },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "/flags/vn.svg" },
  { code: "SG", dial: "+65", name: "Singapore" },
  { code: "MY", dial: "+60", name: "Malaysia" },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "/flags/id.svg" },
  { code: "PH", dial: "+63", name: "Philippines" },
  { code: "JP", dial: "+81", name: "Japan", flag: "/flags/jp.svg" },
  { code: "KR", dial: "+82", name: "South Korea", flag: "/flags/kr.svg" },
  { code: "CN", dial: "+86", name: "China", flag: "/flags/cn.svg" },
  { code: "TW", dial: "+886", name: "Taiwan" },
  { code: "HK", dial: "+852", name: "Hong Kong" },
  { code: "IN", dial: "+91", name: "India" },
  { code: "AU", dial: "+61", name: "Australia" },
  { code: "NZ", dial: "+64", name: "New Zealand" },
  { code: "FR", dial: "+33", name: "France", flag: "/flags/fr.svg" },
  { code: "DE", dial: "+49", name: "Germany", flag: "/flags/de.svg" },
  { code: "IT", dial: "+39", name: "Italy", flag: "/flags/it.svg" },
  { code: "ES", dial: "+34", name: "Spain", flag: "/flags/es.svg" },
  { code: "PT", dial: "+351", name: "Portugal", flag: "/flags/pt.svg" },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "/flags/nl.svg" },
  { code: "SE", dial: "+46", name: "Sweden", flag: "/flags/se.svg" },
  { code: "DK", dial: "+45", name: "Denmark", flag: "/flags/dk.svg" },
  { code: "NO", dial: "+47", name: "Norway", flag: "/flags/no.svg" },
  { code: "FI", dial: "+358", name: "Finland", flag: "/flags/fi.svg" },
  { code: "PL", dial: "+48", name: "Poland", flag: "/flags/pl.svg" },
  { code: "CZ", dial: "+420", name: "Czech Republic", flag: "/flags/cz.svg" },
  { code: "RO", dial: "+40", name: "Romania", flag: "/flags/ro.svg" },
  { code: "HU", dial: "+36", name: "Hungary", flag: "/flags/hu.svg" },
  { code: "GR", dial: "+30", name: "Greece", flag: "/flags/gr.svg" },
  { code: "TR", dial: "+90", name: "Turkey", flag: "/flags/tr.svg" },
  { code: "RU", dial: "+7", name: "Russia", flag: "/flags/ru.svg" },
  { code: "AE", dial: "+971", name: "UAE" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "/flags/sa.svg" },
  { code: "IL", dial: "+972", name: "Israel" },
  { code: "MX", dial: "+52", name: "Mexico" },
  { code: "BR", dial: "+55", name: "Brazil" },
  { code: "AR", dial: "+54", name: "Argentina" },
  { code: "CO", dial: "+57", name: "Colombia" },
  { code: "ZA", dial: "+27", name: "South Africa" },
  { code: "NG", dial: "+234", name: "Nigeria" },
  { code: "EG", dial: "+20", name: "Egypt" },
  { code: "KE", dial: "+254", name: "Kenya" },
];

// Emoji fallback for countries without SVG flags
const EMOJI_FLAGS: Record<string, string> = {
  CA: "🇨🇦", SG: "🇸🇬", MY: "🇲🇾", PH: "🇵🇭", TW: "🇹🇼", HK: "🇭🇰",
  IN: "🇮🇳", AU: "🇦🇺", NZ: "🇳🇿", AE: "🇦🇪", IL: "🇮🇱", MX: "🇲🇽",
  BR: "🇧🇷", AR: "🇦🇷", CO: "🇨🇴", ZA: "🇿🇦", NG: "🇳🇬", EG: "🇪🇬", KE: "🇰🇪", GB: "🇬🇧",
};

function FlagIcon({ country, size = 20 }: { country: CountryCode; size?: number }) {
  if (country.flag) {
    return (
      <img
        src={country.flag}
        alt={country.name}
        className="rounded-sm object-cover shadow-sm"
        style={{ width: size, height: Math.round(size * 0.7) }}
        loading="lazy"
      />
    );
  }
  return <span style={{ fontSize: size * 0.8 }}>{EMOJI_FLAGS[country.code] || "🏳️"}</span>;
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
      const match = COUNTRY_CODES.find(c => value.startsWith(c.dial));
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
    <div className="relative flex" ref={dropdownRef}>
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-muted border border-border border-r-0 rounded-l-xl px-3 py-3 text-sm text-foreground hover:bg-muted/80 transition-all shrink-0 touch-manipulation active:scale-[0.97]"
      >
        <FlagIcon country={selectedCountry} size={22} />
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">{selectedCountry.dial}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Phone number input */}
      <input
        type="tel"
        name={name}
        placeholder="000 000 0000"
        autoComplete="tel-national"
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        onBlur={onBlur}
        className="w-full bg-muted border border-border border-l-0 rounded-r-xl py-3 pr-4 pl-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
      />

      {/* 3D Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97, rotateX: -4 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -6, scale: 0.97, rotateX: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-full mt-1.5 z-50 w-80 max-h-72 overflow-hidden rounded-2xl border border-border/60 shadow-2xl shadow-black/20"
            style={{ perspective: 800, transformOrigin: "top left" }}
          >
            {/* Glassmorphism background with flag watermark */}
            <div className="relative bg-card/90 backdrop-blur-2xl overflow-hidden">
              {/* Background flag watermark */}
              {selectedCountry.flag && (
                <div className="absolute -right-4 -top-4 w-36 h-36 opacity-[0.06] pointer-events-none select-none">
                  <img
                    src={selectedCountry.flag}
                    alt=""
                    className="w-full h-full object-cover rounded-full blur-[1px]"
                    style={{ transform: "rotate(-12deg) scale(1.2)" }}
                  />
                </div>
              )}

              {/* Search */}
              <div className="p-2.5 border-b border-border/50">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted/60 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-sm"
                />
              </div>

              {/* Country list */}
              <div className="overflow-y-auto max-h-52">
                {filtered.map((c, idx) => {
                  const isSelected = selectedCountry.code === c.code && selectedCountry.dial === c.dial;
                  return (
                    <motion.button
                      key={`${c.code}-${c.dial}`}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.015, 0.2), duration: 0.15 }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all touch-manipulation group relative overflow-hidden",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      {/* Row background flag watermark on hover */}
                      {c.flag && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 opacity-0 group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                          <img src={c.flag} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      {/* Flag */}
                      <div className="shrink-0 relative">
                        <FlagIcon country={c} size={24} />
                        {isSelected && (
                          <motion.div
                            layoutId="selectedFlag"
                            className="absolute -inset-1 rounded-md border-2 border-primary/40"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </div>

                      {/* Country code badge */}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-6">{c.code}</span>

                      {/* Name */}
                      <span className="flex-1 text-left truncate">{c.name}</span>

                      {/* Dial code */}
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">{c.dial}</span>
                    </motion.button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-sm text-muted-foreground text-center">No country found</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

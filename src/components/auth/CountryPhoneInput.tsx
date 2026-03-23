import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "KH", dial: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "TH", dial: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "SG", dial: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", dial: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "KR", dial: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "TW", dial: "+886", name: "Taiwan", flag: "🇹🇼" },
  { code: "HK", dial: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", dial: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "PT", dial: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", dial: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "DK", dial: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "NO", dial: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "FI", dial: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "PL", dial: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", dial: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "RO", dial: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "HU", dial: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "GR", dial: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "TR", dial: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", dial: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", dial: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "MX", dial: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", dial: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", dial: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
];

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

  // Parse initial value to extract country code
  useEffect(() => {
    if (value && !localNumber) {
      const match = COUNTRY_CODES.find(c => value.startsWith(c.dial));
      if (match) {
        setSelectedCountry(match);
        setLocalNumber(value.slice(match.dial.length).trim());
      }
    }
  }, []);

  // Close dropdown on outside click
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

  // Focus search when dropdown opens
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
    // Only allow digits, spaces, dashes
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
      {/* Country selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-muted border border-border border-r-0 rounded-l-xl px-3 py-3 text-sm text-foreground hover:bg-muted/80 transition-colors shrink-0 touch-manipulation"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="text-xs font-medium text-muted-foreground">{selectedCountry.dial}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl w-72 max-h-64 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((c) => (
              <button
                key={`${c.code}-${c.dial}`}
                type="button"
                onClick={() => handleCountrySelect(c)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors touch-manipulation",
                  selectedCountry.code === c.code && selectedCountry.dial === c.dial
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{c.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No country found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

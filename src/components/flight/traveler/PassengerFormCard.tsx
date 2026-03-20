/**
 * Passenger form card with all fields per passenger
 */
import { motion } from "framer-motion";
import {
  Calendar, Globe, Mail, Info, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PassengerForm {
  title: string;
  given_name: string;
  family_name: string;
  gender: "m" | "f" | "";
  born_on: string;
  email: string;
  phone_number: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
}

export const emptyPassenger = (): PassengerForm => ({
  title: "mr",
  given_name: "",
  family_name: "",
  gender: "",
  born_on: "",
  email: "",
  phone_number: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",
});

export const POPULAR_NATIONALITIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "JP", label: "Japan" },
  { code: "KR", label: "South Korea" },
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "KH", label: "Cambodia" },
  { code: "TH", label: "Thailand" },
  { code: "VN", label: "Vietnam" },
  { code: "PH", label: "Philippines" },
  { code: "MY", label: "Malaysia" },
  { code: "CN", label: "China" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
  { code: "AE", label: "UAE" },
  { code: "QA", label: "Qatar" },
];

/** Check if passport is expiring within 6 months */
function getPassportStatus(expiryDate: string): "valid" | "warning" | "expired" | null {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  const now = new Date();
  if (exp < now) return "expired";
  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  if (exp < sixMonths) return "warning";
  return "valid";
}

/** Calculate form completion percentage */
export function getPassengerCompletion(p: PassengerForm, isInternational: boolean): number {
  const required = ["given_name", "family_name", "gender", "born_on"];
  const optional = isInternational
    ? ["nationality", "passport_number", "passport_expiry"]
    : [];
  const all = [...required, ...optional];
  const filled = all.filter((f) => !!(p as any)[f]).length;
  return Math.round((filled / all.length) * 100);
}

interface PassengerFormCardProps {
  passenger: PassengerForm;
  index: number;
  type: string;
  errors: Record<string, string>;
  isInternational: boolean;
  onUpdate: (field: keyof PassengerForm, value: string) => void;
}

export function PassengerFormCard({
  passenger,
  index,
  type,
  errors,
  isInternational,
  onUpdate,
}: PassengerFormCardProps) {
  const fieldError = (field: string) => errors[`${index}.${field}`];
  const completion = getPassengerCompletion(passenger, isInternational);
  const passportStatus = getPassportStatus(passenger.passport_expiry);

  const inputCn = (field: string) => cn(
    "h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] transition-all",
    "focus:bg-background focus:border-[hsl(var(--flights))]/50 focus:ring-1 focus:ring-[hsl(var(--flights))]/20",
    fieldError(field) && "border-destructive/60 bg-destructive/5"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm">
        {/* Card header with completion indicator */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-1.5">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold",
            "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]"
          )}>
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold">
              {passenger.given_name && passenger.family_name
                ? `${passenger.given_name} ${passenger.family_name}`
                : `Passenger ${index + 1}`}
            </p>
            <p className="text-[10px] text-muted-foreground">{type}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {completion === 100 ? (
              <Badge className="text-[8px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Complete</Badge>
            ) : (
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-border/20 tabular-nums">{completion}%</Badge>
            )}
          </div>
        </div>

        {/* Completion bar */}
        <div className="mx-3 mb-2">
          <div className="h-0.5 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[hsl(var(--flights))]"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <CardContent className="px-3 pb-3 pt-1 space-y-2.5">
          {/* Title + Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Title</label>
              <Select value={passenger.title} onValueChange={(v) => onUpdate("title", v)}>
                <SelectTrigger className={inputCn("title")}>
                  <SelectValue placeholder="Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="ms">Ms</SelectItem>
                  <SelectItem value="mrs">Mrs</SelectItem>
                  <SelectItem value="miss">Miss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Gender</label>
              <Select value={passenger.gender} onValueChange={(v) => onUpdate("gender", v)}>
                <SelectTrigger className={cn(inputCn("gender"), !passenger.gender && "text-muted-foreground")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Male</SelectItem>
                  <SelectItem value="f">Female</SelectItem>
                </SelectContent>
              </Select>
              {fieldError("gender") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("gender")}</p>}
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">First name</label>
              <Input
                placeholder="As on passport"
                value={passenger.given_name}
                onChange={(e) => onUpdate("given_name", e.target.value)}
                className={inputCn("given_name")}
                autoComplete="given-name"
              />
              {fieldError("given_name") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("given_name")}</p>}
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Last name</label>
              <Input
                placeholder="As on passport"
                value={passenger.family_name}
                onChange={(e) => onUpdate("family_name", e.target.value)}
                className={inputCn("family_name")}
                autoComplete="family-name"
              />
              {fieldError("family_name") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("family_name")}</p>}
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              Date of Birth
            </label>
            <Input
              type="date"
              value={passenger.born_on}
              onChange={(e) => onUpdate("born_on", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={inputCn("born_on")}
            />
            {fieldError("born_on") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("born_on")}</p>}
          </div>

          {/* Passport section — for international flights */}
          {isInternational && (
            <>
              <Separator className="bg-border/20 my-1" />
              <div className="flex items-center gap-1.5 mb-1">
                <Globe className="w-3 h-3 text-[hsl(var(--flights))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--flights))]">Travel document</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] max-w-[200px]">
                      Required for international travel. Passport must be valid for at least 6 months from travel date.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Nationality</label>
                <Select value={passenger.nationality} onValueChange={(v) => onUpdate("nationality", v)}>
                  <SelectTrigger className={cn(inputCn("nationality"), !passenger.nationality && "text-muted-foreground")}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {POPULAR_NATIONALITIES.map(n => (
                      <SelectItem key={n.code} value={n.code}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Passport number</label>
                  <Input
                    placeholder="AB1234567"
                    value={passenger.passport_number}
                    onChange={(e) => onUpdate("passport_number", e.target.value.toUpperCase())}
                    className={inputCn("passport_number")}
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Expiry date</label>
                  <Input
                    type="date"
                    value={passenger.passport_expiry}
                    onChange={(e) => onUpdate("passport_expiry", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCn("passport_expiry")}
                  />
                </div>
              </div>

              {/* Passport status warning */}
              {passportStatus === "warning" && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Passport expires within 6 months. Some countries require longer validity.
                  </p>
                </div>
              )}
              {passportStatus === "expired" && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <p className="text-[10px] text-destructive">
                    This passport has expired. Please update before traveling.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Contact (only first passenger) */}
          {index === 0 && (
            <>
              <Separator className="bg-border/20 my-1" />
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                Contact details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={passenger.email}
                    onChange={(e) => onUpdate("email", e.target.value)}
                    className={inputCn("email")}
                    autoComplete="email"
                  />
                  {fieldError("email") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("email")}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    Phone <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={passenger.phone_number}
                    onChange={(e) => onUpdate("phone_number", e.target.value)}
                    className={inputCn("phone_number")}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

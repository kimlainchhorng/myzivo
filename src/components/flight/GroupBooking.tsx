import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  Baby,
  User,
  Crown,
  Armchair,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  specialRequests?: string[];
  seatPreference?: 'window' | 'aisle' | 'middle' | 'none';
  isLeadPassenger?: boolean;
}

interface GroupBookingProps {
  maxPassengers?: number;
  basePrice?: number;
  onPassengersChange?: (passengers: Passenger[]) => void;
  className?: string;
}

const createPassenger = (type: 'adult' | 'child' | 'infant' = 'adult', isLead = false): Passenger => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  firstName: '',
  lastName: '',
  isLeadPassenger: isLead,
  seatPreference: 'none',
  specialRequests: []
});

const SPECIAL_REQUESTS = [
  { id: 'wheelchair', label: 'Wheelchair assistance' },
  { id: 'dietary', label: 'Special meal' },
  { id: 'bassinet', label: 'Bassinet (infants)' },
  { id: 'unaccompanied', label: 'Unaccompanied minor' },
  { id: 'pet', label: 'Traveling with pet' },
  { id: 'medical', label: 'Medical equipment' },
  { id: 'oxygen', label: 'Portable oxygen' },
];

const GROUP_DISCOUNTS = [
  { minPassengers: 5, discount: 0.05, label: '5% off' },
  { minPassengers: 8, discount: 0.10, label: '10% off' },
  { minPassengers: 15, discount: 0.15, label: '15% off' },
  { minPassengers: 25, discount: 0.20, label: '20% off' },
];

export const GroupBooking = ({
  maxPassengers = 50,
  basePrice = 450,
  onPassengersChange,
  className
}: GroupBookingProps) => {
  const [passengers, setPassengers] = useState<Passenger[]>([
    createPassenger('adult', true)
  ]);
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(passengers[0].id);
  const [seatTogether, setSeatTogether] = useState(true);

  const addPassenger = (type: 'adult' | 'child' | 'infant') => {
    if (passengers.length >= maxPassengers) return;
    const newPassengers = [...passengers, createPassenger(type)];
    setPassengers(newPassengers);
    onPassengersChange?.(newPassengers);
  };

  const removePassenger = (id: string) => {
    const passenger = passengers.find(p => p.id === id);
    if (passenger?.isLeadPassenger) return; // Can't remove lead passenger
    const newPassengers = passengers.filter(p => p.id !== id);
    setPassengers(newPassengers);
    onPassengersChange?.(newPassengers);
  };

  const updatePassenger = (id: string, updates: Partial<Passenger>) => {
    const newPassengers = passengers.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPassengers(newPassengers);
    onPassengersChange?.(newPassengers);
  };

  const toggleSpecialRequest = (passengerId: string, requestId: string) => {
    const passenger = passengers.find(p => p.id === passengerId);
    if (!passenger) return;
    
    const requests = passenger.specialRequests || [];
    const updated = requests.includes(requestId)
      ? requests.filter(r => r !== requestId)
      : [...requests, requestId];
    
    updatePassenger(passengerId, { specialRequests: updated });
  };

  // Count by type
  const adultCount = passengers.filter(p => p.type === 'adult').length;
  const childCount = passengers.filter(p => p.type === 'child').length;
  const infantCount = passengers.filter(p => p.type === 'infant').length;

  // Calculate pricing with tiered discounts
  const adultPrice = basePrice;
  const childPrice = Math.round(basePrice * 0.75);
  const infantPrice = Math.round(basePrice * 0.1);
  const totalPrice = (adultCount * adultPrice) + (childCount * childPrice) + (infantCount * infantPrice);
  
  // Find applicable discount tier
  const applicableDiscount = GROUP_DISCOUNTS.reduce((acc, tier) => 
    passengers.length >= tier.minPassengers ? tier : acc
  , { minPassengers: 0, discount: 0, label: '' });
  
  const groupDiscount = applicableDiscount.discount;
  const nextDiscountTier = GROUP_DISCOUNTS.find(t => t.minPassengers > passengers.length);
  const finalPrice = Math.round(totalPrice * (1 - groupDiscount));

  const getPassengerIcon = (type: string) => {
    switch (type) {
      case 'child': return <User className="w-4 h-4" />;
      case 'infant': return <Baby className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Group Booking</CardTitle>
              <p className="text-sm text-muted-foreground">
                {passengers.length} passenger{passengers.length > 1 ? 's' : ''} • Up to {maxPassengers} allowed
              </p>
            </div>
          </div>

          {/* Passenger Count Summary */}
          <div className="flex items-center gap-2">
            {adultCount > 0 && (
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" /> {adultCount}
              </Badge>
            )}
            {childCount > 0 && (
              <Badge variant="outline" className="gap-1 bg-sky-500/10 text-sky-400 border-sky-500/40">
                <User className="w-3 h-3" /> {childCount}
              </Badge>
            )}
            {infantCount > 0 && (
              <Badge variant="outline" className="gap-1 bg-pink-500/10 text-pink-400 border-pink-500/40">
                <Baby className="w-3 h-3" /> {infantCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Add Passenger Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPassenger('adult')}
            disabled={passengers.length >= maxPassengers}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Adult
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPassenger('child')}
            disabled={passengers.length >= maxPassengers}
            className="gap-2 border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
          >
            <User className="w-4 h-4" />
            Add Child (2-11)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addPassenger('infant')}
            disabled={passengers.length >= maxPassengers || infantCount >= adultCount}
            className="gap-2 border-pink-500/40 text-pink-400 hover:bg-pink-500/10"
          >
            <Baby className="w-4 h-4" />
            Add Infant (0-2)
          </Button>
        </div>

        {/* Seat Together Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Seat group together</span>
          </div>
          <Switch
            checked={seatTogether}
            onCheckedChange={setSeatTogether}
          />
        </div>

        {/* Passenger List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {passengers.map((passenger, index) => (
              <motion.div
                key={passenger.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-200",
                  expandedPassenger === passenger.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/30"
                )}
              >
                {/* Passenger Header */}
                <button
                  onClick={() => setExpandedPassenger(
                    expandedPassenger === passenger.id ? null : passenger.id
                  )}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      passenger.type === 'adult' && "bg-violet-500/20 text-violet-400",
                      passenger.type === 'child' && "bg-sky-500/20 text-sky-400",
                      passenger.type === 'infant' && "bg-pink-500/20 text-pink-400"
                    )}>
                      {getPassengerIcon(passenger.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {passenger.firstName && passenger.lastName
                            ? `${passenger.firstName} ${passenger.lastName}`
                            : `Passenger ${index + 1}`}
                        </span>
                        {passenger.isLeadPassenger && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
                            <Crown className="w-3 h-3 mr-1" />
                            Lead
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {passenger.type}
                        {passenger.type === 'adult' && ` • $${adultPrice}`}
                        {passenger.type === 'child' && ` • $${childPrice}`}
                        {passenger.type === 'infant' && ` • $${infantPrice}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!passenger.isLeadPassenger && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePassenger(passenger.id);
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {expandedPassenger === passenger.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Form */}
                <AnimatePresence>
                  {expandedPassenger === passenger.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">First Name</Label>
                            <Input
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(passenger.id, { firstName: e.target.value })}
                              placeholder="First name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Last Name</Label>
                            <Input
                              value={passenger.lastName}
                              onChange={(e) => updatePassenger(passenger.id, { lastName: e.target.value })}
                              placeholder="Last name"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        {/* Contact (Lead passenger only) */}
                        {passenger.isLeadPassenger && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email
                              </Label>
                              <Input
                                type="email"
                                value={passenger.email || ''}
                                onChange={(e) => updatePassenger(passenger.id, { email: e.target.value })}
                                placeholder="email@example.com"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Phone
                              </Label>
                              <Input
                                type="tel"
                                value={passenger.phone || ''}
                                onChange={(e) => updatePassenger(passenger.id, { phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}

                        {/* Seat Preference */}
                        <div>
                          <Label className="text-xs">Seat Preference</Label>
                          <Select
                            value={passenger.seatPreference}
                            onValueChange={(value: any) => updatePassenger(passenger.id, { seatPreference: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No preference</SelectItem>
                              <SelectItem value="window">Window</SelectItem>
                              <SelectItem value="aisle">Aisle</SelectItem>
                              <SelectItem value="middle">Middle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Special Requests */}
                        <div>
                          <Label className="text-xs mb-2 block">Special Requests</Label>
                          <div className="flex flex-wrap gap-2">
                            {SPECIAL_REQUESTS.map(request => (
                              <button
                                key={request.id}
                                onClick={() => toggleSpecialRequest(passenger.id, request.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5",
                                  passenger.specialRequests?.includes(request.id)
                                    ? "bg-primary/20 text-primary border border-primary/40"
                                    : "bg-muted/50 text-muted-foreground border border-transparent hover:border-border"
                                )}
                              >
                                {passenger.specialRequests?.includes(request.id) && (
                                  <Check className="w-3 h-3" />
                                )}
                                {request.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="font-semibold">Group Pricing Summary</span>
          </div>
          
          <div className="space-y-2 text-sm">
            {adultCount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{adultCount}x Adult @ ${adultPrice}</span>
                <span>${adultCount * adultPrice}</span>
              </div>
            )}
            {childCount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{childCount}x Child @ ${childPrice}</span>
                <span>${childCount * childPrice}</span>
              </div>
            )}
            {infantCount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{infantCount}x Infant @ ${infantPrice}</span>
                <span>${infantCount * infantPrice}</span>
              </div>
            )}
            
            {groupDiscount > 0 && (
              <>
                <div className="border-t border-border/50 my-2" />
                <div className="flex justify-between text-emerald-400">
                  <span>Group discount ({Math.round(groupDiscount * 100)}% off)</span>
                  <span>-${Math.round(totalPrice * groupDiscount)}</span>
                </div>
              </>
            )}
            
            <div className="border-t border-border/50 my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-violet-400">${finalPrice}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupBooking;

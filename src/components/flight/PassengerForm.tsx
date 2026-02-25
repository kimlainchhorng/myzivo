import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User, Baby, Users, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  frequentFlyerNumber?: string;
  mealPreference?: string;
  specialAssistance?: string[];
  isComplete: boolean;
}

interface PassengerFormProps {
  passengers: Passenger[];
  onPassengersChange: (passengers: Passenger[]) => void;
  isInternational?: boolean;
}

const emptyPassenger = (type: 'adult' | 'child' | 'infant', index: number): Passenger => ({
  id: `${type}-${index}`,
  type,
  title: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  nationality: '',
  passportNumber: '',
  passportExpiry: '',
  frequentFlyerNumber: '',
  mealPreference: 'standard',
  specialAssistance: [],
  isComplete: false
});

const mealOptions = [
  { value: 'standard', label: 'Standard Meal' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'diabetic', label: 'Diabetic' },
  { value: 'child', label: 'Child Meal' },
  { value: 'infant', label: 'Infant Meal' }
];

const nationalities = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Japan', 'Singapore', 'UAE', 'India', 'China', 'Brazil',
  'Mexico', 'South Korea', 'Italy', 'Spain', 'Netherlands', 'Switzerland'
];

export default function PassengerForm({ 
  passengers, 
  onPassengersChange,
  isInternational = true
}: PassengerFormProps) {
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(passengers[0]?.id || null);

  const updatePassenger = (id: string, field: keyof Passenger, value: any) => {
    const updated = passengers.map(p => {
      if (p.id !== id) return p;
      
      const updatedPassenger = { ...p, [field]: value };
      
      // Check completion
      const requiredFields = ['title', 'firstName', 'lastName', 'dateOfBirth'];
      if (isInternational) {
        requiredFields.push('nationality', 'passportNumber', 'passportExpiry');
      }
      
      updatedPassenger.isComplete = requiredFields.every(f => 
        updatedPassenger[f as keyof Passenger]
      );
      
      return updatedPassenger;
    });
    
    onPassengersChange(updated);
  };

  const getPassengerIcon = (type: Passenger['type']) => {
    switch (type) {
      case 'adult': return User;
      case 'child': return Users;
      case 'infant': return Baby;
    }
  };

  const getPassengerLabel = (type: Passenger['type'], index: number) => {
    const typeLabels = {
      adult: 'Adult',
      child: 'Child (2-11)',
      infant: 'Infant (under 2)'
    };
    return `${typeLabels[type]} ${index + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Passenger details</span>
            <span className="font-medium">
              {passengers.filter(p => p.isComplete).length}/{passengers.length} complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ 
                width: `${(passengers.filter(p => p.isComplete).length / passengers.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Passenger forms */}
      <div className="space-y-3">
        {passengers.map((passenger, index) => {
          const Icon = getPassengerIcon(passenger.type);
          const isExpanded = expandedPassenger === passenger.id;
          const typeIndex = passengers.filter((p, i) => p.type === passenger.type && i <= index).length;
          
          return (
            <Collapsible
              key={passenger.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedPassenger(open ? passenger.id : null)}
            >
              <div className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? "border-primary/30 bg-card" : "border-border/50 bg-card/50"
              )}>
                <CollapsibleTrigger className="w-full">
                  <div className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      passenger.isComplete ? "bg-emerald-500/20" : "bg-muted"
                    )}>
                      {passenger.isComplete ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {passenger.firstName && passenger.lastName 
                            ? `${passenger.title} ${passenger.firstName} ${passenger.lastName}`
                            : getPassengerLabel(passenger.type, typeIndex - 1)
                          }
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {passenger.type}
                        </Badge>
                      </div>
                      {!passenger.isComplete && (
                        <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          Details required
                        </p>
                      )}
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                    {/* Basic info row */}
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Select
                          value={passenger.title}
                          onValueChange={(v) => updatePassenger(passenger.id, 'title', v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Miss">Miss</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs text-muted-foreground">First Name</Label>
                        <Input
                          className="mt-1"
                          value={passenger.firstName}
                          onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                          placeholder="As on passport"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs text-muted-foreground">Last Name</Label>
                        <Input
                          className="mt-1"
                          value={passenger.lastName}
                          onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                          placeholder="As on passport"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                        <Input
                          className="mt-1"
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) => updatePassenger(passenger.id, 'dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Passport info (for international) */}
                    {isInternational && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nationality</Label>
                          <Select
                            value={passenger.nationality}
                            onValueChange={(v) => updatePassenger(passenger.id, 'nationality', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {nationalities.map(n => (
                                <SelectItem key={n} value={n}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Passport Number</Label>
                          <Input
                            className="mt-1"
                            value={passenger.passportNumber}
                            onChange={(e) => updatePassenger(passenger.id, 'passportNumber', e.target.value.toUpperCase())}
                            placeholder="AB1234567"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Passport Expiry</Label>
                          <Input
                            className="mt-1"
                            type="date"
                            value={passenger.passportExpiry}
                            onChange={(e) => updatePassenger(passenger.id, 'passportExpiry', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Meal Preference</Label>
                        <Select
                          value={passenger.mealPreference}
                          onValueChange={(v) => updatePassenger(passenger.id, 'mealPreference', v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mealOptions.map(m => (
                              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Frequent Flyer # (optional)</Label>
                        <Input
                          className="mt-1"
                          value={passenger.frequentFlyerNumber || ''}
                          onChange={(e) => updatePassenger(passenger.id, 'frequentFlyerNumber', e.target.value)}
                          placeholder="Enter program number"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Validation message */}
      {passengers.some(p => !p.isComplete) && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-sm text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Please complete all passenger details to continue
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to create initial passengers based on count
export const createPassengers = (adults: number, children: number, infants: number): Passenger[] => {
  const passengers: Passenger[] = [];
  
  for (let i = 0; i < adults; i++) {
    passengers.push(emptyPassenger('adult', i));
  }
  for (let i = 0; i < children; i++) {
    passengers.push(emptyPassenger('child', i));
  }
  for (let i = 0; i < infants; i++) {
    passengers.push(emptyPassenger('infant', i));
  }
  
  return passengers;
};

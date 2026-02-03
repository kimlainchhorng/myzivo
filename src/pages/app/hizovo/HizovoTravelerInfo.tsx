/**
 * Hizovo Travel App - Traveler Information Screen
 * Collects passenger details with consent before partner handoff
 * 
 * LOCKED COMPLIANCE: Uses flightCompliance.ts for all text
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, Mail, Phone, Calendar, Shield, ArrowRight,
  CheckCircle, AlertCircle, Info, Lock, Plane, ExternalLink
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getSearchSessionId } from "@/config/trackingParams";
import { logPartnerRedirect } from "@/lib/partnerRedirectLog";
import { 
  FLIGHT_CONSENT, 
  FLIGHT_DISCLAIMERS, 
  FLIGHT_CTA_TEXT 
} from "@/config/flightCompliance";

const HizovoTravelerInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const flight = location.state?.flight;
  const searchParams = location.state?.searchParams;
  const sessionId = location.state?.sessionId || getSearchSessionId();
  
  // Form state
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  // Consent state
  const [consentGiven, setConsentGiven] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinueToCheckout = async () => {
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!consentGiven) {
      toast.error("Please agree to share your information with the booking partner");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log the redirect
      await logPartnerRedirect({
        partnerId: 'duffel',
        partnerName: 'Duffel',
        searchType: 'flights',
        redirectUrl: 'https://book.duffel.com/checkout',
        checkoutMode: 'redirect',
        searchParams: {
          origin: flight?.from,
          destination: flight?.to,
          passengers: 1,
        },
        metadata: {
          pageSource: 'app-traveler-info',
        }
      });
      
      // Navigate to checkout handoff
      navigate('/app/flights/checkout', {
        state: {
          flight,
          searchParams,
          sessionId,
          travelerInfo: {
            title,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
          }
        }
      });
    } catch (error) {
      console.error('Error logging redirect:', error);
      // Still proceed even if logging fails
      navigate('/app/flights/checkout', {
        state: { flight, searchParams, sessionId, travelerInfo: { title, firstName, lastName, email, phone, dateOfBirth } }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HizovoAppLayout title="Traveler Details" showBack>
      <div className="pb-32">
        <div className="p-4 space-y-6">
          {/* Flight Summary */}
          {flight && (
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Flight</p>
                  <p className="font-bold">{flight.from} → {flight.to}</p>
                  <p className="text-sm text-muted-foreground">{flight.airline}</p>
                </div>
                <p className="text-xl font-bold text-sky-500">${flight.price}</p>
              </div>
            </div>
          )}

          {/* Traveler Form */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Passenger 1 (Adult)
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Title</Label>
                <Select value={title} onValueChange={setTitle}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>First Name *</Label>
                <Input 
                  placeholder="As shown on ID"
                  className="h-12 rounded-xl"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Last Name *</Label>
              <Input 
                placeholder="As shown on ID"
                className="h-12 rounded-xl"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="date"
                  placeholder="YYYY-MM-DD"
                  className="h-12 pl-10 rounded-xl"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Details
            </h3>
            
            <div>
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 pl-10 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Booking confirmation will be sent here</p>
            </div>
            
            <div>
              <Label>Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="h-12 pl-10 rounded-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox - LOCKED TEXT */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="consent" 
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-sm cursor-pointer">
                <span className="font-medium">{FLIGHT_CONSENT.checkboxLabel}</span>
                <span className="text-muted-foreground block mt-1">
                  {FLIGHT_CONSENT.description}
                </span>
              </label>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{FLIGHT_CONSENT.privacy}</p>
            </div>
          </div>

          {/* Partner Disclosure - LOCKED TEXT */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{FLIGHT_DISCLAIMERS.ticketingShort}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {FLIGHT_DISCLAIMERS.checkout}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer - LOCKED CTA TEXT */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <Button 
              className="w-full h-14 rounded-xl font-bold text-lg gap-2 bg-sky-500 hover:bg-sky-600"
              onClick={handleContinueToCheckout}
              disabled={isSubmitting || !consentGiven}
            >
              <Lock className="w-5 h-5" />
              {isSubmitting ? "Processing..." : FLIGHT_CTA_TEXT.primary}
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoTravelerInfo;

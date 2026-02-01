/**
 * Admin Settings Module
 * Site settings, service toggles, branding
 */
import { useState } from "react";
import { 
  Settings, Mail, Globe, Image, Save, Plane, Hotel, CarFront, 
  Car, UtensilsCrossed, Ticket, MapPin, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Service toggles
const services = [
  { id: "flights", label: "Flights", icon: Plane, description: "Flight search & compare" },
  { id: "hotels", label: "Hotels", icon: Hotel, description: "Hotel booking" },
  { id: "cars", label: "Car Rental", icon: CarFront, description: "Car rental search" },
  { id: "rides", label: "Rides", icon: Car, description: "Ride requests (MVP)" },
  { id: "eats", label: "Eats", icon: UtensilsCrossed, description: "Food delivery (MVP)" },
  { id: "extras", label: "Extras", icon: Ticket, description: "Activities & more" },
];

export default function AdminSettingsModule() {
  // Settings state (would persist to backend in production)
  const [contactEmails, setContactEmails] = useState({
    general: "info@hizivo.com",
    payments: "payment@hizivo.com",
    support: "kimlain@hizivo.com",
  });

  const [serviceToggles, setServiceToggles] = useState<Record<string, boolean>>({
    flights: true,
    hotels: true,
    cars: true,
    rides: true,
    eats: true,
    extras: true,
  });

  const [comingSoon, setComingSoon] = useState<Record<string, boolean>>({
    flights: false,
    hotels: false,
    cars: false,
    rides: false,
    eats: false,
    extras: false,
  });

  const [defaultCity, setDefaultCity] = useState("New York");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  const toggleService = (id: string) => {
    setServiceToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComingSoon = (id: string) => {
    setComingSoon(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">Configure site settings</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Contact Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Emails
          </CardTitle>
          <CardDescription>Email addresses shown on the site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>General Inquiries</Label>
              <Input
                type="email"
                value={contactEmails.general}
                onChange={(e) => setContactEmails(prev => ({ ...prev, general: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Payments</Label>
              <Input
                type="email"
                value={contactEmails.payments}
                onChange={(e) => setContactEmails(prev => ({ ...prev, payments: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Support</Label>
              <Input
                type="email"
                value={contactEmails.support}
                onChange={(e) => setContactEmails(prev => ({ ...prev, support: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Service Configuration
          </CardTitle>
          <CardDescription>Enable/disable services and set coming soon status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    serviceToggles[service.id] ? "bg-primary/10" : "bg-muted"
                  )}>
                    <service.icon className={cn(
                      "w-5 h-5",
                      serviceToggles[service.id] ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">{service.label}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Coming Soon</Label>
                    <Switch
                      checked={comingSoon[service.id]}
                      onCheckedChange={() => toggleComingSoon(service.id)}
                      disabled={!serviceToggles[service.id]}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Active</Label>
                    <Switch
                      checked={serviceToggles[service.id]}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Default Location
          </CardTitle>
          <CardDescription>Default city for new users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Input
              value={defaultCity}
              onChange={(e) => setDefaultCity(e.target.value)}
              placeholder="Enter default city"
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Branding
          </CardTitle>
          <CardDescription>Logo and brand assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-2xl font-bold text-primary">
              ZIVO
            </div>
            <div>
              <p className="text-sm font-medium">Current Logo</p>
              <p className="text-xs text-muted-foreground">Upload a new logo to replace</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Upload Logo (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

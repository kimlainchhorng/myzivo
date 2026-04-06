import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Wrench, Car, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceImage } from "@/config/autoRepairServiceImages";

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

export default function ServiceBookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [store, setStore] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();

  const [form, setForm] = useState({
    product_id: "",
    service_name: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    preferred_time: "",
    notes: "",
  });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: s } = await supabase
        .from("store_profiles")
        .select("id, name, logo_url, address, phone, category")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!s) { setLoading(false); return; }
      setStore(s);

      // @ts-ignore - deep type instantiation
      const { data: p } = await supabase
        .from("store_products")
        .select("id, name, price, category, image_url")
        .eq("store_id", s.id);
      setServices(p || []);
      // Auto-select service from URL query param
      const preselect = searchParams.get("service");
      if (preselect) {
        const svc = (p || []).find((s: any) => s.name?.toLowerCase() === preselect.toLowerCase());
        setForm(f => ({ ...f, service_name: preselect, product_id: svc?.id || "" }));
      }
      setLoading(false);
    })();
  }, [slug]);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !date || !form.preferred_time || !form.service_name) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("service_bookings").insert({
      store_id: store.id,
      product_id: form.product_id || null,
      service_name: form.service_name,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      vehicle_make: form.vehicle_make || null,
      vehicle_model: form.vehicle_model || null,
      vehicle_year: form.vehicle_year || null,
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: form.preferred_time,
      notes: form.notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit booking. Please try again.");
      return;
    }
    toast.success("Booking submitted! We'll confirm shortly.");
    navigate(-1);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!store) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><p className="text-muted-foreground">Store not found</p><Button onClick={() => navigate(-1)}>Go Back</Button></div>;

  const selectedService = services.find(s => s.name === form.service_name);
  const serviceImg = form.service_name ? (selectedService?.image_url || getServiceImage(form.service_name)) : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            {store.logo_url && <img src={store.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
            <div>
              <h1 className="font-semibold text-foreground text-sm">{store.name}</h1>
              <p className="text-xs text-muted-foreground">Book a Service</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Service Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Select Service
            </CardTitle>
          </CardHeader>
           <CardContent className="space-y-3">
            <select
              value={form.service_name}
              onChange={(e) => {
                const name = e.target.value;
                update("service_name", name);
                const svc = services.find(s => s.name === name);
                update("product_id", svc?.id || "");
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a service...</option>
              <optgroup label="🛢️ Oil & Fluids">
                <option>Oil Change - Conventional</option>
                <option>Oil Change - Synthetic</option>
                <option>Oil Change - Full Synthetic</option>
                <option>Transmission Fluid Change</option>
                <option>Coolant Flush</option>
                <option>Brake Fluid Flush</option>
                <option>Power Steering Fluid Flush</option>
              </optgroup>
              <optgroup label="🛑 Brake System">
                <option>Front Brake Pads - Replace</option>
                <option>Rear Brake Pads - Replace</option>
                <option>Front Brake Rotors - Replace</option>
                <option>Rear Brake Rotors - Replace</option>
                <option>Brake Caliper - Replace</option>
                <option>Brake Line Repair</option>
              </optgroup>
              <optgroup label="⚙️ Engine">
                <option>Engine Tune-Up</option>
                <option>Spark Plug Replacement</option>
                <option>Timing Belt Replacement</option>
                <option>Serpentine Belt Replacement</option>
                <option>Engine Diagnostic</option>
                <option>Head Gasket Repair</option>
                <option>Engine Mount Replacement</option>
              </optgroup>
              <optgroup label="🔧 Transmission">
                <option>Transmission Repair</option>
                <option>Transmission Rebuild</option>
                <option>Clutch Replacement</option>
                <option>CV Axle Replacement</option>
                <option>Differential Service</option>
              </optgroup>
              <optgroup label="🛞 Tires & Wheels">
                <option>Tire Rotation</option>
                <option>Tire Balance</option>
                <option>Tire Replacement (per tire)</option>
                <option>Wheel Alignment - 2 Wheel</option>
                <option>Wheel Alignment - 4 Wheel</option>
                <option>Flat Tire Repair</option>
              </optgroup>
              <optgroup label="🔩 Suspension & Steering">
                <option>Shock Absorber - Replace</option>
                <option>Strut Assembly - Replace</option>
                <option>Ball Joint Replacement</option>
                <option>Control Arm Replacement</option>
                <option>Tie Rod End Replacement</option>
                <option>Power Steering Pump - Replace</option>
                <option>Steering Rack Replacement</option>
              </optgroup>
              <optgroup label="🔋 Electrical & Battery">
                <option>Battery Replacement</option>
                <option>Alternator Replacement</option>
                <option>Starter Motor Replacement</option>
                <option>Headlight Bulb Replacement</option>
                <option>Fuse Diagnosis & Replace</option>
                <option>Wiring Repair</option>
              </optgroup>
              <optgroup label="❄️ AC / Heating">
                <option>AC Recharge</option>
                <option>AC Compressor Replacement</option>
                <option>Heater Core Replacement</option>
                <option>Thermostat Replacement</option>
                <option>Radiator Replacement</option>
              </optgroup>
              <optgroup label="💨 Exhaust">
                <option>Exhaust Pipe Repair</option>
                <option>Muffler Replacement</option>
                <option>Catalytic Converter Replacement</option>
              </optgroup>
              <optgroup label="🔍 Diagnostics & Inspection">
                <option>Check Engine Light Diagnostic</option>
                <option>Pre-Purchase Inspection</option>
                <option>State Inspection</option>
                <option>Multi-Point Inspection</option>
              </optgroup>
              <optgroup label="🪟 Windshield & Glass">
                <option>Windshield Replacement</option>
                <option>Windshield Chip Repair</option>
              </optgroup>
              <optgroup label="🎨 Body & Paint">
                <option>Paint Correction</option>
                <option>Dent Repair (PDR)</option>
                <option>Bumper Repair</option>
              </optgroup>
              <optgroup label="✨ Detailing">
                <option>Full Detail - Interior & Exterior</option>
                <option>Interior Detail</option>
                <option>Exterior Detail</option>
              </optgroup>
            </select>
            {serviceImg && (
              <img src={serviceImg} alt={form.service_name} className="w-full h-40 object-cover rounded-lg" />
            )}
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Preferred Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time *</Label>
              <Select value={form.preferred_time} onValueChange={(v) => update("preferred_time", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Full Name *</Label>
              <Input required value={form.customer_name} onChange={e => update("customer_name", e.target.value)} placeholder="John Doe" className="mt-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Email *</Label>
                <Input required type="email" value={form.customer_email} onChange={e => update("customer_email", e.target.value)} placeholder="john@example.com" className="mt-1" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input required type="tel" value={form.customer_phone} onChange={e => update("customer_phone", e.target.value)} placeholder="(555) 123-4567" className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" /> Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Make</Label>
                <select
                  value={form.vehicle_make}
                  onChange={e => update("vehicle_make", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                >
                  <option value="">Select</option>
                  {["Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mini","Mitsubishi","Nissan","Porsche","Ram","Subaru","Tesla","Toyota","Volkswagen","Volvo"].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Model</Label>
                <Input value={form.vehicle_model} onChange={e => update("vehicle_model", e.target.value)} placeholder="Camry" className="mt-1" />
              </div>
              <div>
                <Label>Year</Label>
                <select
                  value={form.vehicle_year}
                  onChange={e => update("vehicle_year", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                >
                  <option value="">Select</option>
                  {Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() + 1 - i)).map(y => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <Label>Additional Notes</Label>
            <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any specific issues or requests..." className="mt-1" rows={3} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Booking Request"}
        </Button>
      </form>
    </div>
  );
}

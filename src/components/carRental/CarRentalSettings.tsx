import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Car, 
  Clock, 
  Bell, 
  CreditCard, 
  Shield, 
  FileText,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Percent,
  Sparkles,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CarRentalSettings = () => {
  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <div className="absolute -top-2 right-12 pointer-events-none hidden md:block animate-float-icon opacity-30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Settings className="w-5 h-5 text-primary/50" />
        </div>
      </div>
      <div className="absolute top-20 right-4 pointer-events-none hidden md:block animate-pulse-slow opacity-30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-violet-500/50" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20 transition-transform hover:scale-110 hover:rotate-3">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Settings
              <div className="animate-spin-slow">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </h1>
            <p className="text-muted-foreground">Configure your car rental business</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1.5">
          <Check className="h-3 w-3 mr-1.5" />
          All Saved
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Business Profile */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "80ms" }}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-500" />
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                Business Profile
              </CardTitle>
              <CardDescription>Your rental business details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 flex items-center justify-center border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/50 transition-all hover:scale-110"
                >
                  <Car className="h-10 w-10 text-primary/60" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="gap-2 bg-card/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all touch-manipulation active:scale-95">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name" className="text-sm font-medium">Business Name</Label>
                  <Input 
                    id="business-name" 
                    defaultValue="Premium Car Rentals" 
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </Label>
                  <Input 
                    id="location" 
                    defaultValue="123 Main Street, City" 
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input 
                    id="phone" 
                    defaultValue="+1 234 567 8900" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    defaultValue="info@premiumrentals.com" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Website
                </Label>
                <Input 
                  id="website" 
                  defaultValue="www.premiumrentals.com" 
                  className="bg-background/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rental Policies */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "160ms" }}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                Rental Policies
              </CardTitle>
              <CardDescription>Set your rental terms and conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Minimum Age
                  </Label>
                  <Input 
                    type="number" 
                    defaultValue="21" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    Default Deposit (%)
                  </Label>
                  <Input 
                    type="number" 
                    defaultValue="30" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Grace Period (hours)
                  </Label>
                  <Input 
                    type="number" 
                    defaultValue="2" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cancellation Policy</Label>
                <Textarea 
                  defaultValue="Free cancellation up to 24 hours before pickup. 50% refund for cancellations within 24 hours." 
                  className="bg-background/50 border-border/50 min-h-[100px] focus:border-amber-500/50"
                />
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-amber-500">Pro Tip</p>
                    <p className="text-sm text-muted-foreground">
                      These policies will be displayed to customers during the booking process. Clear policies improve trust and reduce disputes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insurance & Protection */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "240ms" }}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                Insurance & Protection
              </CardTitle>
              <CardDescription>Configure insurance options for rentals</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { title: "Basic Insurance", desc: "Collision damage waiver included", icon: Shield, color: "emerald", checked: true, emoji: "🛡️" },
                { title: "Premium Protection", desc: "Full coverage with zero deductible", icon: Shield, color: "blue", checked: true, emoji: "💎" },
                { title: "Roadside Assistance", desc: "24/7 emergency support", icon: Shield, color: "purple", checked: true, emoji: "🚗" },
              ].map((insurance, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 transition-all duration-200 group hover:translate-x-1",
                    insurance.color === "emerald" && "hover:border-emerald-500/30",
                    insurance.color === "blue" && "hover:border-blue-500/30",
                    insurance.color === "purple" && "hover:border-purple-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                      insurance.color === "emerald" && "bg-emerald-500/10",
                      insurance.color === "blue" && "bg-blue-500/10",
                      insurance.color === "purple" && "bg-purple-500/10"
                    )}>
                      <span className="text-xl">{insurance.emoji}</span>
                    </div>
                    <div>
                      <p className="font-medium">{insurance.title}</p>
                      <p className="text-sm text-muted-foreground">{insurance.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={insurance.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "320ms" }}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Bell className="h-5 w-5 text-purple-500" />
                </div>
                Notifications
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {[
                { title: "New Booking Alerts", desc: "Get notified for new bookings", checked: true, emoji: "📬" },
                { title: "Return Reminders", desc: "Remind customers about returns", checked: true, emoji: "⏰" },
                { title: "Payment Confirmations", desc: "Notifications for successful payments", checked: true, emoji: "💳" },
                { title: "Late Return Alerts", desc: "Alert when vehicles are overdue", checked: true, emoji: "⚠️" },
                { title: "Maintenance Due", desc: "Vehicle maintenance reminders", checked: false, emoji: "🔧" },
              ].map((notification, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-purple-500/30 transition-all duration-200 group hover:translate-x-1"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl group-hover:scale-110 transition-transform">{notification.emoji}</span>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notification.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Payment Settings */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                Payment Settings
              </CardTitle>
              <CardDescription>Manage payment methods and processing</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { title: "Credit/Debit Cards", desc: "Accept all major cards", checked: true, emoji: "💳" },
                { title: "Digital Wallets", desc: "Apple Pay, Google Pay", checked: true, emoji: "📱" },
                { title: "Pay Later Options", desc: "Split payments available", checked: false, emoji: "🔄" },
              ].map((payment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-blue-500/30 transition-all duration-200 group hover:translate-x-1"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl group-hover:scale-110 transition-transform">{payment.emoji}</span>
                    <div>
                      <p className="font-medium">{payment.title}</p>
                      <p className="text-sm text-muted-foreground">{payment.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={payment.checked} />
                </div>
              ))}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Processing Fee (%)</Label>
                  <Input 
                    type="number" 
                    defaultValue="2.9" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Currency</Label>
                  <Input 
                    defaultValue="USD" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "480ms" }}>
          <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 touch-manipulation active:scale-95">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarRentalSettings;

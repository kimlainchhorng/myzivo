import { motion } from "framer-motion";
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
  Percent
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CarRentalSettings = () => {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure your car rental business</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Business Profile */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Business Profile
              </CardTitle>
              <CardDescription>Your rental business details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                  <Car className="h-10 w-10 text-primary/60" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="gap-2">
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
                    className="bg-background/50 border-border/50 focus:border-primary"
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
                    className="bg-background/50 border-border/50"
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
        </motion.div>

        {/* Rental Policies */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
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
                  className="bg-background/50 border-border/50 min-h-[100px]"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-500">
                  <strong>Important:</strong> These policies will be displayed to customers during the booking process.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insurance & Protection */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Insurance & Protection
              </CardTitle>
              <CardDescription>Configure insurance options for rentals</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Basic Insurance</p>
                    <p className="text-sm text-muted-foreground">Collision damage waiver included</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Premium Protection</p>
                    <p className="text-sm text-muted-foreground">Full coverage with zero deductible</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Roadside Assistance</p>
                    <p className="text-sm text-muted-foreground">24/7 emergency support</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Notifications
              </CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { title: "New Booking Alerts", desc: "Get notified for new bookings", checked: true },
                { title: "Return Reminders", desc: "Remind customers about returns", checked: true },
                { title: "Payment Confirmations", desc: "Notifications for successful payments", checked: true },
                { title: "Late Return Alerts", desc: "Alert when vehicles are overdue", checked: true },
                { title: "Maintenance Due", desc: "Vehicle maintenance reminders", checked: false },
              ].map((notification, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-purple-500/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.desc}</p>
                  </div>
                  <Switch defaultChecked={notification.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Settings */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-emerald-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Payment Settings
              </CardTitle>
              <CardDescription>Manage payment methods and processing</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Credit/Debit Cards</p>
                    <p className="text-sm text-muted-foreground">Accept all major cards</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CreditCard className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Digital Wallets</p>
                    <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Pay Later Options</p>
                    <p className="text-sm text-muted-foreground">Split payments available</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
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
        </motion.div>

        {/* Save Button */}
        <motion.div variants={item} className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarRentalSettings;

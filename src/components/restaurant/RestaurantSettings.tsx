import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Store, 
  Clock, 
  Truck, 
  Bell, 
  CreditCard, 
  Shield, 
  Palette,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe
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

const RestaurantSettings = () => {
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
          <div className="p-2 rounded-xl bg-gradient-to-br from-eats/20 to-orange-500/10">
            <Settings className="h-6 w-6 text-eats" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your restaurant settings</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Restaurant Profile */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-eats/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-eats" />
                Restaurant Profile
              </CardTitle>
              <CardDescription>Basic information about your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center border-2 border-dashed border-eats/30">
                  <Store className="h-10 w-10 text-eats/60" />
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
                  <Label htmlFor="name" className="text-sm font-medium">Restaurant Name</Label>
                  <Input 
                    id="name" 
                    defaultValue="Bella Italia" 
                    className="bg-background/50 border-border/50 focus:border-eats"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine" className="text-sm font-medium">Cuisine Type</Label>
                  <Input 
                    id="cuisine" 
                    defaultValue="Italian" 
                    className="bg-background/50 border-border/50 focus:border-eats"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue="Authentic Italian cuisine in the heart of the city" 
                  className="bg-background/50 border-border/50 focus:border-eats min-h-[100px]"
                />
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
                    defaultValue="info@bellaitalia.com" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address
                  </Label>
                  <Input 
                    id="address" 
                    defaultValue="123 Main Street, City" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Website
                  </Label>
                  <Input 
                    id="website" 
                    defaultValue="www.bellaitalia.com" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Operating Hours */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Operating Hours
              </CardTitle>
              <CardDescription>Set your opening and closing times</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="font-medium">Currently Open</p>
                    <p className="text-sm text-muted-foreground">Toggle to set your restaurant status</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Opening Time</Label>
                  <Input 
                    type="time" 
                    defaultValue="10:00" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Closing Time</Label>
                  <Input 
                    type="time" 
                    defaultValue="22:00" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-500">
                  <strong>Tip:</strong> Set different hours for weekdays and weekends in the advanced scheduling section.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delivery Settings */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-500/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                Delivery Settings
              </CardTitle>
              <CardDescription>Configure delivery options</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Average Prep Time (minutes)</Label>
                  <Input 
                    type="number" 
                    defaultValue="30" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Delivery Radius (km)</Label>
                  <Input 
                    type="number" 
                    defaultValue="5" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum Order Amount</Label>
                  <Input 
                    type="number" 
                    defaultValue="15" 
                    className="bg-background/50 border-border/50"
                    placeholder="$"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Delivery Fee</Label>
                  <Input 
                    type="number" 
                    defaultValue="3.99" 
                    className="bg-background/50 border-border/50"
                    placeholder="$"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div>
                  <p className="font-medium">Accept Online Orders</p>
                  <p className="text-sm text-muted-foreground">Allow customers to order online</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div>
                  <p className="font-medium">Self-Pickup Available</p>
                  <p className="text-sm text-muted-foreground">Allow customers to pick up orders</p>
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
                { title: "New Order Alerts", desc: "Get notified when new orders come in", checked: true },
                { title: "Order Updates", desc: "Notifications for order status changes", checked: true },
                { title: "Low Stock Alerts", desc: "Alert when menu items are running low", checked: false },
                { title: "Customer Reviews", desc: "Get notified for new reviews", checked: true },
                { title: "Daily Summary", desc: "Receive daily sales summary", checked: false },
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
              <CardDescription>Manage payment methods and payouts</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Card Payments</p>
                    <p className="text-sm text-muted-foreground">Accept credit/debit cards</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Accept cash payments</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Palette className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Digital Wallets</p>
                    <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={item} className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2 bg-eats hover:bg-eats/90">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RestaurantSettings;

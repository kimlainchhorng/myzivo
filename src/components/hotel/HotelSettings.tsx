import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Sparkles, User, BedDouble, Bell, Save, Shield, Globe, CreditCard } from "lucide-react";

const HotelSettings = () => {
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

  const settingsCategories = [
    { icon: User, label: "Guest Profile", color: "from-violet-500 to-purple-500" },
    { icon: BedDouble, label: "Stay Preferences", color: "from-blue-500 to-indigo-500" },
    { icon: Bell, label: "Notifications", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 right-12 text-3xl pointer-events-none opacity-20 hidden lg:block"
      >
        ⚙️
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute top-24 right-0 text-2xl pointer-events-none opacity-15 hidden lg:block"
      >
        🔧
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Settings
        </h1>
        <p className="text-muted-foreground">Configure your hotel booking preferences</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <User className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Guest Profile</CardTitle>
                  <CardDescription>Your default guest information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-muted/50 border-border/50 focus:border-violet-500/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="bg-muted/50 border-border/50 focus:border-violet-500/50" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1 234 567 8900" className="bg-muted/50 border-border/50 focus:border-violet-500/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" placeholder="United States" className="bg-muted/50 border-border/50 focus:border-violet-500/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <BedDouble className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Stay Preferences</CardTitle>
                  <CardDescription>Your preferred room and amenity choices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type Preference</Label>
                  <Input placeholder="King Bed, Non-smoking" className="bg-muted/50 border-border/50 focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <Label>Floor Preference</Label>
                  <Input placeholder="High floor" className="bg-muted/50 border-border/50 focus:border-blue-500/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Textarea placeholder="Any special requirements or requests..." className="bg-muted/50 border-border/50 focus:border-blue-500/50 min-h-[100px]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div>
                  <p className="font-medium">Booking Confirmations</p>
                  <p className="text-sm text-muted-foreground">Receive email confirmations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div>
                  <p className="font-medium">Check-in Reminders</p>
                  <p className="text-sm text-muted-foreground">24 hours before check-in</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div>
                  <p className="font-medium">Special Offers</p>
                  <p className="text-sm text-muted-foreground">Receive promotional deals</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex justify-end">
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HotelSettings;

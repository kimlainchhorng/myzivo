import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, User, Bell, Shield, CreditCard, Plane, Settings } from "lucide-react";
import { motion } from "framer-motion";

const FlightSettings = () => {
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

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <motion.div
        className="absolute -top-2 right-16 pointer-events-none hidden md:block opacity-30"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/15 to-slate-400/10 flex items-center justify-center backdrop-blur-sm">
          <Settings className="w-5 h-5 text-slate-400/60" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-20 right-4 pointer-events-none hidden md:block opacity-25"
        animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/15 to-yellow-400/10 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-400/60" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-40 right-8 pointer-events-none hidden lg:block opacity-20"
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500/15 to-sky-400/10 flex items-center justify-center backdrop-blur-sm">
          <Plane className="w-4 h-4 text-sky-400/60" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-6 w-6 text-sky-500" />
          </motion.div>
          Settings
        </h1>
        <p className="text-muted-foreground">Configure your flight booking preferences</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-teal-400" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Traveler Profile
              </CardTitle>
              <CardDescription>Your default traveler information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (as on ID)</Label>
                  <Input id="name" placeholder="John Doe" className="bg-muted/50 border-border/50 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport">Passport Number</Label>
                  <Input id="passport" placeholder="A12345678" className="bg-muted/50 border-border/50 focus:border-primary font-mono" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" className="bg-muted/50 border-border/50 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" placeholder="United States" className="bg-muted/50 border-border/50 focus:border-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Plane className="h-5 w-5 text-sky-500" />
                </div>
                Flight Preferences
              </CardTitle>
              <CardDescription>Your preferred flight settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Seat</Label>
                  <Input placeholder="Window" className="bg-muted/50 border-border/50 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label>Meal Preference</Label>
                  <Input placeholder="Regular" className="bg-muted/50 border-border/50 focus:border-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Receive Price Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when prices drop</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Bell className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Check-in Reminders</p>
                    <p className="text-sm text-muted-foreground">24 hours before flight</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Booking Confirmations</p>
                    <p className="text-sm text-muted-foreground">Email & SMS confirmations</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex justify-end">
          <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg hover:shadow-xl transition-shadow px-8">
            Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FlightSettings;

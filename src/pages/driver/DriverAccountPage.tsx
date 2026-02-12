import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Car, ArrowLeft, User, Phone, Save, Loader2, 
  Database, Radio, Shield, CheckCircle, AlertCircle, Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDriverProfile } from "@/hooks/useDriverApp";
import { updateDriverProfile } from "@/lib/supabaseDriver";
import { toast } from "sonner";
import DriverRatingDashboard from "@/components/driver/DriverRatingDashboard";

const DriverAccountPage = () => {
  const navigate = useNavigate();
  const { data: driver, isLoading, refetch } = useDriverProfile();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when driver loads
  useEffect(() => {
    if (driver) {
      setFullName(driver.full_name || "");
      setPhone(driver.phone || "");
      setVehicleModel(driver.vehicle_model || "");
      setVehiclePlate(driver.vehicle_plate || "");
    }
  }, [driver]);

  const handleSave = async () => {
    if (!driver) return;
    
    setIsSaving(true);
    const success = await updateDriverProfile(driver.id, {
      full_name: fullName || undefined,
      phone: phone || undefined,
      vehicle_model: vehicleModel || undefined,
      vehicle_plate: vehiclePlate || undefined,
    });

    if (success) {
      toast.success("Profile updated!");
      refetch();
    } else {
      toast.error("Failed to update profile");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/driver")}
            className="text-white/60"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Account</p>
              <p className="text-xs text-white/40">Settings & Setup</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary">Profile</TabsTrigger>
            <TabsTrigger value="ratings" className="data-[state=active]:bg-primary">
              <Star className="w-4 h-4 mr-1" /> Ratings
            </TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-primary">Setup</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Account Status */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {driver?.status === "verified" ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-400">Verified Driver</p>
                        <p className="text-xs text-white/40">You can accept rides</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-400">Pending Verification</p>
                        <p className="text-xs text-white/40">Awaiting admin approval</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="vehicleModel"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Toyota Camry 2022"
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">License Plate</Label>
                  <Input
                    id="vehiclePlate"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="ABC-1234"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-primary to-green-500"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="mt-4">
            <DriverRatingDashboard driverId={driver?.id} />
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4 mt-4">
            {/* Supabase Tables */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Supabase Tables
                </CardTitle>
                <CardDescription>Required database tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/60">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="font-mono text-primary">drivers</p>
                  <p className="text-xs mt-1">Stores driver profiles, location, online status</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="font-mono text-primary">trips</p>
                  <p className="text-xs mt-1">Stores ride requests, status, driver assignment</p>
                </div>
              </CardContent>
            </Card>

            {/* Realtime Setup */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5" />
                  Realtime Required
                </CardTitle>
                <CardDescription>Enable realtime for dispatch to work</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/60">
                <p className="mb-2">In Supabase Dashboard:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to Database → Replication</li>
                  <li>Enable realtime for <span className="font-mono text-primary">trips</span></li>
                  <li>Enable realtime for <span className="font-mono text-primary">drivers</span></li>
                </ol>
              </CardContent>
            </Card>

            {/* Same Project Note */}
            <Card className="bg-zinc-900/80 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Same Supabase Project
                </CardTitle>
                <CardDescription>Driver + Rider apps must share backend</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/60">
                <p>Both the Rider app and this Driver app connect to the same Supabase project. When a rider requests a ride, it appears in realtime for online drivers.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverAccountPage;

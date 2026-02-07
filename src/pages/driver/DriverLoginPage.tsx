import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Mail, Lock, Loader2, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DriverLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has a driver profile
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("id, status")
        .eq("user_id", data.user.id)
        .single();

      if (driverError) {
        // No driver profile found
        toast.error("No driver account found for this email. Please sign up first.");
        await supabase.auth.signOut();
        return;
      }

      if (driverData.status !== "verified") {
        toast.warning("Your driver account is pending verification. Please wait for approval.");
        // Still allow access to see pending status
      }

      toast.success("Welcome back!");
      navigate("/driver");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/driver",
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      // 2. Create driver profile with defaults
      const { error: driverError } = await supabase
        .from("drivers")
        .insert({
          user_id: data.user.id,
          full_name: email.split("@")[0],
          email: email,
          phone: "",
          license_number: "PENDING",
          vehicle_type: "sedan",
          vehicle_plate: "PENDING",
          rating: 4.8,
          is_online: false,
          status: "pending", // Needs admin verification
        });

      if (driverError) {
        // If driver already exists, that's okay
        if (!driverError.message.includes("duplicate")) {
          throw driverError;
        }
      }

      toast.success("Account created! Pending verification.");
      navigate("/driver");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-500/5 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Car className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">ZIVO Driver</h1>
          <p className="text-white/60">
            {mode === "signin" ? "Sign in to start earning" : "Create your driver account"}
          </p>
        </div>

        {/* Login/Signup form */}
        <Card className="bg-zinc-900/80 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border border-white/10">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={mode === "signin" ? handleLogin : handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@example.com"
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    disabled={isLoading}
                  />
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-white/40">Minimum 6 characters</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-green-500 hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </>
                ) : mode === "signin" ? (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Create Account
                    <UserPlus className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {mode === "signup" && (
              <p className="text-xs text-center text-white/40 mt-4">
                New accounts require admin verification before you can accept rides.
              </p>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-zinc-900 text-white/40">Not a driver?</span>
              </div>
            </div>

            {/* Apply button */}
            <Button
              variant="outline"
              onClick={() => navigate("/drive")}
              className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Apply to Drive
            </Button>
          </CardContent>
        </Card>

        {/* Back to rider app */}
        <p className="text-center mt-6 text-white/40 text-sm">
          Looking for a ride?{" "}
          <button
            onClick={() => navigate("/ride")}
            className="text-primary hover:underline"
          >
            Request a ride
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default DriverLoginPage;

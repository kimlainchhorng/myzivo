/**
 * Renter Waitlist Page
 * Public page for users to join the P2P renter beta waitlist
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, MapPin, User, CheckCircle, Loader2, ArrowLeft, Car } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRenterBetaSettings } from "@/hooks/useRenterBetaSettings";
import { useJoinWaitlist } from "@/hooks/useRenterWaitlist";

export default function RenterWaitlist() {
  const navigate = useNavigate();
  const { data: betaSettings, isLoading: loadingSettings } = useRenterBetaSettings();
  const joinWaitlist = useJoinWaitlist();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await joinWaitlist.mutateAsync(formData);
      setSubmitted(true);
    } catch {
      // Error handled by hook
    }
  };

  // If beta mode is off, redirect to search
  if (!loadingSettings && !betaSettings?.betaMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Rentals Are Open!</h1>
            <p className="text-muted-foreground mb-6">
              Great news! Our car rental platform is now open to everyone.
            </p>
            <Button onClick={() => navigate("/p2p/search")}>
              Browse Available Cars
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Join the ZIVO Car Rental Beta | ZIVO"
        description="Be among the first to rent cars from local owners. Join our exclusive beta program."
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {submitted ? (
            // Success state
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
                <p className="text-muted-foreground mb-6">
                  Thanks for joining. We'll send you an invite when it's your turn to start renting cars.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate("/p2p/search")} className="w-full">
                    Browse Cars (Preview)
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                    Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Form
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full mx-auto mb-4">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Private Beta</span>
                </div>
                <CardTitle className="text-2xl">Join the ZIVO Car Rental Beta</CardTitle>
                <CardDescription className="text-base">
                  {betaSettings?.betaMessage || 
                    `We're launching in ${betaSettings?.betaCity || "select cities"} with limited spots to ensure safety and quality.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        leftIcon={User}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        leftIcon={Mail}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Your City</Label>
                    <div className="relative">
                      <Input
                        id="city"
                        placeholder="Los Angeles"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        leftIcon={MapPin}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={joinWaitlist.isPending}
                  >
                    {joinWaitlist.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Waitlist"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By joining, you agree to receive updates about ZIVO car rentals. 
                    We'll never share your email.
                  </p>
                </form>

                {/* Currently accepting in */}
                {betaSettings?.betaCity && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Currently accepting applications in:
                    </p>
                    <div className="flex justify-center mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="w-3 h-3" />
                        {betaSettings.betaCity}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

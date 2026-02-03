/**
 * Car Rental Admin Settings Page
 * Configure owner-listed vs affiliate mode and global settings
 */

import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCarRentalSettings, useUpdateCarRentalSettings } from "@/hooks/useCarRentalSettings";
import {
  ArrowLeft,
  Car,
  Settings,
  Save,
  Loader2,
  Users,
  Shield,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CarRentalSettingsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading } = useCarRentalSettings();
  const updateSettings = useUpdateCarRentalSettings();

  const [formData, setFormData] = useState<{
    mode: "owner_listed" | "affiliate" | "hybrid";
    default_commission_percent: number;
    min_vehicle_year: number;
    instant_book_enabled: boolean;
    require_owner_verification: boolean;
    require_renter_verification: boolean;
    insurance_required: boolean;
    is_active: boolean;
  }>({
    mode: "owner_listed",
    default_commission_percent: 20,
    min_vehicle_year: 2018,
    instant_book_enabled: true,
    require_owner_verification: true,
    require_renter_verification: true,
    insurance_required: true,
    is_active: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        mode: settings.mode,
        default_commission_percent: settings.default_commission_percent,
        min_vehicle_year: settings.min_vehicle_year,
        instant_book_enabled: settings.instant_book_enabled,
        require_owner_verification: settings.require_owner_verification,
        require_renter_verification: settings.require_renter_verification,
        insurance_required: settings.insurance_required,
        is_active: settings.is_active,
      });
    }
  }, [settings]);

  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const modeDescriptions = {
    owner_listed: "Cars are listed by individual owners. Bookings and payments happen on ZIVO.",
    affiliate: "Cars are sourced from affiliate partners. Users are redirected to partner sites.",
    hybrid: "Both owner-listed and affiliate cars are shown. User chooses at checkout.",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Car Rental Settings | Admin" description="Configure car rental marketplace settings" />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Car className="w-6 h-6 text-primary" />
                  Car Rental Settings
                </h1>
                <p className="text-muted-foreground">
                  Configure the car rental marketplace mode and global settings
                </p>
              </div>
              <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
                {updateSettings.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Current Mode */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Rental Mode
              </CardTitle>
              <CardDescription>
                Control how car rentals are handled on ZIVO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {(["owner_listed", "affiliate", "hybrid"] as const).map((mode) => (
                  <div
                    key={mode}
                    onClick={() => setFormData((p) => ({ ...p, mode }))}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      formData.mode === mode
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/30 hover:border-muted-foreground/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2",
                            formData.mode === mode
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {formData.mode === mode && (
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{mode.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {modeDescriptions[mode]}
                          </p>
                        </div>
                      </div>
                      {mode === "owner_listed" && (
                        <Badge className="bg-emerald-500 text-white">Recommended</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Car Rental Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the entire car rental feature
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, is_active: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Commission & Pricing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Commission & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Commission (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={formData.default_commission_percent}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        default_commission_percent: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    ZIVO's commission on each booking
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Vehicle Year</Label>
                  <Input
                    type="number"
                    min={2010}
                    max={2025}
                    value={formData.min_vehicle_year}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        min_vehicle_year: parseInt(e.target.value) || 2018,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Owners can only list vehicles from this year or newer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verification Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Owner Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Owners must verify ID, registration, and insurance
                  </p>
                </div>
                <Switch
                  checked={formData.require_owner_verification}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, require_owner_verification: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Renter Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Renters must verify driver's license before first booking
                  </p>
                </div>
                <Switch
                  checked={formData.require_renter_verification}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, require_renter_verification: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Insurance Required</Label>
                  <p className="text-sm text-muted-foreground">
                    All rentals must include ZIVO insurance coverage
                  </p>
                </div>
                <Switch
                  checked={formData.insurance_required}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, insurance_required: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Booking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Instant Book</Label>
                  <p className="text-sm text-muted-foreground">
                    Owners can enable instant booking on their vehicles
                  </p>
                </div>
                <Switch
                  checked={formData.instant_book_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, instant_book_enabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Disclosure */}
          <Card className="mt-8 bg-muted/30 border-muted">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              <p>
                ZIVO operates a vehicle rental marketplace. Vehicle owners provide rental
                services directly. ZIVO facilitates booking and payment and earns a service
                commission.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

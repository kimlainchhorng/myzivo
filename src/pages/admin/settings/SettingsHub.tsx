/**
 * Admin Settings Hub
 * Global configuration for fees, rules, branding
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, MapPin, Shield, Palette, Save, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SettingsHub = () => {
  const [isSaving, setIsSaving] = useState(false);

  // Fee settings state
  const [fees, setFees] = useState({
    travelServiceFee: "5",
    flightServiceFee: "4.5",
    hotelServiceFee: "5",
    carServiceFee: "6",
    driverCommission: "20",
    deliveryFee: "3.99",
    deliveryCommission: "15",
  });

  // Risk settings state
  const [risk, setRisk] = useState({
    maxRefundAmount: "500",
    autoApproveRefundLimit: "50",
    cancellationWindowHours: "24",
    fraudScoreThreshold: "70",
    requireIdVerification: true,
    blockHighRiskCountries: false,
  });

  // Branding state
  const [branding, setBranding] = useState({
    appName: "ZIVO",
    supportEmail: "support@hizivo.com",
    supportPhone: "+1 (800) 123-4567",
    copyrightText: "© 2024 ZIVO. All rights reserved.",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // In production, would save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Global configuration and rules</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fees">
            <DollarSign className="mr-2 h-4 w-4" />
            Fees & Pricing
          </TabsTrigger>
          <TabsTrigger value="dispatch">
            <MapPin className="mr-2 h-4 w-4" />
            Dispatch Rules
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="mr-2 h-4 w-4" />
            Risk Settings
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="access">
            <UserPlus className="mr-2 h-4 w-4" />
            Access
          </TabsTrigger>
        </TabsList>

        {/* Fees & Pricing */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Travel Services</CardTitle>
              <CardDescription>Service fees for flight, hotel, and car bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flightFee">Flight Service Fee (%)</Label>
                  <Input
                    id="flightFee"
                    type="number"
                    value={fees.flightServiceFee}
                    onChange={(e) => setFees({ ...fees, flightServiceFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelFee">Hotel Service Fee (%)</Label>
                  <Input
                    id="hotelFee"
                    type="number"
                    value={fees.hotelServiceFee}
                    onChange={(e) => setFees({ ...fees, hotelServiceFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carFee">Car Rental Service Fee (%)</Label>
                  <Input
                    id="carFee"
                    type="number"
                    value={fees.carServiceFee}
                    onChange={(e) => setFees({ ...fees, carServiceFee: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver & Delivery</CardTitle>
              <CardDescription>Commission and fee structure for rides and deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="driverCommission">Driver Commission (%)</Label>
                  <Input
                    id="driverCommission"
                    type="number"
                    value={fees.driverCommission}
                    onChange={(e) => setFees({ ...fees, driverCommission: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage taken from each ride fare
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Base Delivery Fee ($)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={fees.deliveryFee}
                    onChange={(e) => setFees({ ...fees, deliveryFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryCommission">Delivery Commission (%)</Label>
                  <Input
                    id="deliveryCommission"
                    type="number"
                    value={fees.deliveryCommission}
                    onChange={(e) => setFees({ ...fees, deliveryCommission: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispatch Rules */}
        <TabsContent value="dispatch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Zones</CardTitle>
              <CardDescription>Configure operational areas and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Zone Management</p>
                  <p className="text-sm text-muted-foreground">
                    Configure cities, regions, and service boundaries
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/admin?tab=zones">Manage Zones</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Pricing</CardTitle>
              <CardDescription>Surge pricing multipliers during high demand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Low Demand Multiplier</Label>
                  <Input type="number" defaultValue="1.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>High Demand Multiplier</Label>
                  <Input type="number" defaultValue="2.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Multiplier</Label>
                  <Input type="number" defaultValue="3.0" step="0.1" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Multipliers are applied automatically based on demand in each zone.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Settings */}
        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refund Rules</CardTitle>
              <CardDescription>Automatic and manual refund thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxRefund">Maximum Refund Amount ($)</Label>
                  <Input
                    id="maxRefund"
                    type="number"
                    value={risk.maxRefundAmount}
                    onChange={(e) => setRisk({ ...risk, maxRefundAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoRefund">Auto-Approve Limit ($)</Label>
                  <Input
                    id="autoRefund"
                    type="number"
                    value={risk.autoApproveRefundLimit}
                    onChange={(e) => setRisk({ ...risk, autoApproveRefundLimit: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Refunds below this amount are auto-approved
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancelWindow">Cancellation Window (hours)</Label>
                  <Input
                    id="cancelWindow"
                    type="number"
                    value={risk.cancellationWindowHours}
                    onChange={(e) => setRisk({ ...risk, cancellationWindowHours: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Prevention</CardTitle>
              <CardDescription>Security thresholds and verification requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fraudThreshold">Fraud Score Threshold</Label>
                <Input
                  id="fraudThreshold"
                  type="number"
                  value={risk.fraudScoreThreshold}
                  onChange={(e) => setRisk({ ...risk, fraudScoreThreshold: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Transactions above this score require manual review (0-100)
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require ID Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Require identity verification for high-value bookings
                  </p>
                </div>
                <Switch
                  checked={risk.requireIdVerification}
                  onCheckedChange={(checked) => setRisk({ ...risk, requireIdVerification: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Block High-Risk Countries</p>
                  <p className="text-sm text-muted-foreground">
                    Block bookings from sanctioned regions
                  </p>
                </div>
                <Switch
                  checked={risk.blockHighRiskCountries}
                  onCheckedChange={(checked) => setRisk({ ...risk, blockHighRiskCountries: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>App name and visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={branding.appName}
                  onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg border flex items-center justify-center bg-muted">
                    <span className="text-xl font-bold">Z</span>
                  </div>
                  <Button variant="outline">Upload New Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Support contact details shown to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={branding.supportEmail}
                    onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={branding.supportPhone}
                    onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={branding.copyrightText}
                  onChange={(e) => setBranding({ ...branding, copyrightText: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signup Allowlist</CardTitle>
              <CardDescription>
                Manage which emails are permitted to create accounts (invite-only system)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Invite Management</p>
                  <p className="text-sm text-muted-foreground">
                    Add, view, and manage invited emails
                  </p>
                </div>
                <Button asChild>
                  <Link to="/admin/settings/invites">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Invites
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Admin role assignments and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Role Management</p>
                  <p className="text-sm text-muted-foreground">
                    Assign admin, operations, finance, and support roles
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/admin/users">View Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsHub;

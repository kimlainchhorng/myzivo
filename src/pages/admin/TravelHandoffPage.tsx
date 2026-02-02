import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Info, ArrowRightLeft, MessageSquare, Clock, CheckSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHandoffSettings, useUpdateHandoffSettings, CheckoutMode } from "@/hooks/useTravelAdminData";

const TravelHandoffPage = () => {
  const { data: settings, isLoading } = useHandoffSettings();
  const updateSettings = useUpdateHandoffSettings();

  const [formData, setFormData] = useState<{
    default_checkout_mode: CheckoutMode;
    show_disclosure_modal: boolean;
    require_consent_checkbox: boolean;
    booking_timeout_seconds: number;
  } | null>(null);

  // Initialize form data when settings load
  const currentData = formData || settings;

  const handleSave = async () => {
    if (!formData) return;
    await updateSettings.mutateAsync(formData);
  };

  const hasChanges = formData && settings && (
    formData.default_checkout_mode !== settings.default_checkout_mode ||
    formData.show_disclosure_modal !== settings.show_disclosure_modal ||
    formData.require_consent_checkbox !== settings.require_consent_checkbox ||
    formData.booking_timeout_seconds !== settings.booking_timeout_seconds
  );

  const updateField = <K extends keyof NonNullable<typeof formData>>(
    field: K, 
    value: NonNullable<typeof formData>[K]
  ) => {
    setFormData(prev => ({
      default_checkout_mode: prev?.default_checkout_mode ?? settings?.default_checkout_mode ?? 'redirect',
      show_disclosure_modal: prev?.show_disclosure_modal ?? settings?.show_disclosure_modal ?? true,
      require_consent_checkbox: prev?.require_consent_checkbox ?? settings?.require_consent_checkbox ?? true,
      booking_timeout_seconds: prev?.booking_timeout_seconds ?? settings?.booking_timeout_seconds ?? 1800,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/travel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Handoff Settings</h1>
            <p className="text-muted-foreground">
              Configure checkout behavior and compliance settings
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || updateSettings.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Checkout Mode */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Default Checkout Mode</CardTitle>
                  <CardDescription>
                    How users are sent to partner checkout
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={currentData?.default_checkout_mode ?? 'redirect'}
                  onValueChange={(value: CheckoutMode) => 
                    updateField('default_checkout_mode', value)
                  }
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redirect">
                      <div className="flex flex-col items-start">
                        <span>Redirect</span>
                        <span className="text-xs text-muted-foreground">
                          Open partner checkout in new tab
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="iframe">
                      <div className="flex flex-col items-start">
                        <span>Embedded (iframe)</span>
                        <span className="text-xs text-muted-foreground">
                          Partner checkout within ZIVO
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {currentData?.default_checkout_mode === 'redirect' 
                    ? 'Users will be redirected to the partner website in a new browser tab.'
                    : 'Partner checkout will be embedded within ZIVO (requires partner support).'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclosure Modal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Disclosure Modal</CardTitle>
                  <CardDescription>
                    Show affiliate disclosure before checkout
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="disclosure">Show Disclosure Modal</Label>
                  <p className="text-sm text-muted-foreground">
                    Display a brief modal explaining that checkout happens with our travel partner
                  </p>
                </div>
                <Switch
                  id="disclosure"
                  checked={currentData?.show_disclosure_modal ?? true}
                  onCheckedChange={(checked) => updateField('show_disclosure_modal', checked)}
                />
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground italic">
                  "You will be redirected to our partner to complete your booking. 
                  ZIVO does not process payments or issue tickets."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Consent Checkbox */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle>Consent Checkbox</CardTitle>
                  <CardDescription>
                    Require explicit user consent before handoff
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="consent">Require Consent Checkbox</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must check a box confirming they understand the redirect
                  </p>
                </div>
                <Switch
                  id="consent"
                  checked={currentData?.require_consent_checkbox ?? true}
                  onCheckedChange={(checked) => updateField('require_consent_checkbox', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Timeout */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Clock className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <CardTitle>Booking Timeout</CardTitle>
                  <CardDescription>
                    How long to wait for booking confirmation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={currentData?.booking_timeout_seconds ?? 1800}
                      onChange={(e) => 
                        updateField('booking_timeout_seconds', parseInt(e.target.value) || 1800)
                      }
                      min={300}
                      max={7200}
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground mt-6" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bookings not confirmed within this time are marked as timeout</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently set to{' '}
                  <span className="font-medium">
                    {Math.floor((currentData?.booking_timeout_seconds ?? 1800) / 60)} minutes
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Compliance Note:</strong> These settings help ensure ZIVO 
                    remains compliant with affiliate disclosure requirements and consumer protection regulations.
                  </p>
                  <p>
                    The disclosure modal and consent checkbox work together to clearly 
                    communicate that ZIVO does not process payments or issue tickets directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TravelHandoffPage;

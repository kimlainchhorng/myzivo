/**
 * Admin Mobile Settings Page
 * Configure PWA install banner, checkout behavior, and mobile UI options
 */
import { useState } from "react";
import { 
  Smartphone, Download, ExternalLink, ArrowUpDown, 
  Save, RotateCcw, CheckCircle, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface MobileSettings {
  pwaInstallBannerEnabled: boolean;
  checkoutOpenBehavior: "same_tab" | "new_tab";
  stickyCtaEnabled: boolean;
  mobileFiltersEnabled: boolean;
  skeletonLoadersEnabled: boolean;
}

const defaultSettings: MobileSettings = {
  pwaInstallBannerEnabled: true,
  checkoutOpenBehavior: "same_tab",
  stickyCtaEnabled: true,
  mobileFiltersEnabled: true,
  skeletonLoadersEnabled: true,
};

const AdminMobile = () => {
  const [settings, setSettings] = useState<MobileSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof MobileSettings>(
    key: K,
    value: MobileSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In production, save to Supabase
    localStorage.setItem("hizovo-mobile-settings", JSON.stringify(settings));
    
    setIsSaving(false);
    setHasChanges(false);
    toast.success("Mobile settings saved successfully");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <>
      <SEOHead
        title="Mobile Settings | Admin"
        description="Configure mobile experience settings for Hizovo"
        noIndex
      />
      <Header />
      
      <main className="min-h-screen pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mobile Settings</h1>
                <p className="text-muted-foreground text-sm">
                  Configure PWA and mobile experience options
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* PWA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  PWA Install Banner
                </CardTitle>
                <CardDescription>
                  Control the "Install Hizovo" banner on mobile browsers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pwa-banner">Enable Install Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show banner prompting users to install the app
                    </p>
                  </div>
                  <Switch
                    id="pwa-banner"
                    checked={settings.pwaInstallBannerEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("pwaInstallBannerEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkout Behavior */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Checkout Link Behavior
                </CardTitle>
                <CardDescription>
                  How partner checkout links open on mobile devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.checkoutOpenBehavior}
                  onValueChange={(value) =>
                    updateSetting("checkoutOpenBehavior", value as "same_tab" | "new_tab")
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
                    <RadioGroupItem value="same_tab" id="same_tab" className="mt-1" />
                    <div>
                      <Label htmlFor="same_tab" className="font-medium cursor-pointer">
                        Same Tab (Recommended)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Opens partner checkout in the current tab. Better for mobile UX 
                        and preserves back-button navigation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
                    <RadioGroupItem value="new_tab" id="new_tab" className="mt-1" />
                    <div>
                      <Label htmlFor="new_tab" className="font-medium cursor-pointer">
                        New Tab
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Opens partner checkout in a new browser tab. Users can return 
                        to Hizovo easily but may cause popup blocker issues.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* UI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Mobile UI Options
                </CardTitle>
                <CardDescription>
                  Configure mobile-specific UI elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sticky-cta">Sticky CTA Bars</Label>
                    <p className="text-sm text-muted-foreground">
                      Show fixed action buttons at bottom of results/details pages
                    </p>
                  </div>
                  <Switch
                    id="sticky-cta"
                    checked={settings.stickyCtaEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("stickyCtaEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mobile-filters">Mobile Filter/Sort Footer</Label>
                    <p className="text-sm text-muted-foreground">
                      Show filter and sort buttons in sticky footer on results pages
                    </p>
                  </div>
                  <Switch
                    id="mobile-filters"
                    checked={settings.mobileFiltersEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("mobileFiltersEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="skeleton-loaders">Skeleton Loaders</Label>
                    <p className="text-sm text-muted-foreground">
                      Show placeholder skeletons while content loads
                    </p>
                  </div>
                  <Switch
                    id="skeleton-loaders"
                    checked={settings.skeletonLoadersEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("skeletonLoadersEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : hasChanges ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </>
                )}
              </Button>
            </div>

            {/* Mobile Preview Note */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Testing Mobile Experience</p>
                    <p className="text-sm text-muted-foreground">
                      Use the device preview icons above the preview window to test 
                      mobile layouts. Changes to these settings apply immediately to 
                      all users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminMobile;

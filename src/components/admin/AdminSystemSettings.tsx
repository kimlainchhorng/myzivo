import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, DollarSign, Bell, Palette, Shield, Save, RefreshCw, AlertTriangle, Zap, Globe, Mail, Smartphone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  is_public: boolean;
}

const categoryIcons: Record<string, any> = {
  general: Globe,
  finance: DollarSign,
  branding: Palette,
  system: Settings,
  contact: Mail,
  promotions: Zap,
  notifications: Bell,
};

const AdminSystemSettings = () => {
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data as SystemSetting[];
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: JSON.stringify(value) })
        .eq("key", key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
      toast.success("Setting updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update setting");
    },
  });

  const handleSaveAll = async () => {
    for (const [key, value] of Object.entries(editedSettings)) {
      await updateSettingMutation.mutateAsync({ key, value });
    }
    setEditedSettings({});
  };

  const getSettingValue = (setting: SystemSetting) => {
    if (editedSettings[setting.key] !== undefined) {
      return editedSettings[setting.key];
    }
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      return setting.value;
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const groupedSettings = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>) || {};

  const categories = Object.keys(groupedSettings);

  const renderSettingInput = (setting: SystemSetting) => {
    const value = getSettingValue(setting);
    const key = setting.key;

    // Boolean settings
    if (typeof value === "boolean" || value === "true" || value === "false") {
      const boolValue = value === true || value === "true";
      return (
        <Switch
          checked={boolValue}
          onCheckedChange={(checked) => handleSettingChange(key, checked)}
        />
      );
    }

    // Number settings
    if (typeof value === "number" || (!isNaN(Number(value)) && value !== "")) {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(key, Number(e.target.value))}
          className="max-w-32 bg-background/50"
        />
      );
    }

    // String settings
    return (
      <Input
        value={String(value).replace(/^"|"$/g, '')}
        onChange={(e) => handleSettingChange(key, e.target.value)}
        className="max-w-xs bg-background/50"
      />
    );
  };

  const hasUnsavedChanges = Object.keys(editedSettings).length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-500/20 to-zinc-500/10">
            <Settings className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure platform-wide settings</p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveAll} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Warning Banner */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-500">You have unsaved changes</p>
        </div>
      )}

      {/* Settings Tabs */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue={categories[0] || "general"} className="space-y-4">
          <TabsList className="bg-card/50 flex-wrap h-auto gap-1 p-1">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Settings;
              return (
                <TabsTrigger key={category} value={category} className="gap-2 capitalize">
                  <Icon className="h-4 w-4" />
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <Card className="border-0 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {(() => {
                      const Icon = categoryIcons[category] || Settings;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    {category} Settings
                  </CardTitle>
                  <CardDescription>
                    Manage {category} configuration options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {groupedSettings[category].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium capitalize">
                          {setting.key.replace(/_/g, " ")}
                        </p>
                        {setting.description && (
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {renderSettingInput(setting)}
                        {editedSettings[setting.key] !== undefined && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newEdits = { ...editedSettings };
                              delete newEdits[setting.key];
                              setEditedSettings(newEdits);
                            }}
                            className="h-8 w-8"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Quick Actions */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <RefreshCw className="h-5 w-5" />
              <span>Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Bell className="h-5 w-5" />
              <span>Test Notifications</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Mail className="h-5 w-5" />
              <span>Test Email</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 text-amber-500 hover:text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
              <AlertTriangle className="h-5 w-5" />
              <span>Maintenance Mode</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemSettings;

import { Mail, Bell, Megaphone, Newspaper, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEmailPreferences, useUpdateEmailPreferences } from "@/hooks/useEmailPreferences";

const PREFERENCE_ITEMS = [
  {
    key: "booking_updates" as const,
    icon: Bell,
    title: "Booking Updates",
    description: "Confirmations, changes, and reminders",
    required: true,
  },
  {
    key: "price_alerts" as const,
    icon: Bell,
    title: "Price Alerts",
    description: "Get notified when tracked prices drop",
  },
  {
    key: "marketing_emails" as const,
    icon: Megaphone,
    title: "Deals & Promotions",
    description: "Exclusive offers and discounts",
  },
  {
    key: "newsletter" as const,
    icon: Newspaper,
    title: "Newsletter",
    description: "Travel tips and destination guides",
  },
];

export default function EmailPreferences() {
  const { data: preferences, isLoading } = useEmailPreferences();
  const updatePreferences = useUpdateEmailPreferences();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    if (preferences) {
      updatePreferences.mutate({ [key]: value });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Control which emails you receive from ZIVO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PREFERENCE_ITEMS.map((item) => {
          const value = preferences?.[item.key] ?? true;
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="font-semibold cursor-pointer">{item.title}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
                disabled={item.required || updatePreferences.isPending}
                aria-label={item.title}
              />
            </div>
          );
        })}

        <p className="text-xs text-muted-foreground pt-2">
          Booking updates cannot be disabled as they contain essential information about your reservations.
        </p>
      </CardContent>
    </Card>
  );
}

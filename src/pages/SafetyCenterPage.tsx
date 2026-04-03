import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Shield, Eye, EyeOff, Clock, AlertTriangle, Lock, UserX,
  MessageSquareOff, Ban, Filter, Baby, ShieldCheck, Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SafetyToggle {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: string;
}

export default function SafetyCenterPage() {
  const navigate = useNavigate();
  const [screenTimeLimit, setScreenTimeLimit] = useState("none");
  const [contentFilter, setContentFilter] = useState("standard");
  const [pin, setPin] = useState("");

  const [toggles, setToggles] = useState<SafetyToggle[]>([
    { id: "restricted", label: "Restricted Mode", description: "Hide potentially sensitive content", icon: Eye, enabled: false, category: "content" },
    { id: "sensitive", label: "Sensitive Content Filter", description: "Blur images flagged as sensitive", icon: EyeOff, enabled: true, category: "content" },
    { id: "dm_filter", label: "Message Requests Filter", description: "Filter messages from unknown users", icon: MessageSquareOff, enabled: true, category: "privacy" },
    { id: "block_strangers", label: "Block Unknown Contacts", description: "Only friends can message you", icon: UserX, enabled: false, category: "privacy" },
    { id: "hide_activity", label: "Hide Activity Status", description: "Don't show when you're online", icon: Clock, enabled: false, category: "privacy" },
    { id: "parental", label: "Parental Controls", description: "Require PIN for age-restricted content", icon: Baby, enabled: false, category: "parental" },
    { id: "safe_search", label: "Safe Search", description: "Filter explicit content from search", icon: Filter, enabled: true, category: "content" },
    { id: "login_alerts", label: "Login Alerts", description: "Get notified of new device logins", icon: Bell, enabled: true, category: "security" },
  ]);

  const toggleSetting = (id: string) => {
    setToggles(prev => prev.map(t => {
      if (t.id === id) {
        const newState = !t.enabled;
        if (id === "parental" && newState && !pin) {
          toast.error("Set a PIN first to enable parental controls");
          return t;
        }
        return { ...t, enabled: newState };
      }
      return t;
    }));
  };

  const categories = [
    { key: "content", label: "Content Safety", icon: Filter },
    { key: "privacy", label: "Privacy", icon: Lock },
    { key: "parental", label: "Parental Controls", icon: Baby },
    { key: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Safety Center</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Screen Time */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
            <Clock className="h-4 w-4" /> Screen Time
          </h2>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Daily Limit</p>
                <p className="text-xs text-muted-foreground">Set a daily usage reminder</p>
              </div>
              <Select value={screenTimeLimit} onValueChange={setScreenTimeLimit}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {screenTimeLimit !== "none" && (
              <Badge variant="secondary" className="text-xs">
                You'll get a reminder after {screenTimeLimit === "30" ? "30 minutes" : screenTimeLimit === "60" ? "1 hour" : screenTimeLimit === "120" ? "2 hours" : "3 hours"}
              </Badge>
            )}
          </Card>
        </motion.div>

        {/* Content Filter Level */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
            <Filter className="h-4 w-4" /> Content Filter Level
          </h2>
          <Card className="p-4">
            <div className="flex gap-2">
              {[
                { value: "off", label: "Off", desc: "No filtering" },
                { value: "standard", label: "Standard", desc: "Recommended" },
                { value: "strict", label: "Strict", desc: "Maximum safety" },
              ].map((level) => (
                <button key={level.value} onClick={() => setContentFilter(level.value)}
                  className={`flex-1 p-3 rounded-lg text-center border transition-colors ${contentFilter === level.value ? "border-primary bg-primary/10" : "border-border"}`}>
                  <p className="text-sm font-medium text-foreground">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.desc}</p>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Parental PIN */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
            <Lock className="h-4 w-4" /> Parental PIN
          </h2>
          <Card className="p-4">
            <div className="flex gap-2">
              <Input type="password" maxLength={4} placeholder="Set 4-digit PIN" value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-40" />
              <Button size="sm" disabled={pin.length !== 4} onClick={() => toast.success("PIN saved!")}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Required to change safety settings when parental controls are on</p>
          </Card>
        </motion.div>

        {/* Toggle Categories */}
        {categories.map((cat, ci) => (
          <motion.div key={cat.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + ci * 0.05 }}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
              <cat.icon className="h-4 w-4" /> {cat.label}
            </h2>
            <Card className="divide-y divide-border">
              {toggles.filter(t => t.category === cat.key).map((toggle) => (
                <div key={toggle.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <toggle.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                      <p className="text-xs text-muted-foreground">{toggle.description}</p>
                    </div>
                  </div>
                  <Switch checked={toggle.enabled} onCheckedChange={() => toggleSetting(toggle.id)} />
                </div>
              ))}
            </Card>
          </motion.div>
        ))}

        {/* Emergency */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="p-4 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-semibold text-foreground">Emergency Resources</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">If you or someone you know needs help:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• Crisis Text Line: Text HOME to 741741</p>
              <p>• National Suicide Prevention: 988</p>
              <p>• Emergency Services: 911</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

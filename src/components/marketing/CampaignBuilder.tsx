/**
 * Campaign Builder
 * Multi-step wizard for creating and editing marketing campaigns
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Megaphone, Users, Gift, Target,
  MessageSquare, Calendar, CheckCircle, Sparkles, Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import TargetingRulesBuilder from "./TargetingRulesBuilder";
import {
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useTargetCount,
  useExecuteCampaign,
  useScheduleCampaign,
} from "@/hooks/useMarketing";
import type { MarketingCampaign, CampaignTargetCriteria } from "@/lib/marketing";

const STEPS = [
  { id: 1, title: "Campaign Type", icon: Megaphone },
  { id: 2, title: "Targeting", icon: Target },
  { id: 3, title: "Message", icon: MessageSquare },
  { id: 4, title: "Schedule", icon: Calendar },
  { id: 5, title: "Review", icon: CheckCircle },
];

const CAMPAIGN_TYPES = [
  {
    value: "promo",
    label: "Promo Campaign",
    description: "Distribute discount codes or credits",
    icon: Gift,
    color: "text-emerald-400",
  },
  {
    value: "push",
    label: "Push Notification",
    description: "Send push notifications to users",
    icon: Bell,
    color: "text-blue-400",
  },
  {
    value: "winback",
    label: "Win-back Campaign",
    description: "Re-engage inactive users",
    icon: Users,
    color: "text-amber-400",
  },
  {
    value: "restaurant_boost",
    label: "Restaurant Boost",
    description: "Promote specific restaurants",
    icon: Sparkles,
    color: "text-purple-400",
  },
];

interface CampaignBuilderProps {
  campaignId?: string;
  onClose: () => void;
}

export default function CampaignBuilder({ campaignId, onClose }: CampaignBuilderProps) {
  const navigate = useNavigate();
  const isEditing = !!campaignId;

  const { data: existingCampaign } = useCampaign(campaignId);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const executeMutation = useExecuteCampaign();
  const scheduleMutation = useScheduleCampaign();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    name: "",
    campaign_type: "push",
    target_audience: "all",
    target_criteria: {},
    notification_title: "",
    notification_body: "",
    push_enabled: true,
    email_enabled: false,
    promo_code_id: null,
    credits_amount: 0,
    start_date: null,
    end_date: null,
  });

  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Load existing campaign data
  useEffect(() => {
    if (existingCampaign) {
      setFormData(existingCampaign);
      if (existingCampaign.start_date) {
        const date = new Date(existingCampaign.start_date);
        setScheduledDate(date.toISOString().split("T")[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
        setScheduleType("scheduled");
      }
    }
  }, [existingCampaign]);

  const { data: targetCount, isLoading: countLoading } = useTargetCount(
    formData.target_criteria || {},
    step >= 2
  );

  const updateForm = (updates: Partial<MarketingCampaign>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async (launch: boolean = false) => {
    try {
      let campaignToUse: MarketingCampaign;

      if (isEditing && campaignId) {
        await updateMutation.mutateAsync({ id: campaignId, updates: formData });
        campaignToUse = { ...existingCampaign, ...formData } as MarketingCampaign;
      } else {
        campaignToUse = await createMutation.mutateAsync(formData);
      }

      if (launch) {
        if (scheduleType === "scheduled" && scheduledDate) {
          const startDate = new Date(`${scheduledDate}T${scheduledTime || "00:00"}`);
          await scheduleMutation.mutateAsync({
            id: campaignToUse.id,
            start_date: startDate.toISOString(),
          });
        } else {
          await executeMutation.mutateAsync(campaignToUse.id);
        }
      }

      navigate(`/admin/marketing/campaigns/${campaignToUse.id}`);
    } catch (error) {
      console.error("Failed to save campaign:", error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.campaign_type;
      case 2:
        return true; // Targeting is optional
      case 3:
        return formData.notification_title && formData.notification_body;
      case 4:
        return scheduleType === "now" || (scheduledDate && scheduledTime);
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {isEditing ? "Edit Campaign" : "New Campaign"}
              </h1>
            </div>
            <Button variant="outline" onClick={() => handleSave(false)}>
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-white/10 bg-zinc-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-zinc-800 text-white/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Campaign Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., Weekend Flash Sale"
                  value={formData.name || ""}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="mt-2 bg-zinc-900 border-white/10"
                />
              </div>

              <div>
                <Label>Campaign Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {CAMPAIGN_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.campaign_type === type.value;
                    
                    return (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-zinc-900/60 border-white/10 hover:bg-zinc-800/80"
                        }`}
                        onClick={() => updateForm({ campaign_type: type.value as MarketingCampaign["campaign_type"] })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center ${type.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{type.label}</h3>
                              <p className="text-sm text-white/60">{type.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Targeting */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Target Audience</h2>
                  <p className="text-sm text-white/60">Define who should receive this campaign</p>
                </div>
                {!countLoading && targetCount !== undefined && (
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <Users className="h-4 w-4 mr-2" />
                    {targetCount.toLocaleString()} users
                  </Badge>
                )}
              </div>

              <TargetingRulesBuilder
                value={formData.target_criteria || {}}
                onChange={(criteria) => updateForm({ target_criteria: criteria })}
                campaignType={formData.campaign_type}
              />
            </div>
          )}

          {/* Step 3: Message */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Notification Content</h2>
                <p className="text-sm text-white/60">
                  Use {"{first_name}"} and {"{promo_code}"} for personalization
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Notification Title</Label>
                  <Input
                    placeholder="e.g., 🎉 Special offer just for you!"
                    value={formData.notification_title || ""}
                    onChange={(e) => updateForm({ notification_title: e.target.value })}
                    className="mt-2 bg-zinc-900 border-white/10"
                  />
                </div>

                <div>
                  <Label>Notification Body</Label>
                  <Textarea
                    placeholder="e.g., Hi {first_name}, enjoy 20% off your next order with code {promo_code}"
                    value={formData.notification_body || ""}
                    onChange={(e) => updateForm({ notification_body: e.target.value })}
                    className="mt-2 bg-zinc-900 border-white/10 min-h-[100px]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/60 border border-white/10">
                  <div>
                    <Label>Push Notification</Label>
                    <p className="text-sm text-white/60">Send as push notification</p>
                  </div>
                  <Switch
                    checked={formData.push_enabled}
                    onCheckedChange={(checked) => updateForm({ push_enabled: checked })}
                  />
                </div>

                {/* Preview */}
                <Card className="bg-zinc-800/50 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white/60">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-zinc-900 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {formData.notification_title || "Notification Title"}
                          </p>
                          <p className="text-sm text-white/70 mt-1">
                            {(formData.notification_body || "Notification body text...")
                              .replace("{first_name}", "John")
                              .replace("{promo_code}", "SAVE20")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Schedule</h2>
                <p className="text-sm text-white/60">When should this campaign run?</p>
              </div>

              <RadioGroup
                value={scheduleType}
                onValueChange={(value) => setScheduleType(value as "now" | "scheduled")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-zinc-900/60 border border-white/10">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="flex-1 cursor-pointer">
                    <span className="font-medium">Send Immediately</span>
                    <p className="text-sm text-white/60">Campaign will start as soon as you launch</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-zinc-900/60 border border-white/10">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                    <span className="font-medium">Schedule for Later</span>
                    <p className="text-sm text-white/60">Set a specific date and time</p>
                  </Label>
                </div>
              </RadioGroup>

              {scheduleType === "scheduled" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-2 bg-zinc-900 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2 bg-zinc-900 border-white/10"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Review Campaign</h2>
                <p className="text-sm text-white/60">Make sure everything looks good</p>
              </div>

              <Card className="bg-zinc-900/80 border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/60">Campaign Name</Label>
                      <p className="text-white font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-white/60">Type</Label>
                      <p className="text-white font-medium capitalize">
                        {formData.campaign_type?.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/60">Target Audience</Label>
                    <p className="text-white">
                      {targetCount?.toLocaleString() || "All"} users
                    </p>
                  </div>

                  <div>
                    <Label className="text-white/60">Notification</Label>
                    <p className="text-white font-medium">{formData.notification_title}</p>
                    <p className="text-white/70 text-sm">{formData.notification_body}</p>
                  </div>

                  <div>
                    <Label className="text-white/60">Schedule</Label>
                    <p className="text-white">
                      {scheduleType === "now"
                        ? "Send immediately after launch"
                        : `Scheduled for ${scheduledDate} at ${scheduledTime}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < STEPS.length ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(true)}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {scheduleType === "now" ? "Launch Campaign" : "Schedule Campaign"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

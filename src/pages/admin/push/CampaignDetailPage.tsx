/**
 * Campaign Detail Page
 * Create, edit, and view push notification campaigns
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Send,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  TestTube2,
} from "lucide-react";
import {
  usePushCampaign,
  useSegments,
  useCreatePushCampaign,
  useUpdatePushCampaign,
  useSendPushCampaign,
  useSchedulePushCampaign,
  useSendTestPush,
  useSegmentPreview,
} from "@/hooks/usePushBroadcast";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPreview } from "@/components/admin/push/NotificationPreview";
import { CampaignStats } from "@/components/admin/push/CampaignStats";
import { format } from "date-fns";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import type { SegmentRules } from "@/lib/pushBroadcast";

function CampaignDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [targetAll, setTargetAll] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("12:00");

  // Confirmations
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);

  // Queries and mutations
  const { data: campaign, isLoading: campaignLoading } = usePushCampaign(id);
  const { data: segments } = useSegments();
  const createMutation = useCreatePushCampaign();
  const updateMutation = useUpdatePushCampaign();
  const sendMutation = useSendPushCampaign();
  const scheduleMutation = useSchedulePushCampaign();
  const testMutation = useSendTestPush();

  // Get selected segment rules for preview
  const selectedSegment = segments?.find((s) => s.id === segmentId);
  const previewRules: SegmentRules = targetAll ? {} : (selectedSegment?.rules_json || {});
  const { data: preview } = useSegmentPreview(previewRules, !!(segmentId || targetAll));

  // Load existing campaign
  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setTitle(campaign.title);
      setBody(campaign.body);
      setUrl(campaign.url || "");
      setSegmentId(campaign.segment_id);
      setTargetAll(campaign.target_type === "all");
      if (campaign.send_at) {
        const date = new Date(campaign.send_at);
        setScheduleDate(date);
        setScheduleTime(format(date, "HH:mm"));
      }
    }
  }, [campaign]);

  const handleSave = async () => {
    const data = {
      name,
      title,
      body,
      url: url || null,
      segment_id: targetAll ? null : segmentId,
      target_type: targetAll ? "all" as const : "segment" as const,
    };

    if (isNew) {
      const created = await createMutation.mutateAsync(data);
      navigate(`/admin/push/campaigns/${created.id}`, { replace: true });
    } else if (id) {
      await updateMutation.mutateAsync({ id, updates: data });
    }
  };

  const handleSendNow = async () => {
    if (!id || isNew) {
      // Save first then send
      const data = {
        name,
        title,
        body,
        url: url || null,
        segment_id: targetAll ? null : segmentId,
        target_type: targetAll ? "all" as const : "segment" as const,
      };
      const created = await createMutation.mutateAsync(data);
      await sendMutation.mutateAsync(created.id);
      navigate(`/admin/push/campaigns/${created.id}`, { replace: true });
    } else {
      await sendMutation.mutateAsync(id);
    }
    setShowSendConfirm(false);
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;

    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const sendAt = new Date(scheduleDate);
    sendAt.setHours(hours, minutes, 0, 0);

    if (isNew) {
      const data = {
        name,
        title,
        body,
        url: url || null,
        segment_id: targetAll ? null : segmentId,
        target_type: targetAll ? "all" as const : "segment" as const,
        status: "scheduled" as const,
        send_at: sendAt.toISOString(),
      };
      const created = await createMutation.mutateAsync(data);
      navigate(`/admin/push/campaigns/${created.id}`, { replace: true });
    } else if (id) {
      await scheduleMutation.mutateAsync({ id, sendAt });
    }
    setShowScheduleConfirm(false);
  };

  const handleTestSend = async () => {
    if (!user?.id) return;
    await testMutation.mutateAsync({
      userId: user.id,
      title: title || "Test Notification",
      body: body || "This is a test push notification",
      url: url || undefined,
    });
  };

  const isViewOnly = campaign && ["sent", "sending"].includes(campaign.status);
  const canEdit = isNew || (campaign && ["draft", "scheduled", "failed"].includes(campaign.status));

  if (campaignLoading && !isNew) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/push/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isNew ? "New Campaign" : campaign?.name || "Campaign"}
          </h1>
          {campaign && (
            <p className="text-muted-foreground capitalize">
              Status: {campaign.status}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTestSend} disabled={testMutation.isPending}>
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube2 className="h-4 w-4 mr-2" />
              )}
              Test Send
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Draft
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekend Flash Sale"
                  disabled={isViewOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                  placeholder="e.g., 🔥 50% Off This Weekend!"
                  maxLength={50}
                  disabled={isViewOnly}
                />
                <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Notification Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 200))}
                  placeholder="e.g., Use code WEEKEND50 for 50% off your next order. Limited time only!"
                  maxLength={200}
                  rows={3}
                  disabled={isViewOnly}
                />
                <p className="text-xs text-muted-foreground">{body.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Action URL (optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., /promotions or /eats"
                  disabled={isViewOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Deep link to open when user taps the notification
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Send to All Users</Label>
                  <p className="text-sm text-muted-foreground">
                    Target all users with push subscriptions
                  </p>
                </div>
                <Switch
                  checked={targetAll}
                  onCheckedChange={setTargetAll}
                  disabled={isViewOnly}
                />
              </div>

              {!targetAll && (
                <div className="space-y-2">
                  <Label>Select Segment</Label>
                  <Select
                    value={segmentId || ""}
                    onValueChange={setSegmentId}
                    disabled={isViewOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments?.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          {segment.name} (~{segment.estimated_count.toLocaleString()} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {segments?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No segments available.{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => navigate("/admin/push/segments")}
                      >
                        Create one
                      </Button>
                    </p>
                  )}
                </div>
              )}

              {(targetAll || segmentId) && preview && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Estimated reach:</span>{" "}
                    ~{preview.count?.toLocaleString() || 0} users
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats for sent campaigns */}
          {campaign && ["sent", "sending"].includes(campaign.status) && (
            <CampaignStats campaign={campaign} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationPreview title={title} body={body} />

          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => setShowSendConfirm(true)}
                  disabled={!title || !body || (!targetAll && !segmentId)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Schedule for Later</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowScheduleConfirm(true)}
                    disabled={!title || !body || (!targetAll && !segmentId) || !scheduleDate}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Send Confirmation */}
      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign Now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately send push notifications to{" "}
              {preview?.count?.toLocaleString() || "all targeted"} users.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNow}>
              {(sendMutation.isPending || createMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Confirmation */}
      <AlertDialog open={showScheduleConfirm} onOpenChange={setShowScheduleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schedule Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign will be sent on{" "}
              {scheduleDate && format(scheduleDate, "PPP")} at {scheduleTime} to{" "}
              {preview?.count?.toLocaleString() || "all targeted"} users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSchedule}>
              {(scheduleMutation.isPending || createMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
      <CampaignDetailPageContent />
    </AdminProtectedRoute>
  );
}

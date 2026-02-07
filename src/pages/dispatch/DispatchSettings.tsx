/**
 * Dispatch Settings Page
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DispatchSettings = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    processed?: number;
    sent?: number;
    failed?: number;
    message?: string;
  } | null>(null);

  const processNotifications = async () => {
    setIsProcessing(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("process-order-notifications", {
        body: { limit: 20 },
      });

      if (error) throw error;

      setLastResult(data);

      if (data.success) {
        if (data.processed === 0) {
          toast.info("No queued notifications", {
            description: "All notifications have been processed.",
          });
        } else {
          toast.success(`Processed ${data.processed} notifications`, {
            description: `Sent: ${data.sent}, Failed: ${data.failed}`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error processing notifications:", error);
      setLastResult({ success: false, message: error.message });
      toast.error("Failed to process notifications", {
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Dispatch configuration and tools</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Processing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Processing
            </CardTitle>
            <CardDescription>
              Process queued SMS and email notifications for order updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to manually process any queued notifications.
              This sends SMS (via Twilio) and email (via Resend) to customers
              about their order status updates.
            </p>

            <Button
              onClick={processNotifications}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Process Queued Notifications
                </>
              )}
            </Button>

            {lastResult && (
              <div
                className={`p-4 rounded-lg ${
                  lastResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium">
                    {lastResult.success ? "Success" : "Error"}
                  </span>
                </div>
                {lastResult.success ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Processed: {lastResult.processed || 0}
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500">
                      Sent: {lastResult.sent || 0}
                    </Badge>
                    {(lastResult.failed || 0) > 0 && (
                      <Badge variant="destructive">
                        Failed: {lastResult.failed}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {lastResult.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Required environment variables for notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">RESEND_API_KEY</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Configured
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">TWILIO_ACCOUNT_SID</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Optional
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">TWILIO_AUTH_TOKEN</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Optional
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">TWILIO_FROM_NUMBER</span>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Optional
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              SMS notifications require Twilio credentials. If not configured,
              only email notifications will be sent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispatchSettings;

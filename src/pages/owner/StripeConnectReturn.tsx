/**
 * Stripe Connect Return Page
 * Handles redirect from Stripe Connect onboarding
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRefreshStripeConnectStatus } from "@/hooks/useStripeConnect";

export default function StripeConnectReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refreshStatus = useRefreshStripeConnectStatus();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Check account status on return
    refreshStatus.mutate(undefined, {
      onSettled: () => {
        setCheckComplete(true);
      },
    });
  }, []);

  const status = refreshStatus.data;
  const isSuccess = status?.payouts_enabled && status?.charges_enabled;
  const isPending = status?.connected && !status?.payouts_enabled;
  const isLoading = refreshStatus.isPending || !checkComplete;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Stripe Connect Setup | ZIVO"
        description="Complete your Stripe Connect setup"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="text-center">
            <CardHeader>
              {isLoading ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                  <CardTitle>Checking Account Status...</CardTitle>
                  <CardDescription>
                    Please wait while we verify your Stripe account
                  </CardDescription>
                </>
              ) : isSuccess ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle>Account Connected!</CardTitle>
                  <CardDescription>
                    Your Stripe account is ready to receive payouts
                  </CardDescription>
                </>
              ) : isPending ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <CardTitle>Setup Incomplete</CardTitle>
                  <CardDescription>
                    Your account is connected but requires additional information
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <CardTitle>Setup Failed</CardTitle>
                  <CardDescription>
                    We couldn't connect your Stripe account
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {isSuccess && (
                <div className="p-4 rounded-lg bg-green-500/5 text-left">
                  <h4 className="font-medium text-green-600 mb-2">What's next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Your earnings will be deposited directly</li>
                    <li>✓ Payouts are processed within 2-3 business days</li>
                    <li>✓ View your earnings in the Payouts dashboard</li>
                  </ul>
                </div>
              )}

              {isPending && status?.requirements && status.requirements.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/5 text-left">
                  <h4 className="font-medium text-amber-600 mb-2">
                    Required Information
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {status.requirements.slice(0, 5).map((req, i) => (
                      <li key={i}>• {req.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/owner/payouts")} className="w-full">
                  Go to Payouts Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                {isPending && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/owner/payouts")}
                  >
                    Complete Setup Later
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

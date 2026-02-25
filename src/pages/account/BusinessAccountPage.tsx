/**
 * Business Account Settings Page
 * Join company with invite code or manage existing membership
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Building2, CreditCard, Users, LogOut, 
  Loader2, CheckCircle, AlertCircle, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessMembership, useUpdatePaymentPreference, useLeaveCompany } from "@/hooks/useBusinessMembership";
import { useValidateCompanyCode, useRedeemCompanyCode } from "@/hooks/useCompanyInviteCode";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BusinessAccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: membership, isLoading } = useBusinessMembership();
  const updatePreference = useUpdatePaymentPreference();
  const leaveCompany = useLeaveCompany();
  const { validate, isValidating } = useValidateCompanyCode();
  const redeemCode = useRedeemCompanyCode();

  const [inviteCode, setInviteCode] = useState("");
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; companyName?: string; error?: string } | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Handle code validation on blur or button click
  const handleValidateCode = async () => {
    if (!inviteCode.trim()) return;
    const result = await validate(inviteCode);
    setValidationResult(result);
  };

  // Handle joining company
  const handleJoinCompany = async () => {
    if (!validationResult?.isValid) return;
    
    const result = await redeemCode.mutateAsync(inviteCode);
    
    if (result.success) {
      toast.success(`Welcome to ${result.companyName}!`);
      setInviteCode("");
      setValidationResult(null);
    } else {
      toast.error(result.error || "Failed to join company");
    }
  };

  // Handle payment preference change
  const handlePreferenceChange = async (value: "personal" | "company") => {
    try {
      await updatePreference.mutateAsync(value);
      toast.success(`Payment preference updated to ${value === "company" ? "Company billing" : "Personal payment"}`);
    } catch (error) {
      toast.error("Failed to update preference");
    }
  };

  // Handle leaving company
  const handleLeaveCompany = async () => {
    try {
      await leaveCompany.mutateAsync();
      toast.success("You have left the company");
      setShowLeaveDialog(false);
    } catch (error) {
      toast.error("Failed to leave company");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Business Account</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {membership?.isMember ? (
          // MEMBER STATE: Show company info and preferences
          <>
            {/* Company Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{membership.company?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="capitalize">{membership.role}</span>
                      {membership.joinedAt && (
                        <>
                          <span>•</span>
                          <span>Joined {format(new Date(membership.joinedAt), "MMM yyyy")}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {membership.role}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Payment Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose how you want to pay for orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={membership.paymentPreference}
                  onValueChange={(value) => handlePreferenceChange(value as "personal" | "company")}
                  className="space-y-3"
                  disabled={updatePreference.isPending}
                >
                  <div className="flex items-center space-x-3 p-4 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="flex-1 cursor-pointer">
                      <span className="font-medium">Personal</span>
                      <p className="text-sm text-muted-foreground">Use my own payment method</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="flex-1 cursor-pointer">
                      <span className="font-medium">Company</span>
                      <p className="text-sm text-muted-foreground">
                        Billed to {membership.company?.name}
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Leave Company */}
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Leave Company</p>
                    <p className="text-sm text-muted-foreground">
                      Remove yourself from {membership.company?.name}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowLeaveDialog(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // NON-MEMBER STATE: Join or create company
          <>
            {/* Join Company Card */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Join a Company</CardTitle>
                <CardDescription>
                  Enter your company's invite code to join their business account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="invite-code"
                      placeholder="ACME2024"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value.toUpperCase());
                        setValidationResult(null);
                      }}
                      onBlur={handleValidateCode}
                      className="uppercase tracking-wider font-mono"
                      maxLength={12}
                    />
                    <Button
                      onClick={handleValidateCode}
                      variant="outline"
                      disabled={!inviteCode.trim() || isValidating}
                    >
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Check"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-3 rounded-xl flex items-start gap-3 ${
                    validationResult.isValid 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Valid code!</p>
                          <p className="text-sm opacity-80">
                            You'll join <strong>{validationResult.companyName}</strong>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Invalid code</p>
                          <p className="text-sm opacity-80">{validationResult.error}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleJoinCompany}
                  disabled={!validationResult?.isValid || redeemCode.isPending}
                  className="w-full"
                >
                  {redeemCode.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Join Company
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Create Business Account Card */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-2">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle>Create a Business Account</CardTitle>
                <CardDescription>
                  Set up company billing for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/business")}
                >
                  Get Started
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Leave Company Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {membership?.company?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be able to bill orders to this company. 
              You can rejoin later with a new invite code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {leaveCompany.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Leave Company"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

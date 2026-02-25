import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileImage,
  Camera,
  Loader2,
  X,
  BadgeCheck,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCustomerVerification, type VerificationStatus } from "@/hooks/useCustomerVerification";

function StatusBanner({ status, rejectionReason }: { status: VerificationStatus; rejectionReason?: string | null }) {
  const config: Record<VerificationStatus, { icon: typeof Shield; title: string; desc: string; bg: string; iconClass: string }> = {
    not_started: {
      icon: Shield,
      title: "Optional Verification",
      desc: "Verify your identity for enhanced trust and access to higher-value features.",
      bg: "bg-primary/5 border-primary/20",
      iconClass: "text-primary",
    },
    pending: {
      icon: Clock,
      title: "Verification Pending",
      desc: "Your documents are being reviewed. This usually takes 1–2 business days.",
      bg: "bg-amber-500/10 border-amber-500/30",
      iconClass: "text-amber-500",
    },
    verified: {
      icon: CheckCircle,
      title: "Identity Verified",
      desc: "Your identity has been verified. You have access to all features.",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      iconClass: "text-emerald-500",
    },
    rejected: {
      icon: XCircle,
      title: "Verification Rejected",
      desc: rejectionReason || "Your verification was not approved. You may resubmit with new documents.",
      bg: "bg-destructive/10 border-destructive/30",
      iconClass: "text-destructive",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", c.bg)}>
      <div className={cn("p-2 rounded-full bg-background/60", c.iconClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{c.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{c.desc}</p>
      </div>
    </div>
  );
}

function DocumentUploadCard({
  label,
  description,
  icon: Icon,
  storedPath,
  onFileSelect,
  isUploading,
  disabled,
  getSignedUrl,
}: {
  label: string;
  description: string;
  icon: typeof FileImage;
  storedPath: string | null;
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  disabled: boolean;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (storedPath && !preview) {
      setLoadingPreview(true);
      getSignedUrl(storedPath).then((url) => {
        setPreview(url);
        setLoadingPreview(false);
      });
    }
  }, [storedPath]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const isUploaded = !!preview || !!storedPath;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
          isUploaded ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-primary/50",
          (isUploading || disabled) && "opacity-50 pointer-events-none"
        )}
      >
        {!disabled && (
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading || disabled}
          />
        )}

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : loadingPreview ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-32 object-cover rounded-xl" />
            {isUploaded && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Uploaded
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const {
    verification,
    status,
    isLoading,
    uploadDocument,
    isUploading,
    submitVerification,
    isSubmitting,
    getSignedUrl,
  } = useCustomerVerification();

  const canUpload = status === "not_started" || status === "rejected";
  const canSubmit =
    canUpload &&
    verification?.id_document_url &&
    verification?.selfie_url &&
    !isUploading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Identity Verification</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-6 mt-4">
        {/* Status Banner */}
        <StatusBanner status={status} rejectionReason={verification?.rejection_reason} />

        {/* Why Verify */}
        {status !== "verified" && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" />
                Why verify?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Trust badge on your profile
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Access to higher-value bookings
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Enhanced account security
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Upload Cards — hidden when verified or pending */}
        {(canUpload || status === "pending") && (
          <>
            <DocumentUploadCard
              label="Government ID"
              description="Upload a clear photo of your passport, driver's license, or national ID card."
              icon={FileImage}
              storedPath={verification?.id_document_url ?? null}
              onFileSelect={(file) => uploadDocument("id", file)}
              isUploading={isUploading}
              disabled={status === "pending"}
              getSignedUrl={getSignedUrl}
            />

            <DocumentUploadCard
              label="Selfie Verification"
              description="Take a clear selfie holding your ID next to your face."
              icon={Camera}
              storedPath={verification?.selfie_url ?? null}
              onFileSelect={(file) => uploadDocument("selfie", file)}
              isUploading={isUploading}
              disabled={status === "pending"}
              getSignedUrl={getSignedUrl}
            />
          </>
        )}

        {/* Submit Button */}
        {canUpload && (
          <Button
            className="w-full h-12"
            disabled={!canSubmit || isSubmitting}
            onClick={() => submitVerification()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : status === "rejected" ? (
              "Resubmit for Review"
            ) : (
              "Submit for Review"
            )}
          </Button>
        )}

        {/* Verified state */}
        {status === "verified" && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-lg">You're Verified</h3>
              <p className="text-sm text-muted-foreground">
                Your identity has been verified. All features are unlocked.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

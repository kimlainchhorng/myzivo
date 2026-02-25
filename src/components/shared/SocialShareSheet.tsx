/**
 * SocialShareSheet — Reusable bottom-sheet social sharing component
 * Supports Copy Link, WhatsApp, SMS, Facebook, and native share
 * Includes optional referral CTA
 */

import { ReactNode, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  MessageCircle,
  Facebook,
  Share2,
  Gift,
  Check,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useShareTracking } from "@/hooks/useShareTracking";
import { useReferrals } from "@/hooks/useReferrals";
import { useAuth } from "@/contexts/AuthContext";

interface SocialShareSheetProps {
  title: string;
  text: string;
  url: string;
  entityId: string;
  entityType: string;
  trigger?: ReactNode;
}

export function SocialShareSheet({
  title,
  text,
  url,
  entityId,
  entityType,
  trigger,
}: SocialShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { logShare, buildShareUrl } = useShareTracking();
  const { user } = useAuth();
  const { referralCode, copyReferralLink } = useReferrals();

  const handleShare = async (platform: string) => {
    const shareUrl = buildShareUrl(url, entityId, platform);
    const shareText = `${text} ${shareUrl}`;

    await logShare({ entityId, entityType, platform });

    switch (platform) {
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success("Link copied!");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Failed to copy link");
        }
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "sms":
        window.open(`sms:?body=${encodeURIComponent(shareText)}`);
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url: shareUrl });
          } catch {
            // User cancelled
          }
        }
        break;
    }
  };

  const shareOptions = [
    {
      id: "copy",
      label: "Copy Link",
      icon: copied ? Check : Copy,
      className: copied
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        : "bg-muted hover:bg-muted/80",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      className: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20",
    },
    {
      id: "sms",
      label: "SMS",
      icon: Smartphone,
      className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      className: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20",
    },
  ];

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl active:scale-95 transition-all duration-200 touch-manipulation">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-5">
          {/* Share Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                onClick={() => handleShare(option.id)}
                className={`h-14 flex-col gap-1 border rounded-2xl touch-manipulation active:scale-[0.95] transition-all duration-200 hover:shadow-md ${option.className}`}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            ))}
          </div>

          {/* Native Share */}
          {hasNativeShare && (
            <Button
              variant="outline"
              onClick={() => handleShare("native")}
              className="w-full h-11 gap-2 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
              More Options
            </Button>
          )}

          {/* Referral CTA */}
          {user && referralCode?.code && (
            <>
              <Separator />
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">
                    Invite friends & earn credits
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share your referral code{" "}
                  <span className="font-mono font-bold text-foreground">
                    {referralCode.code}
                  </span>{" "}
                  and both of you get rewards!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="w-full gap-2 rounded-xl active:scale-[0.97] transition-all duration-200 touch-manipulation border-primary/20 hover:bg-primary/5"
                >
                  <Copy className="w-4 h-4" />
                  Copy Referral Link
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

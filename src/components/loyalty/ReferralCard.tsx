/**
 * REFERRAL CARD
 * 
 * Invite friends and earn ZIVO Points (not cash)
 * Compliant with affiliate rules - no cashback promises
 */

import { useState } from "react";
import { 
  Users, 
  Copy, 
  CheckCircle, 
  Share2,
  Mail,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { REFERRAL_PROGRAM, POINTS_COMPLIANCE } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReferralCardProps {
  className?: string;
  referralCode?: string;
  referralCount?: number;
}

export default function ReferralCard({
  className,
  referralCode = "ZIVO-ABC123",
  referralCount = 0,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://hizivo.com/join?ref=${referralCode}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async (platform: 'email' | 'whatsapp' | 'native') => {
    if (platform === 'email') {
      const subject = encodeURIComponent(REFERRAL_PROGRAM.emailSubject);
      const body = encodeURIComponent(`${REFERRAL_PROGRAM.emailBody}\n\n${referralLink}`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    } else if (platform === 'whatsapp') {
      const text = encodeURIComponent(`${REFERRAL_PROGRAM.shareMessage}\n${referralLink}`);
      window.open(`https://wa.me/?text=${text}`);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ZIVO',
          text: REFERRAL_PROGRAM.shareMessage,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  // Find current tier bonus
  const currentTierBonus = REFERRAL_PROGRAM.tierBonuses.find(
    t => referralCount >= t.count
  );
  const nextTierBonus = REFERRAL_PROGRAM.tierBonuses.find(
    t => referralCount < t.count
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value Prop */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <span className="font-medium">Earn points together!</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>You earn <strong>{REFERRAL_PROGRAM.referrerBookingBonus}</strong> points when they book</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>They get <strong>{REFERRAL_PROGRAM.newUserBonus}</strong> welcome points</span>
            </li>
          </ul>
        </div>

        {/* Referral Link */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Your referral link</p>
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="font-mono text-xs"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleShare('email')}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            onClick={() => handleShare('native')}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* Referral Stats */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
          <div>
            <p className="text-sm text-muted-foreground">Friends referred</p>
            <p className="text-2xl font-bold">{referralCount}</p>
          </div>
          {currentTierBonus && (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              {currentTierBonus.title}
            </Badge>
          )}
        </div>

        {/* Next Tier */}
        {nextTierBonus && (
          <div className="p-3 rounded-lg border border-dashed">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Refer {nextTierBonus.count - referralCount} more to unlock
              </span>
              <Badge variant="outline">
                +{nextTierBonus.bonusPoints.toLocaleString()} pts
              </Badge>
            </div>
          </div>
        )}

        {/* Compliance */}
        <p className="text-[10px] text-muted-foreground text-center">
          {POINTS_COMPLIANCE.referralNote}
        </p>
      </CardContent>
    </Card>
  );
}

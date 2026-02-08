/**
 * Account Referrals Page
 * Shows invite code, how it works, and referral progress
 */
import { ArrowLeft, Copy, Share2, Users, Gift, Check, Clock, Crown, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useReferrals } from "@/hooks/useReferrals";
import { REFERRAL_REWARDS, REFERRAL_TERMS } from "@/config/referralProgram";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ReferralsPage() {
  const navigate = useNavigate();
  const {
    referralCode,
    referrals,
    tiers,
    isLoading,
    copyReferralLink,
    shareReferral,
    getShareUrl,
    getCurrentTier,
    getNextTier,
  } = useReferrals();

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" />
            Signed Up
          </span>
        );
      case "qualified":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
            <Check className="w-3 h-3" />
            First Booking
          </span>
        );
      case "credited":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <Gift className="w-3 h-3" />
            Points Earned
          </span>
        );
      case "expired":
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-500">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead title="Referrals — ZIVO" description="Invite friends and earn rewards" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Invite Friends</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Invite Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/30 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg">Your Invite Code</p>
              <p className="text-sm text-zinc-400">Share with friends</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-16 bg-zinc-800/50 rounded-2xl animate-pulse" />
          ) : (
            <>
              <div className="bg-zinc-900/80 rounded-2xl p-4 mb-4">
                <p className="text-2xl font-mono font-bold text-center tracking-widest">
                  {referralCode?.code || "---"}
                </p>
              </div>

              <p className="text-xs text-zinc-500 mb-4 text-center truncate">
                {getShareUrl()}
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-white/10 bg-zinc-900 hover:bg-zinc-800"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={shareReferral}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5"
        >
          <h2 className="font-bold text-lg mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Share your link</p>
                <p className="text-sm text-zinc-500">Send to friends & family</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">They sign up</p>
                <p className="text-sm text-zinc-500">
                  Get {REFERRAL_REWARDS.newUser.points} ZIVO Points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">They book</p>
                <p className="text-sm text-zinc-500">
                  You earn {REFERRAL_REWARDS.referrer.pointsPerReferral} ZIVO Points
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Tier Progress */}
        {currentTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-amber-500/10 to-zinc-900 border border-amber-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold">Your Tier: {currentTier.tier_name}</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              {referralCode?.total_referrals || 0} referrals completed
            </p>
            {nextTier && (
              <div className="bg-zinc-900/60 rounded-xl p-3">
                <p className="text-xs text-zinc-500">
                  {nextTier.min_referrals - (referralCode?.total_referrals || 0)} more to reach{" "}
                  <span className="text-amber-400 font-medium">{nextTier.tier_name}</span>
                </p>
                <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((referralCode?.total_referrals || 0) / nextTier.min_referrals) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Referral List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bold text-lg mb-4">Your Referrals</h2>
          {!referrals || referrals.length === 0 ? (
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-8 text-center">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No referrals yet</p>
              <p className="text-sm text-zinc-600 mt-1">Share your code to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-zinc-900/80 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-zinc-400">
                      {format(new Date(referral.created_at), "MMM d, yyyy")}
                    </p>
                    {referral.status === "credited" && (
                      <p className="text-xs text-emerald-400 mt-1">
                        +{REFERRAL_REWARDS.referrer.pointsPerReferral} points
                      </p>
                    )}
                  </div>
                  {getStatusBadge(referral.status)}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Terms */}
        <div className="text-xs text-zinc-600 space-y-1">
          {REFERRAL_TERMS.map((term, i) => (
            <p key={i}>• {term}</p>
          ))}
        </div>

        {/* Link to Wallet */}
        <Button
          onClick={() => navigate("/account/wallet")}
          variant="outline"
          className="w-full h-12 rounded-xl border-white/10 bg-zinc-900 hover:bg-zinc-800"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Credit Wallet
        </Button>
      </div>
    </div>
  );
}

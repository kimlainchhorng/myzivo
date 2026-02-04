/**
 * ReferralProgram Page
 * Dedicated landing page for referral program
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Gift, Users, Share2, DollarSign, 
  ArrowRight, Copy, Check, Sparkles,
  Twitter, Mail, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useReferrals } from "@/hooks/useReferrals";
import { REFERRAL_REWARDS, REFERRAL_TERMS } from "@/config/referralProgram";
import { useState } from "react";

const STEPS = [
  {
    icon: Share2,
    title: "Share Your Link",
    description: "Copy your unique referral link and share it with friends, family, or on social media.",
  },
  {
    icon: Users,
    title: "Friends Sign Up",
    description: "When they sign up and complete their first booking, you both get rewarded.",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    description: `Earn ${REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()} ZIVO Points per referral.`,
  },
];

export default function ReferralProgram() {
  const { user } = useAuth();
  const { referralCode, copyReferralLink, getShareUrl } = useReferrals();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = getShareUrl();

  return (
    <>
      <Helmet>
        <title>Referral Program - Invite Friends & Earn Rewards | ZIVO</title>
        <meta 
          name="description" 
          content="Invite friends to ZIVO and earn travel credits and bonus miles. Get $10 for every friend who books, plus unlock tier bonuses!" 
        />
      </Helmet>

      <NavBar />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/10 via-primary/5 to-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Referral Program
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Invite Friends,<br />
                <span className="text-primary">Earn Rewards</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Share ZIVO with friends and earn {REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()} ZIVO Points for every successful referral.
              </p>

              {user ? (
                <div className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-card"
                    />
                    <Button onClick={handleCopy} className="gap-2 shrink-0">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your code: <strong className="text-primary">{referralCode?.code || "..."}</strong>
                  </p>
                </div>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/signup">
                    Join to Get Your Link
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Reward Highlights */}
        <section className="py-12 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <Gift className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-amber-500">{REFERRAL_REWARDS.referrer.pointsPerReferral.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">ZIVO Points per referral</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                <Users className="w-10 h-10 text-violet-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-violet-500">{REFERRAL_REWARDS.newUser.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Your friend gets too</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
              <p className="text-muted-foreground">Three simple steps to start earning</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {STEPS.map((step, index) => (
                <div key={step.title} className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tier Bonuses */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Tier Bonuses</h2>
              <p className="text-muted-foreground">Refer more friends, unlock bigger rewards</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {REFERRAL_REWARDS.referrer.tierBonuses.map((tier) => (
                <div key={tier.title} className="p-6 rounded-2xl bg-card border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-4 flex items-center justify-center text-white font-bold">
                    {tier.count}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{tier.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    +{tier.bonus.toLocaleString()} miles
                  </p>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Share Options */}
        {user && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6">Share Your Link</h2>
                
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on ZIVO and get $10 off your first trip! ${shareUrl}`)}`)}
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => window.open(`mailto:?subject=Join ZIVO&body=${encodeURIComponent(`Hey! Check out ZIVO for amazing travel deals: ${shareUrl}`)}`)}
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ZIVO for amazing travel deals! ${shareUrl}`)}`)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Terms */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h3 className="font-semibold mb-4">Program Terms</h3>
              <ul className="space-y-2">
                {REFERRAL_TERMS.map((term, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6">
                Create your account and get your unique referral link
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

/**
 * ProgramDetailPage — Individual monetization program overview & enrollment
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight, Crown, DollarSign, Gift,
  Heart, Lock, Megaphone, Mic, Music, Palette, Radio,
  Store, Target, Video, Zap, Camera, Calendar, MessageCircle,
  BookOpen, PenTool, Star, TrendingUp, Users, Shield,
  Sparkles, CheckCircle, ArrowRight, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

const PROGRAM_DATA: Record<string, {
  icon: any; label: string; description: string; accent: string;
  longDescription: string; requirements: string[]; benefits: string[];
  howItWorks: string[]; faq: { q: string; a: string }[];
}> = {
  "creator-rewards": {
    icon: Gift, label: "Creator Rewards", accent: "hsl(340 75% 55%)",
    description: "Get Gifts for your top-performing videos and content.",
    longDescription: "The Creator Rewards Program pays you based on the quality and engagement of your content. Earn from views, likes, comments, and shares across all your videos. Top performers get bonus multipliers and exclusive perks.",
    requirements: ["1,000+ followers", "10,000+ video views in the last 30 days", "Account in good standing", "18+ years old", "Complete identity verification"],
    benefits: ["Earn from every qualifying video", "Bonus multipliers for viral content", "Monthly payouts to your wallet", "Priority support access", "Exclusive creator events"],
    howItWorks: ["Create original, engaging content", "Your videos are scored based on views, engagement, and watch time", "Earnings accumulate in your Creator Wallet", "Cash out monthly when balance exceeds $50"],
    faq: [
      { q: "How much can I earn?", a: "Earnings vary based on engagement. Top creators earn $500-$5,000/month. Average RPM is $1.50-$8.00." },
      { q: "When do I get paid?", a: "Payouts are processed monthly. Minimum withdrawal is $50." },
      { q: "Can I lose my eligibility?", a: "Yes, if you violate Community Guidelines or fall below minimum thresholds for 60 days." },
    ],
  },
  "service-plus": {
    icon: Zap, label: "Service+", accent: "hsl(221 83% 53%)",
    description: "Build connections with potential clients when you're LIVE.",
    longDescription: "Service+ connects creators with potential clients and customers during LIVE streams. Offer consultations, coaching, tutorials, and professional services directly through ZIVO's platform.",
    requirements: ["5,000+ followers", "Completed at least 10 LIVE streams", "Professional service to offer", "Identity verification completed"],
    benefits: ["Set your own hourly rates", "Built-in scheduling and booking", "Secure payment processing", "Client reviews and ratings", "Featured in Service+ marketplace"],
    howItWorks: ["Set up your service profile with rates and availability", "Clients discover you through LIVE or the marketplace", "Conduct sessions via ZIVO LIVE", "Get paid automatically after each session"],
    faq: [
      { q: "What services can I offer?", a: "Coaching, tutoring, consulting, fitness training, music lessons, and more. Must comply with guidelines." },
      { q: "How much does ZIVO take?", a: "ZIVO takes a 20% platform fee. You keep 80% of all earnings." },
    ],
  },
  "subscription": {
    icon: Crown, label: "Subscription", accent: "hsl(38 92% 50%)",
    description: "Connect more closely with viewers through subscriber-only content.",
    longDescription: "Subscription lets fans pay a monthly fee to access exclusive content, badges, and perks. Set your own price and create premium experiences for your most dedicated followers.",
    requirements: ["1,000+ followers", "Consistent posting history (3+ months)", "At least 3 subscriber perks defined", "Identity verification"],
    benefits: ["Recurring monthly revenue", "Custom subscriber badges", "Exclusive content feeds", "Subscriber-only LIVE streams", "Direct message access for subscribers"],
    howItWorks: ["Choose your subscription price ($0.99-$99.99/mo)", "Define subscriber-only perks and content", "Promote your subscription to followers", "ZIVO handles billing; you keep 70%"],
    faq: [
      { q: "What price should I set?", a: "Start at $2.99-$4.99/mo. Increase as you add more perks." },
      { q: "How many perks do I need?", a: "Minimum 3 perks required. We recommend 5+ for best retention." },
    ],
  },
  "tips-donations": {
    icon: Heart, label: "Tips & Donations", accent: "hsl(340 75% 55%)",
    description: "Let your audience show appreciation with direct tips.",
    longDescription: "Enable tips on your profile and content so fans can directly support your work. Tips can be one-time or recurring, and you keep 80% of every tip received.",
    requirements: ["500+ followers", "Account in good standing", "Identity verification", "Linked payout method"],
    benefits: ["Instant gratification from fans", "No minimum tip amount", "Custom thank-you messages", "Tip leaderboards on your profile", "Tax-ready earnings reports"],
    howItWorks: ["Enable tips in your Creator Settings", "Fans see a tip button on your profile and videos", "Tips are processed instantly via Stripe", "Earnings appear in your wallet within 24 hours"],
    faq: [
      { q: "Is there a minimum tip?", a: "The minimum tip is $0.50. There's no maximum." },
      { q: "How quickly do I get paid?", a: "Tips are available in your wallet within 24 hours." },
    ],
  },
  "live-gifts": {
    icon: Video, label: "LIVE Gifts", accent: "hsl(263 70% 58%)",
    description: "Receive virtual gifts from viewers during LIVE streams.",
    longDescription: "During LIVE streams, viewers can send virtual gifts that convert to real money. The more engaging your stream, the more gifts you'll receive. Top streamers earn thousands per session.",
    requirements: ["1,000+ followers", "At least 5 previous LIVE streams", "18+ years old", "Identity verification"],
    benefits: ["Real-time earnings during streams", "Gift multipliers during peak hours", "LIVE battle bonuses", "Diamond-to-cash conversion", "Weekly LIVE leaderboard prizes"],
    howItWorks: ["Go LIVE on ZIVO", "Viewers purchase and send virtual gifts", "Gifts convert to diamonds in your account", "Exchange diamonds for cash in your wallet"],
    faq: [
      { q: "How much are gifts worth?", a: "Gift values range from $0.01 to $500. ZIVO takes 50% of gift value." },
      { q: "What are LIVE Battles?", a: "Compete with another creator for gifts. Winner gets a visibility boost." },
    ],
  },
  "zivo-shop": {
    icon: Store, label: "ZIVO Shop", accent: "hsl(142 71% 45%)",
    description: "Sell products directly to your audience.",
    longDescription: "ZIVO Shop lets you sell physical products, digital downloads, and merchandise directly from your profile. Tag products in videos for seamless content-to-commerce conversion.",
    requirements: ["1,000+ followers", "Valid business or personal identity", "Product photos and descriptions", "Shipping capability (for physical goods)"],
    benefits: ["Shoppable video tags", "Built-in checkout", "Order management dashboard", "LIVE shopping events", "Analytics and conversion tracking"],
    howItWorks: ["Add products with photos, descriptions, and pricing", "Tag products in your videos and LIVE streams", "Fans purchase without leaving ZIVO", "Fulfill orders from your Shop Dashboard"],
    faq: [
      { q: "What can I sell?", a: "Physical goods, digital products, merchandise, and more. Must comply with guidelines." },
      { q: "What are the fees?", a: "ZIVO takes a 5% transaction fee + payment processing fees." },
    ],
  },
  "brand-partnerships": {
    icon: Megaphone, label: "Brand Partnerships", accent: "hsl(25 95% 53%)",
    description: "Get matched with brands for sponsored content.",
    longDescription: "Brand Partnerships connects you with brands looking for authentic creator collaborations. Get discovered by brands, negotiate deals, and manage partnerships all within ZIVO.",
    requirements: ["10,000+ followers", "3%+ engagement rate", "Professional media kit", "Completed identity verification"],
    benefits: ["Direct brand match-making", "Campaign management tools", "Automated FTC disclosures", "Rate card templates", "Performance analytics for sponsors"],
    howItWorks: ["Complete your brand profile and media kit", "Brands discover you via the marketplace", "Negotiate terms and deliverables", "Create content and track campaign performance"],
    faq: [
      { q: "How do I set my rates?", a: "Typical rates: $100-$500 per 10K followers. Use ZIVO's rate calculator." },
      { q: "Do I have to accept every deal?", a: "No. You choose which brands to work with. Authenticity matters." },
    ],
  },
  "locked-media": {
    icon: Lock, label: "Locked Media", accent: "hsl(263 70% 58%)",
    description: "Monetize exclusive photos and videos with pay-to-unlock.",
    longDescription: "Send exclusive photos and videos as pay-to-unlock content in chat. Set your own price per piece and earn directly from your most exclusive content.",
    requirements: ["ZIVO+ Chat+ or Pro subscription", "Identity verification", "18+ years old", "Content must follow guidelines"],
    benefits: ["Set prices from $0.50 to $999.99", "Direct fan-to-creator payments", "Content protection and DRM", "Earnings in real-time", "Analytics on unlocks"],
    howItWorks: ["Attach a photo or video in chat", "Set your unlock price", "Recipient sees a blurred preview", "They pay to unlock; you earn instantly"],
    faq: [
      { q: "What content can I lock?", a: "Photos and videos that follow Community Guidelines. No prohibited content." },
      { q: "What's the platform fee?", a: "ZIVO takes 20%. You keep 80% of every unlock." },
    ],
  },
  "digital-products": {
    icon: PenTool, label: "Digital Products", accent: "hsl(300 70% 55%)",
    description: "Sell e-books, courses, templates, and digital bundles.",
    longDescription: "Create and sell digital products like e-books, online courses, design templates, presets, and digital art. Automatic delivery after purchase with no shipping hassles.",
    requirements: ["500+ followers", "Original digital content to sell", "Identity verification", "Product descriptions and previews"],
    benefits: ["Zero shipping costs", "Automatic delivery", "Unlimited inventory", "Recurring revenue from courses", "Bundle and discount options"],
    howItWorks: ["Upload your digital product", "Set pricing and write a compelling description", "Promote through your content", "Buyers get instant access after payment"],
    faq: [
      { q: "What formats are supported?", a: "PDF, EPUB, MP4, MP3, ZIP, and more. Max file size is 2GB." },
      { q: "Can I offer free samples?", a: "Yes. You can set free previews and sample downloads." },
    ],
  },
  "affiliate-marketing": {
    icon: Target, label: "Affiliate Marketing", accent: "hsl(172 66% 50%)",
    description: "Earn commissions promoting ZIVO services.",
    longDescription: "Join ZIVO's affiliate program and earn commissions by referring new users and promoting ZIVO services. Share your unique link and earn from every conversion.",
    requirements: ["Active ZIVO account", "100+ followers", "Content that aligns with ZIVO's values"],
    benefits: ["Up to 30% commission per referral", "Custom tracking links", "Real-time earnings dashboard", "Monthly payouts", "Exclusive affiliate promotions"],
    howItWorks: ["Get your unique referral link", "Share it in your content and bio", "Earn commission when someone signs up or purchases", "Track everything in the Affiliate Hub"],
    faq: [
      { q: "How much can I earn per referral?", a: "Commission rates range from 10-30% depending on the product." },
      { q: "Is there a cookie duration?", a: "Yes, 30-day cookie window for attributed conversions." },
    ],
  },
  "audio-monetization": {
    icon: Radio, label: "Audio Monetization", accent: "hsl(263 70% 58%)",
    description: "Monetize live audio rooms with tickets and tips.",
    longDescription: "Host paid audio rooms, podcasts, and live discussions. Charge for entry, accept tips during sessions, and build a loyal listener community.",
    requirements: ["1,000+ followers", "Previous audio room hosting experience", "Identity verification"],
    benefits: ["Ticketed audio events", "Live tips during sessions", "Recording and replay access", "Co-host revenue sharing", "Analytics dashboard"],
    howItWorks: ["Create an audio room or podcast", "Set ticket prices or make it free with tips", "Host engaging discussions", "Earnings go directly to your wallet"],
    faq: [
      { q: "Can I co-host with others?", a: "Yes. Revenue is split based on agreed percentages." },
    ],
  },
  "paid-events": {
    icon: Calendar, label: "Paid Events", accent: "hsl(199 89% 48%)",
    description: "Host and sell tickets to events.",
    longDescription: "Create and sell tickets to virtual or in-person events. From workshops to meetups, monetize your community gatherings.",
    requirements: ["1,000+ followers", "Event planning capability", "Identity verification"],
    benefits: ["Custom ticket pricing", "Event page with details", "Attendee management", "Check-in tools", "Post-event analytics"],
    howItWorks: ["Create an event with details and pricing", "Share the event page with your audience", "Sell tickets directly through ZIVO", "Host the event and engage attendees"],
    faq: [
      { q: "What types of events?", a: "Virtual meetups, workshops, webinars, in-person gatherings, and more." },
    ],
  },
  "course-builder": {
    icon: BookOpen, label: "Course Builder", accent: "hsl(198 93% 59%)",
    description: "Create and sell structured courses.",
    longDescription: "Build comprehensive online courses with modules, lessons, quizzes, and certificates. The ultimate tool for creators who want to teach and earn.",
    requirements: ["500+ followers", "Subject matter expertise", "Course content prepared", "Identity verification"],
    benefits: ["Drag-and-drop course builder", "Video, text, and quiz lessons", "Student progress tracking", "Completion certificates", "Drip content scheduling"],
    howItWorks: ["Design your course structure", "Upload lessons and materials", "Set pricing and enrollment limits", "Students enroll and learn at their pace"],
    faq: [
      { q: "How many courses can I create?", a: "Unlimited courses. Each can have up to 100 lessons." },
    ],
  },
  "creator-marketplace": {
    icon: Palette, label: "Creator Marketplace", accent: "hsl(340 75% 55%)",
    description: "Offer freelance services on ZIVO.",
    longDescription: "List your freelance services — design, writing, video editing, coaching — and get hired directly by other creators and businesses on ZIVO.",
    requirements: ["Portfolio of work", "Service descriptions", "Identity verification", "Set rates and availability"],
    benefits: ["Direct client bookings", "Built-in messaging", "Secure escrow payments", "Reviews and ratings", "Featured listings"],
    howItWorks: ["Create your service listing", "Set prices and turnaround times", "Clients book and pay upfront", "Deliver work and get paid"],
    faq: [
      { q: "What services can I offer?", a: "Graphic design, video editing, writing, music production, coaching, and more." },
    ],
  },
  "sound-licensing": {
    icon: Music, label: "Sound Licensing", accent: "hsl(38 92% 50%)",
    description: "License your original music to others.",
    longDescription: "Upload your original music and sounds. Other creators can license them for use in their content, and you earn royalties every time.",
    requirements: ["Original music or sound effects", "Copyright ownership proof", "Identity verification"],
    benefits: ["Passive royalty income", "Global distribution", "Usage analytics", "Custom licensing terms", "Featured in sound library"],
    howItWorks: ["Upload your original sounds", "Set licensing terms and pricing", "Creators discover and use your sounds", "Earn royalties on every use"],
    faq: [
      { q: "Do I retain ownership?", a: "Yes. You always own your music. Creators license usage rights only." },
    ],
  },
  "paid-dms": {
    icon: MessageCircle, label: "Paid DMs", accent: "hsl(142 71% 45%)",
    description: "Charge for priority messages.",
    longDescription: "Let fans pay for priority direct messages. Their messages jump to the top of your inbox, and you earn for every interaction.",
    requirements: ["5,000+ followers", "Active response history", "Identity verification"],
    benefits: ["Set your own DM price", "Priority inbox placement", "Auto-replies for common questions", "Earnings per message", "Read receipt tracking"],
    howItWorks: ["Enable Paid DMs in settings", "Set your price per message", "Fans pay to send priority messages", "You earn for reading and responding"],
    faq: [
      { q: "Do I have to respond?", a: "You should respond within 48 hours. Unread messages are refunded after 72 hours." },
    ],
  },
  "merch-prints": {
    icon: Camera, label: "Merch & Prints", accent: "hsl(340 75% 55%)",
    description: "Sell physical products and merchandise.",
    longDescription: "Design and sell custom merchandise — t-shirts, hoodies, posters, phone cases, and more. Print-on-demand means no upfront costs or inventory.",
    requirements: ["Design files or use our templates", "Identity verification", "Choose product categories"],
    benefits: ["No upfront inventory costs", "Print-on-demand fulfillment", "Custom designs and branding", "Global shipping", "Profit margin control"],
    howItWorks: ["Upload your designs or use templates", "Choose products (shirts, mugs, posters, etc.)", "Set your profit margin", "We handle printing and shipping"],
    faq: [
      { q: "How much profit do I make?", a: "You set the retail price. Base cost varies by product. Average margin is 30-50%." },
    ],
  },
  "podcast": {
    icon: Mic, label: "Podcast", accent: "hsl(263 70% 58%)",
    description: "Monetize podcasts with premium episodes.",
    longDescription: "Host your podcast on ZIVO with free and premium episodes. Build a subscriber base with exclusive content and earn from ads, tips, and subscriptions.",
    requirements: ["Audio recording capability", "Consistent publishing schedule", "Identity verification"],
    benefits: ["Free + premium episode tiers", "Built-in distribution", "Subscriber management", "Ad placement tools", "Download analytics"],
    howItWorks: ["Upload podcast episodes", "Mark episodes as free or premium", "Listeners subscribe for premium access", "Earn from subscriptions and ad revenue"],
    faq: [
      { q: "Can I import my existing podcast?", a: "Yes. Import via RSS feed from any platform." },
    ],
  },
};

function getProgramIdFromSlug(slug: string): string {
  return slug;
}

export default function ProgramDetailPage() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const program = programId ? PROGRAM_DATA[programId] : null;

  // Check enrollment status
  const { data: enrollment, isLoading: enrollLoading } = useQuery({
    queryKey: ["program-enrollment", user?.id, programId],
    queryFn: async () => {
      const { data } = await supabase
        .from("creator_program_enrollments")
        .select("*")
        .eq("user_id", user!.id)
        .eq("program_id", programId!)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!programId,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("creator_program_enrollments")
        .insert({ user_id: user!.id, program_id: programId!, status: "active" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["program-enrollments"] });
      toast.success(`You've joined ${program?.label}! 🎉`);
    },
    onError: (err: any) => {
      if (err.message?.includes("duplicate")) {
        toast.info("You're already enrolled in this program.");
      } else {
        toast.error("Failed to join. Please try again.");
      }
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("creator_program_enrollments")
        .delete()
        .eq("user_id", user!.id)
        .eq("program_id", programId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["program-enrollments"] });
      toast.success("You've left the program.");
    },
    onError: () => toast.error("Failed to leave. Please try again."),
  });

  if (!program) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-lg">Program not found</p>
          <button onClick={() => navigate("/monetization")} className="mt-4 text-primary font-semibold text-sm">
            ← Back to Monetization
          </button>
        </div>
        <ZivoMobileNav />
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const IconComp = program.icon;

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title={`${program.label} – ZIVO Programs`} description={program.description} />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/monetization")} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold flex-1 text-center truncate">{program.label}</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${program.accent}20, ${program.accent}08)` }}>
            <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 30% 50%, ${program.accent}30, transparent 70%)` }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${program.accent}20` }}>
                <IconComp className="w-8 h-8" style={{ color: program.accent }} />
              </div>
              <h2 className="text-xl font-extrabold mb-2">{program.label}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{program.longDescription}</p>
            </div>
          </div>
        </motion.div>

        {/* Join / Enrolled Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> You're enrolled
              </div>
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold touch-manipulation active:scale-[0.98] transition-transform"
              >
                {leaveMutation.isPending ? "Leaving..." : "Leave Program"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => user ? joinMutation.mutate() : toast.error("Please sign in to join")}
              disabled={joinMutation.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white touch-manipulation active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, ${program.accent}, ${program.accent}cc)` }}
            >
              {joinMutation.isPending ? "Joining..." : "Join Program"}
            </button>
          )}
        </motion.div>

        {/* Requirements */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: program.accent }} /> Requirements
          </h3>
          <div className="rounded-xl border border-border/40 bg-card p-4 space-y-2.5">
            {program.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${program.accent}15` }}>
                  <Check className="w-3 h-3" style={{ color: program.accent }} />
                </div>
                <p className="text-sm text-foreground/80">{req}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: program.accent }} /> Benefits
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {program.benefits.map((benefit, i) => (
              <div key={i} className="rounded-xl border border-border/30 bg-card p-3 flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: program.accent }} />
                <p className="text-sm font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: program.accent }} /> How It Works
          </h3>
          <div className="space-y-3">
            {program.howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: program.accent }}>
                  {i + 1}
                </div>
                <p className="text-sm text-foreground/80 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <h3 className="font-bold text-[15px] flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: program.accent }} /> FAQ
          </h3>
          <div className="space-y-2">
            {program.faq.map((item, i) => (
              <button
                key={i}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full rounded-xl border border-border/40 bg-card p-3.5 text-left touch-manipulation"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold pr-2">{item.q}</p>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedFaq === i ? "rotate-90" : ""}`} />
                </div>
                {expandedFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground mt-2 leading-relaxed"
                  >
                    {item.a}
                  </motion.p>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Related Links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/monetization/articles")}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card touch-manipulation active:scale-[0.98] transition-transform"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">Creator Academy</p>
              <p className="text-[10px] text-muted-foreground">Learn more about this program</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </button>
          <button
            onClick={() => navigate("/creator-dashboard")}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card touch-manipulation active:scale-[0.98] transition-transform"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold">Creator Dashboard</p>
              <p className="text-[10px] text-muted-foreground">View your earnings & stats</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </button>
        </div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}

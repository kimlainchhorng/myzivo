/**
 * MonetizationArticleDetailPage — Individual article viewer
 * Shows full article content with ZIVO branding
 */
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Share2, Bookmark, ThumbsUp, Eye, Clock,
  ChevronRight, Star, Sparkles,
} from "lucide-react";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";

export default function MonetizationArticleDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  // Convert slug to readable title
  const title = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Article";

  return (
    <div className="min-h-dvh bg-background pb-24">
      <SEOHead title={`${title} – ZIVO Creator Academy`} description={`Learn about ${title} on ZIVO.`} />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/50 touch-manipulation">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold flex-1 text-center truncate">{title}</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-muted/50 touch-manipulation">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2 -mr-2 rounded-full hover:bg-muted/50 touch-manipulation">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-5 space-y-6"
      >
        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-6 flex items-center justify-center min-h-[160px]">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Title & Meta */}
        <div>
          <h2 className="text-2xl font-bold leading-tight mb-3">{title}</h2>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 243.6K views</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min read</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> ZIVO Academy</span>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-sm max-w-none text-foreground/90 space-y-4">
          <p className="text-sm leading-relaxed">
            Welcome to this comprehensive guide from the ZIVO Creator Academy. Whether you're just starting out or looking to level up your creator journey, this article has everything you need to know.
          </p>

          <h3 className="text-base font-bold text-foreground mt-6">Getting Started</h3>
          <p className="text-sm leading-relaxed">
            As a ZIVO creator, you have access to a powerful suite of tools designed to help you create, grow, and monetize your content. From our intuitive video editor to analytics dashboard, every feature is built with creators in mind.
          </p>

          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 my-4">
            <p className="text-xs font-semibold text-primary mb-1">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Consistency is key! Creators who post at least 3-4 times per week see 2x more engagement than those who post sporadically.
            </p>
          </div>

          <h3 className="text-base font-bold text-foreground mt-6">Key Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Create high-quality content with built-in editing tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Track your performance with detailed analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Monetize through multiple revenue streams</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Build a loyal community with engagement tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Collaborate with brands and other creators</span>
            </li>
          </ul>

          <h3 className="text-base font-bold text-foreground mt-6">Best Practices</h3>
          <p className="text-sm leading-relaxed">
            The most successful creators on ZIVO share a few common traits: they're authentic, consistent, and they engage genuinely with their community. Focus on creating content that provides value, whether that's entertainment, education, or inspiration.
          </p>

          <div className="rounded-xl bg-muted/30 border border-border/40 p-4 my-4">
            <p className="text-xs font-semibold text-foreground mb-1">📊 Did You Know?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ZIVO creators who use all available monetization features earn on average 3.5x more than those who rely on a single revenue stream.
            </p>
          </div>

          <h3 className="text-base font-bold text-foreground mt-6">Next Steps</h3>
          <p className="text-sm leading-relaxed">
            Ready to take your ZIVO journey to the next level? Explore more articles in our Creator Academy, join the creator community, and start implementing these strategies today.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 py-3 border-t border-border/30">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 text-xs font-semibold touch-manipulation active:scale-95 transition-transform">
            <ThumbsUp className="w-3.5 h-3.5" /> Helpful
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 text-xs font-semibold touch-manipulation active:scale-95 transition-transform">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 text-xs font-semibold touch-manipulation active:scale-95 transition-transform">
            <Bookmark className="w-3.5 h-3.5" /> Save
          </button>
        </div>

        {/* Related Articles */}
        <div>
          <h3 className="font-bold text-base mb-3">Related Articles</h3>
          <div className="space-y-2">
            {[
              "Getting started with Subscription",
              "Creator Rewards Program",
              "Understanding the ZIVO algorithm",
              "Growing your followers organically",
            ].map((related) => (
              <button
                key={related}
                onClick={() => navigate(`/monetization/articles/${related.toLowerCase().replace(/\s+/g, "-")}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card text-left touch-manipulation active:scale-[0.98] transition-transform"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[13px] font-semibold flex-1">{related}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </button>
            ))}
          </div>
        </div>

        {/* Back to Articles */}
        <button
          onClick={() => navigate("/monetization/articles")}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold touch-manipulation active:scale-[0.98] transition-transform"
        >
          Browse All Articles
        </button>
      </motion.div>

      <ZivoMobileNav />
    </div>
  );
}

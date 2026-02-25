/**
 * Newsletter Section - Premium email capture with glassmorphism
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-8 sm:p-12 glow-border-hover text-center relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-400" />

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 shimmer-chip">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Stay Updated</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
              Get exclusive deals in your inbox
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto">
              Join 50,000+ travelers who get weekly fare alerts, secret deals, and travel tips from ZIVO.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-13 rounded-2xl text-base border-border/50 bg-background/50 focus:border-primary/50 focus:bg-background transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className={cn(
                  "h-13 px-8 rounded-2xl font-semibold gap-2 transition-all duration-300",
                  subscribed
                    ? "bg-emerald-500 hover:bg-emerald-500"
                    : "glow-green-btn"
                )}
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground/60 mt-5">
              No spam, unsubscribe anytime. Read our{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

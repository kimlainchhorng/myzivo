/**
 * Newsletter Section - Premium gradient border card
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    toast.success("You're in!", { description: "Check your inbox for a welcome email with exclusive deals." });
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {/* Gradient border wrapper */}
          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-transparent to-primary/20">
            <div className="rounded-2xl bg-card p-8 sm:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Exclusive Deals</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                Get travel deals in your inbox
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
                    className="pl-12 h-12 rounded-xl text-base border-border/50 bg-muted/30 focus:border-primary/50 transition-all"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "h-12 px-8 rounded-xl font-semibold gap-2 transition-all duration-300 active:scale-[0.97]",
                    subscribed ? "bg-emerald-500 hover:bg-emerald-500" : ""
                  )}
                >
                  {subscribed ? (
                    <><CheckCircle2 className="w-5 h-5" /> Subscribed!</>
                  ) : (
                    <>Subscribe <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground/60 mt-5">
                No spam, unsubscribe anytime. Read our{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, Gift, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      toast.success("Welcome to ZIVO! Check your inbox for exclusive deals.");
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/10 via-card/50 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-emerald-500 mb-2">
              You're In!
            </h3>
            <p className="text-muted-foreground">
              Welcome to the ZIVO family. Exclusive deals are on their way to your inbox!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card/50 to-teal-500/10 border border-primary/20 rounded-3xl p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Gift className="w-3 h-3 mr-1" /> Exclusive Access
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
                Get <span className="text-primary">Secret Deals</span> in Your Inbox
              </h2>
              <p className="text-muted-foreground mb-2">
                Join 500,000+ travelers getting exclusive discounts, price drop alerts, and travel inspiration.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Up to 50% off</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Weekly deals</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 w-full sm:w-[280px] bg-card/80 border-border/50"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2 h-12">
                  Subscribe <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3 text-center md:text-left">
                No spam, unsubscribe anytime. Read our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;

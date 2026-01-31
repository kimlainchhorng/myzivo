import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Car, Bell, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CarNewsletterSectionProps {
  className?: string;
}

export default function CarNewsletterSection({ className }: CarNewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      toast({
        title: "Welcome to ZIVO Rentals!",
        description: "You'll receive exclusive car rental deals.",
      });
    }
  };

  const benefits = [
    { icon: Car, text: "Weekly rental deals" },
    { icon: Bell, text: "Price drop notifications" },
    { icon: Sparkles, text: "New location alerts" },
  ];

  return (
    <section className={cn("py-10 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-card to-cyan-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <CardContent className="p-6 sm:p-10 relative">
            <div className="max-w-2xl mx-auto text-center">
              <Badge className="mb-4 px-4 py-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Mail className="w-4 h-4 mr-2" />
                Newsletter
              </Badge>
              
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Get Exclusive
                <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent ml-2">
                  Rental Deals
                </span>
              </h2>
              
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Join 300K+ drivers and save up to 40% on car rentals with our member-only offers.
              </p>

              {!isSubscribed ? (
                <>
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 bg-background/50 border-border/50"
                      required
                    />
                    <Button 
                      type="submit"
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 touch-manipulation active:scale-[0.98]"
                    >
                      Subscribe
                    </Button>
                  </form>

                  <div className="flex flex-wrap justify-center gap-4">
                    {benefits.map((benefit) => (
                      <div key={benefit.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <benefit.icon className="w-4 h-4 text-blue-400" />
                        <span>{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-semibold text-emerald-500">You're subscribed!</p>
                  <p className="text-sm text-muted-foreground">Check your inbox for a welcome discount.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

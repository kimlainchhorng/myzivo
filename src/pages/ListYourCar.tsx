/**
 * List Your Car Landing Page
 * Marketing page to attract car owners to join the P2P marketplace
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Car, DollarSign, Shield, Calendar, Star, CheckCircle, 
  ArrowRight, Sparkles, Clock, Users, TrendingUp, Lock 
} from "lucide-react";
import ZivoLogo from "@/components/ZivoLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useP2PBetaSettings } from "@/hooks/useP2PSettings";

const howItWorks = [
  {
    step: 1,
    icon: Car,
    title: "List Your Car",
    description: "Create a listing in minutes. Add photos, set your daily rate, and define availability.",
  },
  {
    step: 2,
    icon: Users,
    title: "Get Bookings",
    description: "Verified renters request your car. Accept bookings that work for your schedule.",
  },
  {
    step: 3,
    icon: DollarSign,
    title: "Earn Money",
    description: "Get paid directly to your account. Most owners earn $500-$1,000+ per month.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "$1M Insurance Coverage",
    description: "Every trip includes comprehensive insurance protection for your vehicle.",
  },
  {
    icon: CheckCircle,
    title: "Verified Renters",
    description: "All renters are vetted with ID verification and driving record checks.",
  },
  {
    icon: Calendar,
    title: "You're in Control",
    description: "Set your own prices, availability, and booking preferences.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our support team is always available to help with any issues.",
  },
];

const testimonials = [
  {
    name: "Michael R.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "I've made over $8,000 in the last 6 months renting out my Tesla. The process is seamless!",
    avatar: "M",
  },
  {
    name: "Sarah T.",
    location: "Miami, FL",
    rating: 5,
    text: "ZIVO handles everything - insurance, payments, even vetting renters. I just collect the money.",
    avatar: "S",
  },
  {
    name: "David K.",
    location: "Austin, TX",
    rating: 5,
    text: "My car payment is now covered by renters. Best decision I've made this year.",
    avatar: "D",
  },
];

export default function ListYourCar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: betaSettings } = useP2PBetaSettings();

  const handleGetStarted = () => {
    if (user) {
      navigate("/owner/apply");
    } else {
      navigate("/login", { state: { from: { pathname: "/owner/apply" } } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <ZivoLogo size="md" />
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={handleGetStarted}>
                Start Hosting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-60" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Private Beta Badge */}
            {betaSettings?.betaMode && (
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full mb-4">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Private Beta</span>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Earn up to $1,500/month</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Turn Your Car Into a
              <span className="text-primary"> Money Machine</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of car owners earning passive income by sharing their vehicles. 
              It's free to list, and you're always in control.
            </p>

            {/* Beta Cities Callout */}
            {betaSettings?.betaMode && betaSettings.betaCities?.length > 0 && (
              <Card className="bg-muted/50 border-amber-500/20 mb-8 max-w-lg mx-auto">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Currently accepting applications in:{" "}
                    <span className="font-medium text-foreground">
                      {betaSettings.betaCities.join(", ")}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                List Your Car
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/cars")} className="text-lg px-8">
                Browse Cars
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">$850</div>
                <div className="text-sm text-muted-foreground">Avg. monthly earnings</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active hosts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">$1M</div>
                <div className="text-sm text-muted-foreground">Insurance coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start earning in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm text-primary font-medium mb-2">Step {item.step}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Host With ZIVO?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've got you covered every step of the way
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What Hosts Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Join our community of successful car hosts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-teal-500/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              It takes just 10 minutes to create your listing. Start earning today!
            </p>
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-10">
              Become a Host
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ZivoLogo size="sm" />
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/terms")} className="hover:text-foreground">Terms</button>
              <button onClick={() => navigate("/privacy")} className="hover:text-foreground">Privacy</button>
              <button onClick={() => navigate("/help")} className="hover:text-foreground">Help</button>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ZIVO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

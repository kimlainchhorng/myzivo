/**
 * ZIVO Creator Program Hub
 * 
 * Main landing page for the creator program with:
 * - Program overview
 * - Tracking link generator (no login required)
 * - Toolkit with promo captions, CTA suggestions
 * - FAQ section
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Users, 
  Link2, 
  DollarSign, 
  Plane, 
  Hotel, 
  Car, 
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Share2,
  Search,
  ExternalLink,
  MessageSquare,
  Image,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

const DOMAIN = "https://hizivo.com";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "blog", label: "Blog" },
  { value: "facebook", label: "Facebook" },
];

const PRODUCTS = [
  { value: "flights", label: "Flights", path: "/flights", icon: Plane, color: "sky" },
  { value: "hotels", label: "Hotels", path: "/hotels", icon: Hotel, color: "amber" },
  { value: "car-rental", label: "Car Rental", path: "/rent-car", icon: Car, color: "violet" },
  { value: "extras", label: "Travel Extras", path: "/extras", icon: Sparkles, color: "teal" },
];

const PROMO_CAPTIONS = [
  "✈️ Planning your next trip? Compare flight prices before you book → [Your Link]",
  "🏨 Don't overpay for hotels! Search & compare deals from top booking sites → [Your Link]",
  "🚗 Need a rental car? Find the best rates from 500+ providers → [Your Link]",
  "🌍 Everything you need for travel: flights, hotels, cars & more → [Your Link]",
  "💡 Pro tip: Always compare prices before booking. Here's my go-to tool → [Your Link]",
];

const CTA_SUGGESTIONS = [
  "🔗 Link in bio",
  "👆 Tap to search",
  "✨ Find your deal",
  "🔍 Compare prices now",
  "⬇️ Check it out below",
];

const FAQS = [
  {
    question: "How do I earn commission?",
    answer: "When users click your link, search on ZIVO, and complete a booking on our partner sites (airlines, hotels, car rental companies), you earn a commission. ZIVO is an affiliate platform—all bookings happen on trusted partner websites."
  },
  {
    question: "When do I get paid?",
    answer: "Commissions are tracked through Travelpayouts affiliate network. Payments are processed monthly once you reach the minimum threshold. You'll need a Travelpayouts account for payouts—contact us to get set up."
  },
  {
    question: "Do users pay more through my link?",
    answer: "No! Users see the same prices they'd find anywhere else. Your commission comes from the travel partners, not the users. It's a win-win."
  },
  {
    question: "What can I promote?",
    answer: "You can promote Flights, Hotels, Car Rentals, and Travel Extras (eSIM, transfers, activities, luggage storage). Each product has its own tracking link."
  },
  {
    question: "Are there any rules?",
    answer: "Yes—please don't make false claims like 'cheapest guaranteed' or 'official prices'. Use language like 'search & compare' or 'find deals'. ZIVO is a comparison platform, not a direct seller."
  },
];

export default function Creators() {
  const [creatorName, setCreatorName] = useState("");
  const [platform, setPlatform] = useState("");
  const [campaign, setCampaign] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const generateLink = (productPath: string) => {
    const params = new URLSearchParams();
    if (platform) params.set("utm_source", platform);
    if (campaign) params.set("utm_campaign", campaign);
    if (creatorName) params.set("creator", creatorName.toLowerCase().replace(/\s+/g, "_"));
    
    const queryString = params.toString();
    return `${DOMAIN}${productPath}${queryString ? `?${queryString}` : ""}`;
  };

  const copyToClipboard = async (link: string, productValue: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(productValue);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const scrollToGenerator = () => {
    document.getElementById("link-generator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Creator Program – ZIVO"
        description="Join the ZIVO Creator Program. Share travel tools, earn commission when users book on partner sites."
        canonical="https://hizivo.com/creators"
      />
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-teal-500/5 to-violet-500/10" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Users className="w-3 h-3 mr-1" />
                Creator Program
              </Badge>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                ZIVO Creator Program
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Share ZIVO travel tools with your audience. Earn commission when users 
                search, compare, and book on partner sites.
              </p>

              {/* How It Works */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your unique tracking link and share it with your audience
                  </p>
                </div>
                
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <Search className="w-6 h-6 text-sky-500" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Users Search & Compare</h3>
                  <p className="text-sm text-muted-foreground">
                    Your audience discovers travel options on ZIVO
                  </p>
                </div>
                
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Book on Partner Sites</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookings complete on trusted partners—you earn commission
                  </p>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={scrollToGenerator}
                className="gap-2 bg-gradient-to-r from-primary to-teal-400"
              >
                <Link2 className="w-5 h-5" />
                Get Your Tracking Link
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Link Generator Section */}
        <section id="link-generator" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-3">
                  <Link2 className="w-3 h-3 mr-1" />
                  Link Generator
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Generate Your Tracking Links
                </h2>
                <p className="text-muted-foreground">
                  No account required. Create links instantly and start sharing.
                </p>
              </div>

              <Card className="mb-8">
                <CardContent className="p-6 space-y-6">
                  {/* Creator Name */}
                  <div>
                    <Label htmlFor="creator-name" className="text-sm font-medium">
                      Creator Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="creator-name"
                      placeholder="e.g., TravelWithJohn"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This helps us track your referrals
                    </p>
                  </div>

                  {/* Platform */}
                  <div>
                    <Label htmlFor="platform" className="text-sm font-medium">
                      Platform <span className="text-destructive">*</span>
                    </Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campaign Name (Optional) */}
                  <div>
                    <Label htmlFor="campaign" className="text-sm font-medium">
                      Campaign Name <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="campaign"
                      placeholder="e.g., summer_deals, la_trip"
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use to track specific campaigns or content
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Tracking Links</h3>
                
                {PRODUCTS.map((product) => {
                  const link = generateLink(product.path);
                  const Icon = product.icon;
                  const isCopied = copiedLink === product.value;
                  
                  return (
                    <Card key={product.value} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className={`w-10 h-10 rounded-lg bg-${product.color}-500/20 flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 text-${product.color}-500`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{product.label}</div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {creatorName && platform ? link : "Fill in the form above to generate your link"}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isCopied ? "default" : "outline"}
                          disabled={!creatorName || !platform}
                          onClick={() => copyToClipboard(link, product.value)}
                          className="shrink-0 gap-1.5"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                All clicks and conversions are tracked automatically. View performance in your creator dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Creator Toolkit Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Creator Toolkit
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Ready-to-Use Content
                </h2>
                <p className="text-muted-foreground">
                  Promo captions, CTAs, and assets to help you promote ZIVO
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Promo Captions */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Promo Captions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PROMO_CAPTIONS.map((caption, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer group"
                        onClick={() => {
                          navigator.clipboard.writeText(caption);
                          toast.success("Caption copied!");
                        }}
                      >
                        {caption}
                        <Copy className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* CTA Suggestions */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ArrowRight className="w-5 h-5 text-primary" />
                      CTA Button Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {CTA_SUGGESTIONS.map((cta, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 transition-colors py-1.5 px-3"
                          onClick={() => {
                            navigator.clipboard.writeText(cta);
                            toast.success("CTA copied!");
                          }}
                        >
                          {cta}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Banner Assets
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-teal-500/20 border border-dashed border-primary/30 flex items-center justify-center"
                          >
                            <span className="text-xs text-muted-foreground">Coming Soon</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Professional banners available soon. Contact us for custom assets.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-3">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  FAQ
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Common Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {FAQS.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="bg-card border rounded-xl px-6"
                  >
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Contact CTA */}
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Questions about the program or need custom assets?
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "mailto:creators@hizivo.com"}
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Contact Creator Support
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Disclosure */}
        <section className="py-8 border-t">
          <div className="container mx-auto px-4">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              ZIVO is a travel search and comparison platform. We earn affiliate commissions 
              when users book through partner links. All bookings and payments are processed 
              on partner websites.{' '}
              <a href="/affiliate-disclosure" className="text-primary hover:underline">
                Learn more
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

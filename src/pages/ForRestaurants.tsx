import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/shared/FAQSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  TrendingUp,
  BarChart3,
  Wallet,
  Megaphone,
  ClipboardList,
  Store,
  ArrowRight,
  CheckCircle,
  Users,
  Star,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const benefitCards = [
  { icon: TrendingUp, title: "Increase Orders", desc: "Reach thousands of new hungry customers in your area." },
  { icon: ClipboardList, title: "Easy Management", desc: "Manage your menu, hours, and orders from one dashboard." },
  { icon: Wallet, title: "Fast Payouts", desc: "Get paid weekly — no delays, no hassle." },
  { icon: Megaphone, title: "Marketing Tools", desc: "Run promotions, featured placements, and loyalty offers." },
];

const steps = [
  { icon: Store, title: "Apply", desc: "Fill out our quick registration form to get started." },
  { icon: ClipboardList, title: "Set Up Menu", desc: "Upload your menu, set prices, and customize your store." },
  { icon: UtensilsCrossed, title: "Start Receiving Orders", desc: "Go live and start getting orders from ZIVO customers." },
];

const dashboardFeatures = [
  "Real-time order management",
  "Sales & revenue analytics",
  "Menu editor with photo uploads",
  "Customer reviews & ratings",
  "Promotions & discount campaigns",
  "Payout history & reports",
];

const faqs = [
  { question: "How much does it cost to join ZIVO Eats?", answer: "There's no upfront cost. ZIVO takes a small commission on each order — you only pay when you earn." },
  { question: "How do I receive orders?", answer: "Orders come in through the ZIVO restaurant dashboard and app. You can accept, prepare, and track deliveries in real time." },
  { question: "How quickly do I get paid?", answer: "Payouts are processed weekly and deposited directly to your bank account." },
  { question: "Can I run promotions?", answer: "Yes! You can create discounts, featured placements, and loyalty offers from your dashboard." },
  { question: "What support is available?", answer: "ZIVO provides dedicated restaurant support, onboarding assistance, and a merchant help center." },
];

const ForRestaurants = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Eats for Restaurants – Reach More Customers"
        description="Join ZIVO Eats as a restaurant partner. Increase orders, manage your menu, and get fast weekly payouts. Apply today."
      />
      <FAQSchema faqs={faqs} pageType="general" />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <motion.section {...fadeIn} className="container mx-auto px-4 text-center mb-20 max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <UtensilsCrossed className="w-3 h-3 mr-1" />
            For Restaurants
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Reach more hungry customers with ZIVO Eats
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of restaurants growing their business on ZIVO. Easy setup, powerful tools, and weekly payouts.
          </p>
          <Button asChild size="lg" variant="hero">
            <Link to="/restaurant-registration">Apply Now <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </motion.section>

        {/* Benefits */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-10">Why partner with ZIVO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefitCards.map((b) => (
              <Card key={b.title} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 shrink-0">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Step {i + 1}</span>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard Preview */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Powerful restaurant dashboard</h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Everything you need to manage your store</h3>
                  <p className="text-sm text-muted-foreground">All tools in one place, accessible on any device.</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dashboardFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Social Proof Placeholder */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-3xl text-center">
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-12">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 text-primary fill-primary" />
              ))}
            </div>
            <blockquote className="text-lg italic text-muted-foreground mb-4">
              "Since joining ZIVO Eats, our delivery orders have increased by 40%. The dashboard makes it easy to manage everything."
            </blockquote>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Restaurant Partner, New York</span>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your restaurant?</h2>
          <p className="text-muted-foreground mb-8">Join ZIVO Eats today. No upfront costs — start receiving orders in days.</p>
          <Button asChild size="lg" variant="hero">
            <Link to="/restaurant-registration">Start Your Application <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </motion.section>

        {/* FAQ */}
        <motion.section {...fadeIn} className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Restaurant FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default ForRestaurants;

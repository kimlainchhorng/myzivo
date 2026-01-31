import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Car,
  UtensilsCrossed,
  Plane,
  Hotel,
  Package,
  Train,
  Ticket,
  Shield,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Apple,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const footerLinks = {
  travel: [
    { name: "Flights", href: "/book-flight", icon: Plane },
    { name: "Hotels", href: "/book-hotel", icon: Hotel },
    { name: "Car Rental", href: "/rent-car", icon: Car },
    { name: "Things to Do", href: "/things-to-do", icon: Ticket },
  ],
  services: [
    { name: "Rides", href: "/ride", icon: Car },
    { name: "Food Delivery", href: "/food", icon: UtensilsCrossed },
    { name: "Package Delivery", href: "/package-delivery", icon: Package },
    { name: "Bus & Train", href: "/ground-transport", icon: Train },
    { name: "Travel Insurance", href: "/travel-insurance", icon: Shield },
  ],
  company: [
    { name: "About ZIVO", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Partners", href: "/partners" },
    { name: "Contact Us", href: "/contact" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Safety Center", href: "/help#safety" },
    { name: "Accessibility", href: "/accessibility" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#", gradient: "from-sky-400 to-blue-500" },
  { name: "Facebook", icon: Facebook, href: "#", gradient: "from-blue-500 to-blue-600" },
  { name: "Instagram", icon: Instagram, href: "#", gradient: "from-pink-500 to-rose-500" },
  { name: "LinkedIn", icon: Linkedin, href: "#", gradient: "from-blue-600 to-blue-700" },
  { name: "YouTube", icon: Youtube, href: "#", gradient: "from-red-500 to-red-600" },
];

const trustBadges = [
  { icon: Shield, label: "Secure Payments" },
  { icon: CheckCircle2, label: "Verified Drivers" },
  { icon: Phone, label: "24/7 Support" },
  { icon: Shield, label: "Insurance Coverage" },
  { icon: Shield, label: "Privacy Protected" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-gradient-to-b from-card/50 to-card border-t border-border relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/12 to-teal-500/12 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/12 to-orange-500/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-gradient-radial from-violet-500/8 to-transparent rounded-full blur-3xl" />
      
      {/* Static floating elements */}
      <div className="absolute top-24 right-[8%] text-4xl hidden lg:block opacity-20 animate-float">
        ✨
      </div>
      <div className="absolute bottom-1/3 left-[5%] text-3xl hidden lg:block opacity-15 animate-float-delayed">
        🌐
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter Section */}
        <div className="py-12 sm:py-16 lg:py-24 border-b border-border">
          <div 
            className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="text-center lg:text-left">
              <div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-5 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-300"
              >
                <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-muted-foreground">Newsletter</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3">
                Stay in the{" "}
                <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">loop</span>
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Get exclusive deals, travel tips, and updates delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center group-focus-within:from-primary/30 group-focus-within:to-teal-400/20 transition-all">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-16 h-14 text-base rounded-2xl bg-muted/50 border-border/50 focus:border-primary/50 shadow-lg"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "h-14 px-10 rounded-2xl font-bold gap-2 transition-all duration-200 shadow-xl hover:scale-[1.03] active:scale-[0.97]",
                  subscribed 
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30" 
                    : "bg-gradient-to-r from-primary to-teal-400 shadow-primary/30"
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
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 text-center sm:text-left">
              <Link to="/" className="inline-block mb-6 transition-transform duration-200 hover:scale-105">
                <ZivoLogo size="lg" />
              </Link>
              <p className="text-base text-muted-foreground mb-6 max-w-sm mx-auto sm:mx-0">
                The all-in-one super app for rides, food, flights, hotels, and more. Go anywhere.
                Get anything. Travel everywhere.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-3 mb-6 justify-center sm:justify-start">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl border border-border/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Apple className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground leading-none">Download on the</p>
                    <p className="text-sm font-bold leading-tight">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl border border-border/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186a.994.994 0 01-.609-.92V2.734a.99.99 0 01.609-.92zM14.961 13.169l2.652 2.652-9.156 5.211 6.504-7.863zm4.07-2.652l2.4 1.371a.997.997 0 010 1.724l-2.4 1.371L16.84 12l2.192-1.483zM8.457 3.968l9.156 5.211-2.652 2.652-6.504-7.863z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground leading-none">Get it on</p>
                    <p className="text-sm font-bold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 border border-border/50 hover:scale-110 hover:-translate-y-0.5 active:scale-95"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Travel */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-5 text-sm">Travel</h4>
              <ul className="space-y-3">
                {footerLinks.travel.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-5 text-sm">Services</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-5 text-sm">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display font-bold text-foreground mb-5 text-sm">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Links Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col gap-4">
            {/* Platform Description */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                ZIVO is a travel search and comparison platform.
              </p>
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
                ZIVO may earn a commission when you book through partner links. ZIVO does not sell travel products directly. All bookings are completed securely on partner websites.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ZIVO LLC. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button className="flex items-center gap-2 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50">
                  <Globe className="w-4 h-4" />
                  <span>English (US)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-border">|</span>
                <button className="flex items-center gap-2 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50">
                  <MapPin className="w-4 h-4" />
                  <span>United States</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {trustBadges.map((badge, index) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 text-sm text-muted-foreground group cursor-default transition-all duration-200 hover:-translate-y-1 hover:scale-105 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-teal-400/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-teal-400/20 transition-all animate-pulse-slow"
                  style={{ animationDelay: `${index * 300}ms` }}
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium group-hover:text-foreground transition-colors">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

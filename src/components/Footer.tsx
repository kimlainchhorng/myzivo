import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  services: [
    { name: "Rides", href: "/ride", icon: Car },
    { name: "Food Delivery", href: "/food", icon: UtensilsCrossed },
    { name: "Flights", href: "/book-flight", icon: Plane },
    { name: "Hotels", href: "/book-hotel", icon: Hotel },
    { name: "Car Rental", href: "/rent-car", icon: Car },
    { name: "Package Delivery", href: "/package-delivery", icon: Package },
    { name: "Bus & Train", href: "/ground-transport", icon: Train },
    { name: "Events", href: "/events", icon: Ticket },
    { name: "Travel Insurance", href: "/travel-insurance", icon: Shield },
  ],
  company: [
    { name: "About ZIVO", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Newsroom", href: "#" },
    { name: "Investor Relations", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Sustainability", href: "#" },
  ],
  partners: [
    { name: "Drive with ZIVO", href: "/drive" },
    { name: "Deliver with ZIVO", href: "/drive" },
    { name: "Add Your Restaurant", href: "/restaurant-registration" },
    { name: "List Your Hotel", href: "#" },
    { name: "Business Solutions", href: "/partner-agreement" },
    { name: "Affiliate Program", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Safety Center", href: "/help#safety" },
    { name: "Contact Us", href: "/help#contact" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "Report an Issue", href: "/help#report" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Community Guidelines", href: "/community-guidelines" },
    { name: "Cookie Settings", href: "#" },
    { name: "Partner Agreement", href: "/partner-agreement" },
    { name: "Insurance Policy", href: "/insurance" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
  };

  return (
    <footer className="bg-card/50 border-t border-border relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter Section */}
        <div className="py-8 sm:py-12 lg:py-16 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                Stay in the <span className="text-gradient-rides">loop</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get exclusive deals, travel tips, and updates delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 sm:pl-11 bg-input border-border h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="gap-2 shrink-0 h-11 sm:h-12">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 text-center sm:text-left">
              <Link to="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-rides flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="font-display font-bold text-xl sm:text-2xl text-primary-foreground">Z</span>
                </div>
                <span className="font-display font-bold text-2xl sm:text-3xl text-foreground">ZIVO</span>
              </Link>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto sm:mx-0">
                The all-in-one super app for rides, food, flights, hotels, and more. Go anywhere.
                Get anything. Travel everywhere.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center sm:justify-start">
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Apple className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="text-left">
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-none">Download on the</p>
                    <p className="text-xs sm:text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186a.994.994 0 01-.609-.92V2.734a.99.99 0 01.609-.92zM14.961 13.169l2.652 2.652-9.156 5.211 6.504-7.863zm4.07-2.652l2.4 1.371a.997.997 0 010 1.724l-2.4 1.371L16.84 12l2.192-1.483zM8.457 3.968l9.156 5.211-2.652 2.652-6.504-7.863z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-none">Get it on</p>
                    <p className="text-xs sm:text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Services</h4>
              <ul className="space-y-2.5">
                {footerLinks.services.slice(0, 6).map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Partners</h4>
              <ul className="space-y-2.5">
                {footerLinks.partners.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Support</h4>
              <ul className="space-y-2.5">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ZIVO Technologies Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-border">|</span>
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <MapPin className="w-4 h-4" />
                <span>United States</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rides" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rides" />
              <span>Verified Drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rides" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rides" />
              <span>Insurance Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rides" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

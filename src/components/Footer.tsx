/**
 * Footer - Premium 2026 footer with glassmorphism, better layout, and hover effects
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Plane,
  Hotel,
  CarFront,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const footerLinks = {
  travel: [
    { name: "Flights", href: "/flights", icon: Plane },
    { name: "Hotels", href: "/hotels", icon: Hotel },
    { name: "Car Rental", href: "/rent-car", icon: CarFront },
    { name: "Extras", href: "/extras" },
    { name: "Deals", href: "/deals" },
  ],
  mobility: [
    { name: "Rides", href: "/rides" },
    { name: "Eats", href: "/eats" },
    { name: "Move", href: "/move" },
    { name: "ZIVO Driver", href: "https://zivodriver.com", external: true },
  ],
  p2pRental: [
    { name: "Renter Terms", href: "/terms/renter" },
    { name: "Owner Terms", href: "/terms/owner" },
    { name: "Insurance & Protection", href: "/insurance" },
    { name: "Damage Policy", href: "/damage-policy" },
  ],
  company: [
    { name: "About ZIVO", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Press & Media", href: "/press" },
    { name: "Careers", href: "/careers" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Refund Policy", href: "/refunds" },
    { name: "Cancellation Policy", href: "/cancellation-policy" },
    { name: "Partner Disclosure", href: "/partner-disclosure" },
    { name: "Seller of Travel", href: "/legal/seller-of-travel" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "Do Not Sell My Info", href: "/do-not-sell" },
  ],
};

const contactEmails = [
  { label: "Support", email: "info@hizivo.com" },
  { label: "Payments", email: "payment@hizivo.com" },
  { label: "Business", email: "kimlain@hizivo.com" },
];

const socialLinks = [
  { label: "X (Twitter)", href: "https://x.com/hizovo", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "Instagram", href: "https://instagram.com/hizovo", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { label: "Facebook", href: "https://facebook.com/hizovo", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { label: "LinkedIn", href: "https://linkedin.com/company/hizovo", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
];

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className={cn("relative z-30 bg-gradient-to-b from-card via-card to-background/95 border-t border-border", className)}>
      <div className="container mx-auto px-4">
        {/* Newsletter Section - Enhanced */}
        <div className="py-14 border-b border-border/50">
          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Stay Updated with{" "}
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">ZIVO</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                Get exclusive deals, travel tips, and price alerts delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "h-12 px-6 rounded-xl font-semibold gap-2 transition-all duration-300",
                  subscribed ? "bg-emerald-500 hover:bg-emerald-600" : "glow-green-btn"
                )}
              >
                {subscribed ? (
                  <><CheckCircle2 className="w-5 h-5" /> Done!</>
                ) : (
                  <>Subscribe <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 text-center lg:text-left mb-4 lg:mb-0">
              <Link to="/" className="inline-block mb-4">
                <ZivoLogo size="md" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto lg:mx-0 mb-4">
                ZIVO is an online travel agency. Book flights, hotels, and car rentals with secure checkout and instant confirmation.
              </p>
              
              {/* Business Info Block */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 mb-4 hover:bg-muted/40 transition-colors">
                <p className="text-xs font-medium text-foreground mb-1">Hizovo Travel LLC</p>
                <p className="text-[10px] text-muted-foreground">Online Travel Agency</p>
              </div>
              
              {/* Contact Emails */}
              <div className="space-y-1.5">
                {contactEmails.map((contact) => (
                  <a
                    key={contact.email}
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors justify-center lg:justify-start group"
                  >
                    <Mail className="w-3 h-3 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] text-muted-foreground/70">{contact.label}:</span> {contact.email}
                  </a>
                ))}
              </div>
            </div>

            {/* Travel */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Travel</h4>
              <ul className="space-y-2.5">
                {footerLinks.travel.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
                      {'icon' in link && link.icon && <link.icon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobility */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Mobility</h4>
              <ul className="space-y-2.5">
                {footerLinks.mobility.map((link) => (
                  <li key={link.name}>
                    {'external' in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                        {link.name}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ) : (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* P2P Rental */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">P2P Rental</h4>
              <ul className="space-y-2.5">
                {footerLinks.p2pRental.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Company</h4>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="py-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              © {new Date().getFullYear()} ZIVO LLC. Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for travelers.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {footerLinks.legal.slice(0, 4).map((link) => (
                <Link key={link.name} to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* OTA DISCLOSURE */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center space-y-3">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-semibold">ZIVO is an online travel agency.</p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">ZIVO processes payments and issues travel services using authorized suppliers including Duffel, TravelFusion, and RateHawk.</p>
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto font-medium p-3 rounded-lg bg-primary/5 border border-primary/10">Airline and supplier rules apply to all bookings.</p>
          </div>
          
          {/* Seller of Travel */}
          <div className="text-center space-y-2 mt-4">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-primary" /> ZIVO is registered as a Seller of Travel where required by law.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">California SOT: pending · Florida SOT: pending</p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">Mobility services (Rides, Eats, Move) are provided by independent drivers via ZIVO Driver.</p>
          </div>
          
          {/* Payment Safety */}
          <div className="mt-4 pt-4 border-t border-border/30 text-center space-y-2">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-medium">🔒 Payments are processed securely by ZIVO. Your payment data is encrypted and protected.</p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              For booking issues or refund requests, please{" "}
              <a href="/support" className="text-primary hover:underline">contact ZIVO support</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

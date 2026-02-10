/**
 * Footer - Clean, organized footer with proper IA
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const footerLinks = {
  travel: [
    { name: "Flights", href: "/flights" },
    { name: "Hotels", href: "/hotels" },
    { name: "Car Rental", href: "/rent-car" },
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
    <footer className={cn("relative z-30 bg-card border-t border-border", className)}>
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="text-center lg:text-left">
              <h3 className="text-heading mb-2">Stay Updated</h3>
              <p className="text-muted-foreground text-body">
                Get exclusive deals and travel tips delivered to your inbox.
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
                  className="pl-12 h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className={cn(
                  "h-12 px-6 rounded-xl font-semibold gap-2",
                  subscribed && "bg-success"
                )}
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Done!
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
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

              {/* Social Media Links */}
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                {[
                  { name: "X", href: "https://x.com/hizovo", label: "𝕏" },
                  { name: "Instagram", href: "https://instagram.com/hizovo", label: "📷" },
                  { name: "LinkedIn", href: "https://linkedin.com/company/hizovo", label: "in" },
                  { name: "YouTube", href: "https://youtube.com/@hizovo", label: "▶" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border/50 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-all"
                    aria-label={social.name}
                  >
                    {social.label}
                  </a>
                ))}
              </div>

              {/* App Store Badges */}
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <div className="px-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg text-[10px] text-muted-foreground font-medium">
                  📱 App Store — Soon
                </div>
                <div className="px-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg text-[10px] text-muted-foreground font-medium">
                  🤖 Google Play — Soon
                </div>
              </div>
              
              {/* Business Info Block */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 mb-4">
                <p className="text-xs font-medium text-foreground mb-1">Hizovo Travel LLC</p>
                <p className="text-[10px] text-muted-foreground">Online Travel Agency</p>
              </div>
              
              {/* Contact Emails */}
              <div className="space-y-1">
                {contactEmails.map((contact) => (
                  <a
                    key={contact.email}
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors justify-center lg:justify-start"
                  >
                    <Mail className="w-3 h-3" />
                    <span className="text-[10px]">{contact.label}:</span> {contact.email}
                  </a>
                ))}
              </div>
            </div>

            {/* Travel */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Travel</h4>
              <ul className="space-y-2.5">
                {footerLinks.travel.map((link) => (
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

            {/* Mobility */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Mobility</h4>
              <ul className="space-y-2.5">
                {footerLinks.mobility.map((link) => (
                  <li key={link.name}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {link.name}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* P2P Rental */}
            <div>
              <h4 className="font-semibold text-sm mb-4">P2P Rental</h4>
              <ul className="space-y-2.5">
                {footerLinks.p2pRental.map((link) => (
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

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
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

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
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

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ZIVO LLC. All rights reserved.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* OTA DISCLOSURE - Required for travel agency compliance */}
          <div className="mt-6 pt-4 border-t border-border/50 text-center space-y-3">
            {/* REQUIRED EXACT COPY - Do not modify */}
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-semibold">
              ZIVO is an online travel agency.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              ZIVO processes payments and issues travel services using authorized suppliers including Duffel, TravelFusion, and RateHawk.
            </p>
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto font-medium p-3 rounded-lg bg-primary/5 border border-primary/10">
              Airline and supplier rules apply to all bookings.
            </p>
          </div>
          
          {/* Seller of Travel & Legal Disclosure */}
          <div className="text-center space-y-2 mt-4">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ZIVO is registered as a Seller of Travel where required by law.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              California SOT: pending · Florida SOT: pending
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Mobility services (Rides, Eats, Move) are provided by independent drivers via ZIVO Driver.
            </p>
          </div>
          
          {/* PAYMENT & DATA SAFETY - Required for OTA compliance */}
          <div className="mt-4 pt-4 border-t border-border/30 text-center space-y-2">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto font-medium">
              🔒 Payments are processed securely by ZIVO. Your payment data is encrypted and protected.
            </p>
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

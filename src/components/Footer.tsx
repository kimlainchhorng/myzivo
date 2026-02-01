import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Plane,
  Hotel,
  CarFront,
  Car,
  UtensilsCrossed,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ZivoLogo from "./ZivoLogo";

const footerLinks = {
  travel: [
    { name: "Flights", href: "/book-flight" },
    { name: "Hotels", href: "/book-hotel" },
    { name: "Car Rental", href: "/rent-car" },
    { name: "Things to Do", href: "/things-to-do" },
  ],
  services: [
    { name: "ZIVO Rides", href: "/rides" },
    { name: "ZIVO Eats", href: "/eats" },
    { name: "Travel Insurance", href: "/travel-insurance" },
    { name: "Airport Transfers", href: "/airport-transfer" },
  ],
  company: [
    { name: "About ZIVO", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Partners", href: "/partners" },
    { name: "Contact Us", href: "/contact" },
    { name: "Become a Driver", href: "https://zivodriver.com", external: true },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Safety Center", href: "/help#safety" },
    { name: "Accessibility", href: "/accessibility" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  ],
};

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
    <footer className="bg-muted/30 border-t border-border">
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 text-center lg:text-left mb-4 lg:mb-0">
              <Link to="/" className="inline-block mb-4">
                <ZivoLogo size="md" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto lg:mx-0">
                Search & compare flights, hotels, and car rentals from trusted partners.
              </p>
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

            {/* Services */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2.5">
                {footerLinks.services.map((link) => (
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
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
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

            {/* Support */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Support</h4>
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
          
          {/* Affiliate Disclosure */}
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              ZIVO is a travel search engine. We may earn a commission when you book through our partner links. 
              Prices are provided by our partners and may vary. Your booking is made directly with the travel provider.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Car, UtensilsCrossed, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Blog", href: "#" },
  ],
  products: [
    { name: "Rides", href: "#rides" },
    { name: "Eats", href: "#eats" },
    { name: "Business", href: "#business" },
    { name: "Freight", href: "#" },
  ],
  drive: [
    { name: "Become a driver", href: "#driver" },
    { name: "Deliver with ZIVO", href: "#" },
    { name: "Driver requirements", href: "#" },
    { name: "Driver app", href: "#" },
  ],
  support: [
    { name: "Help center", href: "/help" },
    { name: "Safety", href: "/help#safety" },
    { name: "Terms of service", href: "/terms-of-service" },
    { name: "Privacy policy", href: "/privacy-policy" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
                <span className="font-display font-bold text-xl text-primary-foreground">Z</span>
              </div>
              <span className="font-display font-bold text-2xl text-foreground">ZIVO</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Go anywhere. Get anything. The all-in-one platform for rides and food delivery.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Drive */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Drive</h4>
            <ul className="space-y-3">
              {footerLinks.drive.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 ZIVO Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>🇺🇸 United States</span>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">English</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

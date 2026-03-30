/**
 * App More Screen — Premium 2026
 * Travel Extras, Support, Legal sections with glassmorphism
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Car, Ticket, Smartphone, Briefcase, Scale, HelpCircle, 
  Mail, FileText, Shield, Users, ChevronRight, LogOut, User,
  Award, ExternalLink, Crown, Star
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Travel Extras
const travelExtras = [
  { id: "transfers", name: "Airport Transfers", icon: Car, description: "KiwiTaxi, GetTransfer", color: "text-sky-500", bg: "bg-gradient-to-br from-sky-500/15 to-sky-500/5", borderColor: "border-sky-500/10" },
  { id: "activities", name: "Activities & Tours", icon: Ticket, description: "Klook, Tiqets, WeGoTrip", color: "text-pink-500", bg: "bg-gradient-to-br from-pink-500/15 to-pink-500/5", borderColor: "border-pink-500/10" },
  { id: "esim", name: "Travel eSIM", icon: Smartphone, description: "Airalo, Yesim, Drimsim", color: "text-violet-500", bg: "bg-gradient-to-br from-violet-500/15 to-violet-500/5", borderColor: "border-violet-500/10" },
  { id: "luggage", name: "Luggage Storage", icon: Briefcase, description: "Radical Storage", color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/15 to-amber-500/5", borderColor: "border-amber-500/10" },
  { id: "compensation", name: "Flight Comp.", icon: Scale, description: "AirHelp, Compensair", color: "text-emerald-500", bg: "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5", borderColor: "border-emerald-500/10" },
];

const supportItems = [
  { id: "help", name: "Help Center", icon: HelpCircle, href: "/help", desc: "Browse FAQs & guides" },
  { id: "contact", name: "Contact Us", icon: Mail, href: "/contact", desc: "Get in touch" },
  { id: "how", name: "How It Works", icon: Award, href: "/how-it-works", desc: "Learn about ZIVO" },
  { id: "partners", name: "Partners", icon: Users, href: "/partners", desc: "Our trusted partners" },
  { id: "creators", name: "Creator Program", icon: Crown, href: "/creators", desc: "Earn with ZIVO" },
];

const legalItems = [
  { id: "privacy", name: "Privacy Policy", href: "/privacy" },
  { id: "terms", name: "Terms of Service", href: "/terms" },
  { id: "affiliate", name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { id: "partner-disc", name: "Partner Disclosure", href: "/partner-disclosure" },
];

const contactEmails = [
  { label: "General", email: "info@hizivo.com" },
  { label: "Payments", email: "payment@hizivo.com" },
  { label: "Support", email: "kimlain@hizivo.com" },
];

const AppMore = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <AppLayout title="More">
      <div className="p-4 space-y-6">
        {/* User Account Section */}
        {user ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-primary/8 border border-primary/15 flex items-center gap-3 shadow-sm">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold touch-manipulation active:scale-95 transition-transform"
              >
                Edit
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5 rounded-2xl bg-card border border-border/40 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-bold">Sign in to ZIVO</p>
                <p className="text-xs text-muted-foreground">Save your preferences</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 touch-manipulation active:scale-95 transition-transform"
              >
                Sign In
              </button>
            </div>
          </motion.section>
        )}

        {/* Travel Extras */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-primary" />
            </div>
            Travel Extras
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {travelExtras.map((extra, i) => (
              <motion.button
                key={extra.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                onClick={() => navigate('/extras')}
                className={cn(
                  "p-4 rounded-2xl border text-left touch-manipulation active:scale-[0.97] transition-all duration-200 hover:shadow-md",
                  extra.bg, extra.borderColor
                )}
              >
                <div className={cn("w-11 h-11 rounded-xl bg-card/60 backdrop-blur-sm flex items-center justify-center mb-2.5 shadow-sm")}>
                  <extra.icon className={cn("w-5 h-5", extra.color)} />
                </div>
                <h3 className="font-bold text-xs">{extra.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{extra.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
            </div>
            Support
          </h2>
          <div className="space-y-1.5">
            {supportItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 text-left touch-manipulation active:scale-[0.99] transition-all hover:border-primary/15 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm block">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Contact Emails */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-primary" />
            </div>
            Contact Us
          </h2>
          <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3">
            {contactEmails.map((contact) => (
              <div key={contact.email} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs font-medium">{contact.label}</span>
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-primary font-bold text-xs hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Legal */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary" />
            </div>
            Legal
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {legalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className="p-3.5 rounded-2xl bg-card border border-border/40 text-left touch-manipulation active:scale-[0.97] transition-all hover:border-primary/15"
              >
                <span className="text-xs font-bold">{item.name}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Sign Out */}
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pb-4"
          >
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-destructive/20 text-destructive font-bold touch-manipulation active:scale-[0.98] transition-all hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.section>
        )}

        {/* App Version */}
        <div className="text-center text-[10px] text-muted-foreground/50 pb-4 space-y-0.5">
          <p className="font-bold"><p className="font-bold">ZIVO v1.0.4</p></p>
          <p>© 2026 ZIVO. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppMore;

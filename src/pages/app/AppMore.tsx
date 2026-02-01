/**
 * App More Screen
 * Travel Extras, Support, Legal sections
 */
import { useNavigate } from "react-router-dom";
import { 
  Plane, Car, Ticket, Smartphone, Briefcase, Scale, HelpCircle, 
  Mail, FileText, Shield, Users, ChevronRight, LogOut, User,
  ExternalLink, Building2, Award
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Travel Extras
const travelExtras = [
  { id: "transfers", name: "Airport Transfers", icon: Car, description: "KiwiTaxi, GetTransfer, Intui", color: "text-blue-400", bg: "bg-blue-500/15" },
  { id: "activities", name: "Activities & Tours", icon: Ticket, description: "Klook, Tiqets, WeGoTrip", color: "text-pink-400", bg: "bg-pink-500/15" },
  { id: "esim", name: "Travel eSIM", icon: Smartphone, description: "Airalo, Yesim, Drimsim", color: "text-violet-400", bg: "bg-violet-500/15" },
  { id: "luggage", name: "Luggage Storage", icon: Briefcase, description: "Radical Storage", color: "text-amber-400", bg: "bg-amber-500/15" },
  { id: "compensation", name: "Flight Compensation", icon: Scale, description: "AirHelp, Compensair", color: "text-green-400", bg: "bg-green-500/15" },
];

// Support items
const supportItems = [
  { id: "help", name: "Help Center", icon: HelpCircle, href: "/help" },
  { id: "contact", name: "Contact Us", icon: Mail, href: "/contact" },
  { id: "how", name: "How It Works", icon: Award, href: "/how-it-works" },
  { id: "partners", name: "Partners", icon: Users, href: "/partners" },
  { id: "creators", name: "Creator Program", icon: Award, href: "/creators" },
];

// Legal items
const legalItems = [
  { id: "privacy", name: "Privacy Policy", href: "/privacy" },
  { id: "terms", name: "Terms of Service", href: "/terms" },
  { id: "affiliate", name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
];

// Contact emails
const contactEmails = [
  { label: "General", email: "info@hizivo.com" },
  { label: "Payments", email: "payment@hizivo.com" },
  { label: "Support", email: "kimlain@hizivo.com" },
];

const AppMore = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleExtraClick = (id: string) => {
    navigate('/extras');
  };

  return (
    <AppLayout title="More">
      <div className="p-4 space-y-6">
        {/* User Account Section */}
        {user ? (
          <section className="animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-teal-500/5 border border-primary/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="text-sm text-primary font-medium"
              >
                Edit
              </button>
            </div>
          </section>
        ) : (
          <section className="animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between">
              <div>
                <p className="font-bold">Sign in to ZIVO</p>
                <p className="text-sm text-muted-foreground">Save your preferences</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
              >
                Sign In
              </button>
            </div>
          </section>
        )}

        {/* Travel Extras */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-200 delay-100">
          <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            Travel Extras
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {travelExtras.map((extra) => (
              <button
                key={extra.id}
                onClick={() => handleExtraClick(extra.id)}
                className="p-3 rounded-xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.98] transition-transform hover:border-primary/30"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", extra.bg)}>
                  <extra.icon className={cn("w-5 h-5", extra.color)} />
                </div>
                <h3 className="font-semibold text-sm">{extra.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{extra.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-200 delay-200">
          <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Support
          </h2>
          <div className="space-y-1">
            {supportItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.99] transition-transform"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 font-medium text-sm">{item.name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        {/* Contact Emails */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-200 delay-300">
          <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Contact Us
          </h2>
          <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            {contactEmails.map((contact) => (
              <div key={contact.email} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{contact.label}:</span>
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-primary font-medium"
                >
                  {contact.email}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Legal */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-200 delay-400">
          <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Legal
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {legalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                className="p-3 rounded-xl bg-card border border-border/50 text-left touch-manipulation active:scale-[0.98] transition-transform"
              >
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        {user && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-200 delay-500 pb-4">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-destructive/30 text-destructive font-medium touch-manipulation active:scale-[0.99] transition-transform"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </section>
        )}

        {/* App Version */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          <p>ZIVO v1.0.0</p>
          <p>© 2025 ZIVO. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AppMore;

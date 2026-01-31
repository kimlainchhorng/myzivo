import { FileText, Globe, AlertTriangle, CheckCircle2, Clock, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularDestinations = [
  {
    country: "Japan",
    flag: "🇯🇵",
    visaRequired: true,
    visaType: "Tourist Visa (eVisa)",
    processingTime: "3-5 business days",
    validity: "90 days",
    requirements: ["Valid passport (6+ months)", "Return ticket", "Proof of accommodation", "Financial means"],
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    visaRequired: true,
    visaType: "Standard Visitor Visa",
    processingTime: "15 working days",
    validity: "6 months",
    requirements: ["Valid passport", "Bank statements", "Travel itinerary", "Employment letter"],
  },
  {
    country: "Mexico",
    flag: "🇲🇽",
    visaRequired: false,
    visaType: "Visa-free entry",
    processingTime: "N/A",
    validity: "180 days",
    requirements: ["Valid passport", "Return ticket", "Tourist card (FMM)"],
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    visaRequired: true,
    visaType: "eVisitor Visa",
    processingTime: "1-2 business days",
    validity: "12 months (90 days per visit)",
    requirements: ["Valid passport", "No criminal record", "Health insurance recommended"],
  },
];

const FlightVisaInfo = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Travel Documents
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Visa <span className="text-primary">Information</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Check visa requirements for your destination before you travel
            </p>
          </div>

          {/* Destination Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {popularDestinations.map((dest, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{dest.flag}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{dest.country}</h3>
                      <p className="text-sm text-muted-foreground">{dest.visaType}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dest.visaRequired
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {dest.visaRequired ? "Visa Required" : "Visa Free"}
                  </span>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Processing: {dest.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Valid: {dest.validity}</span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Requirements</p>
                  <div className="space-y-1">
                    {dest.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visa Service Promo */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Need Help with Your Visa?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our visa concierge service handles the entire application process for you
                  </p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <span>Start Application</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p>
              Visa requirements can change. Always verify current requirements with the official embassy 
              or consulate of your destination country before traveling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightVisaInfo;

import { User, CreditCard, FileText, Globe, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const requirements = [
  {
    icon: User,
    title: "Age Requirements",
    items: [
      { text: "Minimum age: 21 years old", status: "required" },
      { text: "Under 25: Young driver fee may apply", status: "note" },
      { text: "Maximum age: Typically 75 (varies by location)", status: "note" },
    ],
  },
  {
    icon: FileText,
    title: "Driver's License",
    items: [
      { text: "Valid driver's license required", status: "required" },
      { text: "License held for at least 1 year", status: "required" },
      { text: "International Driving Permit for non-English licenses", status: "note" },
    ],
  },
  {
    icon: CreditCard,
    title: "Payment & Deposit",
    items: [
      { text: "Credit card in driver's name", status: "required" },
      { text: "Debit cards: Limited acceptance, higher deposit", status: "note" },
      { text: "Security deposit: $200-500 (refundable)", status: "required" },
    ],
  },
  {
    icon: Globe,
    title: "International Renters",
    items: [
      { text: "Valid passport required", status: "required" },
      { text: "International Driving Permit (IDP) recommended", status: "note" },
      { text: "License in Latin alphabet or official translation", status: "required" },
    ],
  },
];

const CarDriverRequirements = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Requirements</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Driver Requirements
          </h2>
          <p className="text-muted-foreground">What you need to rent a car</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {requirements.map((req, index) => {
            const Icon = req.icon;
            return (
              <div
                key={req.title}
                className={cn(
                  "p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg">{req.title}</h3>
                </div>

                <div className="space-y-3">
                  {req.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.status === "required" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold">Good to Know</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Additional drivers can be added at pickup. Each must meet the same requirements and present their license.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold">Save Time</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload your documents in advance through our app to speed up the pickup process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarDriverRequirements;

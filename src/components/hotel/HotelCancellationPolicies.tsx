import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, RefreshCw } from "lucide-react";

const policies = [
  {
    type: "free",
    title: "Free Cancellation",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Cancel up to 24 hours before check-in for a full refund",
    terms: [
      "Full refund if cancelled 24h+ before check-in",
      "No questions asked",
      "Instant refund to original payment method",
    ],
    badge: "Most Flexible",
  },
  {
    type: "partial",
    title: "Partial Refund",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Get 50% back when cancelling up to 48 hours before",
    terms: [
      "50% refund if cancelled 48h+ before check-in",
      "First night charged if cancelled within 48h",
      "Refund within 5-10 business days",
    ],
    badge: "Moderate",
  },
  {
    type: "non",
    title: "Non-Refundable",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Best price but no refund available after booking",
    terms: [
      "No refund for cancellation",
      "Dates can be modified for a fee",
      "Travel insurance recommended",
    ],
    badge: "Best Price",
  },
];

const HotelCancellationPolicies = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Booking Protection
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Cancellation <span className="text-primary">Policies</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We offer flexible options to give you peace of mind when booking
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {policies.map((policy, index) => {
              const Icon = policy.icon;
              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl bg-card/50 border ${policy.borderColor} hover:scale-[1.02] transition-transform`}
                >
                  {/* Badge */}
                  <span className={`absolute -top-3 right-4 px-3 py-1 rounded-full ${policy.bgColor} ${policy.color} text-xs font-bold`}>
                    {policy.badge}
                  </span>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${policy.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${policy.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">{policy.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>
                  
                  {/* Terms */}
                  <div className="space-y-2">
                    {policy.terms.map((term, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${policy.color} flex-shrink-0 mt-0.5`} />
                        <span className="text-muted-foreground">{term}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-10 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Processing Time</h4>
                  <p className="text-sm text-muted-foreground">
                    Refunds are typically processed within 5-10 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Date Changes</h4>
                  <p className="text-sm text-muted-foreground">
                    Modify dates up to 24 hours before check-in (subject to availability)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Rebooking Credit</h4>
                  <p className="text-sm text-muted-foreground">
                    Non-refundable bookings can be converted to travel credit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelCancellationPolicies;

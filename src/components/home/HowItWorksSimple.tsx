import { Search, GitCompare, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Search & compare prices",
    description: "Enter your travel details and compare options from 500+ airlines",
    icon: Search,
    color: "from-sky-500 to-blue-600",
  },
  {
    step: 2,
    title: "Choose the best option",
    description: "Review prices, times, baggage, and select your preferred deal",
    icon: GitCompare,
    color: "from-violet-500 to-purple-600",
  },
  {
    step: 3,
    title: "Complete booking securely",
    description: "Book securely with our licensed travel partners",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
  },
];

export default function HowItWorksSimple() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            How ZIVO Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Finding cheap flights is easy with our simple 3-step process
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-10">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center group"
            >
              {/* Connection Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden sm:flex absolute top-10 left-[60%] w-full items-center">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-border to-border/30" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 -ml-1" />
                </div>
              )}

              {/* Step Circle */}
              <div className={cn(
                "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative",
                "bg-gradient-to-br shadow-lg",
                step.color
              )}>
                <step.icon className="w-8 h-8 text-white" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary text-primary text-sm font-bold flex items-center justify-center shadow-md">
                  {step.step}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Reassurance Text */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            We connect you to licensed partners for secure checkout
          </div>
        </div>
      </div>
    </section>
  );
}

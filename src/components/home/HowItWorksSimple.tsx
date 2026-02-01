import { Search, GitCompare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Search or Request",
    description: "Enter your travel details or request a ride/food delivery",
    icon: Search,
  },
  {
    step: 2,
    title: "Compare Options",
    description: "See prices from multiple partners side by side",
    icon: GitCompare,
  },
  {
    step: 3,
    title: "Book or Confirm",
    description: "Complete on partner site (travel) or confirm with ZIVO (rides/eats)",
    icon: ExternalLink,
  },
];

export default function HowItWorksSimple() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">
          How It Works
        </h2>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center"
            >
              {/* Connection Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[60%] right-0 h-px bg-border" />
              )}

              {/* Step Circle */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4 relative">
                <step.icon className="w-6 h-6 text-primary" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>

              <h3 className="font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <p className="text-xs text-muted-foreground text-center max-w-lg mx-auto">
          ZIVO may earn a commission when users book through partner links.
        </p>
      </div>
    </section>
  );
}

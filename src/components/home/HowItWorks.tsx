import { MapPin, Search, Car, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Set Location",
    description: "Enter your pickup location or let us detect it automatically",
    icon: MapPin,
    gradient: "from-primary to-teal-400",
    glow: "shadow-primary/30",
  },
  {
    step: 2,
    title: "Choose Service",
    description: "Select from rides, food delivery, flights, hotels, and more",
    icon: Search,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/30",
  },
  {
    step: 3,
    title: "Book & Track",
    description: "Confirm your booking and track everything in real-time",
    icon: Car,
    gradient: "from-sky-500 to-blue-500",
    glow: "shadow-sky-500/30",
  },
  {
    step: 4,
    title: "Enjoy & Rate",
    description: "Complete your trip and share your experience",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/30",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-24 xl:py-32 relative overflow-hidden bg-gradient-to-b from-muted/30 via-muted/10 to-background">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-gradient-radial from-primary/12 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-primary/12 to-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-tl from-violet-500/12 to-purple-500/8 rounded-full blur-3xl" />

      {/* Floating emojis - CSS animated */}
      <div className="absolute top-40 left-[8%] text-4xl sm:text-5xl hidden md:block opacity-40 animate-bounce" style={{ animationDuration: '5s' }}>
        📍
      </div>
      <div className="absolute bottom-32 right-[10%] text-3xl sm:text-4xl hidden md:block opacity-35 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
        ✅
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-teal-400/15 border border-primary/25 text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg shadow-primary/10">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-muted-foreground">Simple Process</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
            How it{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get started in just a few <span className="text-foreground font-medium">simple steps</span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 relative">
          {/* Connection Line (desktop only) */}
          <div className="hidden lg:block absolute top-20 left-[15%] right-[15%] h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 via-sky-500 to-emerald-500 opacity-20 rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 via-sky-500 to-emerald-500 opacity-60 rounded-full origin-left animate-in slide-in-from-left duration-1000" style={{ animationDelay: '500ms' }} />
          </div>
          
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group animate-in fade-in slide-in-from-bottom-6 duration-500"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            >
              <div className="p-4 sm:p-5 lg:p-7 xl:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 text-center h-full overflow-hidden hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                {/* Background glow on hover */}
                <div className={cn(
                  "absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                  step.gradient
                )} />
                
                {/* Step Number Badge */}
                <div className="relative mb-4 sm:mb-6 animate-in zoom-in duration-300" style={{ animationDelay: `${300 + index * 100}ms` }}>
                  <div className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg sm:shadow-xl relative overflow-hidden transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3",
                    step.gradient,
                    step.glow
                  )}>
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 text-white relative z-10" />
                  </div>
                  <span className={cn(
                    "absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg transition-transform duration-200 hover:scale-110",
                    step.gradient
                  )}>
                    {step.step}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-[11px] sm:text-xs lg:text-sm xl:text-base leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

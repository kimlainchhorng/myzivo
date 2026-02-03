/**
 * How Booking Works Section
 * Trust-building component explaining the partner checkout flow
 */

import { Search, MousePointerClick, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowBookingWorksProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
}

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Search & compare flights",
    description: "Compare options from 500+ airlines",
  },
  {
    icon: MousePointerClick,
    number: "2",
    title: "Choose the best option",
    description: "Select the best deal for your travel needs",
  },
  {
    icon: ShieldCheck,
    number: "3",
    title: "Book directly on ZIVO",
    description: "Pay securely and receive your e-ticket instantly",
  },
];

export default function HowBookingWorks({ className, variant = 'horizontal' }: HowBookingWorksProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("py-4", className)}>
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center text-xs font-bold">
                  {step.number}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="font-semibold text-base mb-4">How booking works</h3>
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <step.icon className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex-1 pt-1">
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn("py-8 bg-muted/20 border-y border-border/50", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-center text-lg font-semibold mb-6">How booking works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Step number */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-sky-500" />
              </div>
              
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-sky-500/30 to-sky-500/10" />
              )}
              
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

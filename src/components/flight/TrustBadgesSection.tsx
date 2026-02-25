import { Shield, Globe, Clock, Users, CheckCircle, Award, Lock, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesSectionProps {
  className?: string;
  variant?: 'compact' | 'full';
}

const trustBadges = [
  {
    icon: Globe,
    title: '500+ Airlines',
    description: 'Global coverage',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  {
    icon: Clock,
    title: 'Real-Time Prices',
    description: 'Live fare data',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Secure Redirect',
    description: 'Encrypted transfers',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: '1M+ Travelers',
    description: 'Trusted by many',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

const partnerLogos = [
  { name: 'Skyscanner', logo: '🔍' },
  { name: 'Kayak', logo: '🛫' },
  { name: 'Momondo', logo: '✈️' },
  { name: 'Kiwi.com', logo: '🥝' },
  { name: 'Trip.com', logo: '🌏' },
  { name: 'Cheapflights', logo: '💰' },
];

const testimonials = [
  {
    quote: "Found a great deal to Paris! The comparison made it so easy.",
    author: "Sarah M.",
    location: "New York",
    rating: 5,
  },
  {
    quote: "Love how ZIVO shows prices from multiple partners at once.",
    author: "James L.",
    location: "Los Angeles",
    rating: 5,
  },
  {
    quote: "Saved $200 on my Tokyo flight by comparing options here.",
    author: "Emily R.",
    location: "Chicago",
    rating: 5,
  },
];

export default function TrustBadgesSection({ 
  className,
  variant = 'full',
}: TrustBadgesSectionProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-3 sm:py-4", className)}>
        {trustBadges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-1.5 sm:gap-2">
            <badge.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", badge.color)} />
            <span className="text-xs sm:text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn("py-8 sm:py-12 border-t border-border/50", className)}>
      <div className="container mx-auto px-3 sm:px-4">
        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {trustBadges.map((badge) => (
            <div 
              key={badge.title}
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/50 text-center hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center",
                badge.bgColor
              )}>
                <badge.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", badge.color)} />
              </div>
              <h4 className="font-semibold text-sm sm:text-base">{badge.title}</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Compare prices from trusted travel partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {partnerLogos.map((partner) => (
              <div 
                key={partner.name}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/30 border border-border/50"
              >
                <span className="text-sm sm:text-lg">{partner.logo}</span>
                <span className="text-[10px] sm:text-sm font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center font-display text-lg sm:text-xl font-bold mb-4 sm:mb-6">
            What Travelers Say
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm sm:text-base">★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm mb-2 sm:mb-3 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">{testimonial.author}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Verified Partners</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Price Comparison</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

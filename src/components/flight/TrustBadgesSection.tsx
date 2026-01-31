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
      <div className={cn("flex flex-wrap items-center justify-center gap-4 py-4", className)}>
        {trustBadges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-2">
            <badge.icon className={cn("w-4 h-4", badge.color)} />
            <span className="text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn("py-12 border-t border-border/50", className)}>
      <div className="container mx-auto px-4">
        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustBadges.map((badge) => (
            <div 
              key={badge.title}
              className="p-4 rounded-2xl bg-card border border-border/50 text-center"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                badge.bgColor
              )}>
                <badge.icon className={cn("w-6 h-6", badge.color)} />
              </div>
              <h4 className="font-semibold">{badge.title}</h4>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground mb-6">
            Compare prices from trusted travel partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {partnerLogos.map((partner) => (
              <div 
                key={partner.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50"
              >
                <span className="text-lg">{partner.logo}</span>
                <span className="text-sm font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center font-display text-xl font-bold mb-6">
            What Travelers Say
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-sm mb-3 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Verified Partners</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="text-sm">Price Comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

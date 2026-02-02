/**
 * Car Rental Checkout Page
 * Embedded partner checkout with security messaging
 */

import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, CheckCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { RampGlobalDisclaimer } from "@/components/results";

export default function CarCheckoutPage() {
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category") || "Economy";
  const name = searchParams.get("name") || "";

  // For now, redirect to partner site
  const handleProceedToPartner = () => {
    // This would be replaced with actual partner checkout URL
    const partnerUrl = `https://www.economybookings.com/en?${searchParams.toString()}`;
    window.open(partnerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Secure Checkout | Car Rental | ZIVO"
        description="Complete your car rental booking securely with our licensed travel partner."
      />
      
      {/* Locked Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-bold text-xl text-primary">ZIVO</Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>SSL Encrypted</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <Link 
            to={`/rent-car/traveler-info?${searchParams.toString()}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to traveler info
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="flex-1 h-px bg-primary" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Traveler Info</span>
            </div>
            <div className="flex-1 h-px bg-primary" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>

          {/* Security Message */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground mb-1">
                  Secure Partner Checkout
                </h2>
                <p className="text-sm text-muted-foreground">
                  Payment is processed by our licensed travel partner. Your card information is encrypted and never stored by ZIVO.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Card */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">
            {/* Partner iframe placeholder */}
            <div className="bg-muted/30 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Partner Checkout</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md">
                You'll be redirected to our partner's secure checkout to complete your {category} car rental booking.
              </p>
              {name && (
                <p className="text-sm text-muted-foreground mb-4">
                  Booking for: <span className="font-medium text-foreground">{name}</span>
                </p>
              )}
              <Button 
                onClick={handleProceedToPartner}
                size="lg"
                className="gap-2 font-medium"
              >
                Continue to Partner Checkout
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground text-center">
                By proceeding, you agree to the partner's terms of service and privacy policy. 
                Final price will be confirmed before payment.
              </p>
            </div>
          </div>

          <RampGlobalDisclaimer className="mt-6" />
        </div>
      </main>
    </div>
  );
}

/**
 * Merchant Reviews Page
 * Route: /merchant/reviews
 */
import { Link } from "react-router-dom";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMerchantRole } from "@/hooks/useMerchantRole";
import { MerchantReviewDashboard } from "@/components/merchant/MerchantReviewDashboard";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";

export default function MerchantReviewsPage() {
  const { data: merchantRole, isLoading } = useMerchantRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!merchantRole?.isMerchant || !merchantRole.restaurantId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be a restaurant owner to access this page.</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Reviews Dashboard | ZIVO" description="View and respond to customer reviews" />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
              <p className="text-sm text-muted-foreground">See customer feedback and respond to reviews</p>
            </div>
          </div>

          <MerchantReviewDashboard restaurantId={merchantRole.restaurantId} />
        </div>
      </main>
    </div>
  );
}

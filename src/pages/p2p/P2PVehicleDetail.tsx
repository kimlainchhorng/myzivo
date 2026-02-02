/**
 * P2P Vehicle Detail Page
 * View vehicle details and book from owner
 */

import { useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Star, MapPin, Users, Settings2, Fuel, Calendar, Shield, 
  CheckCircle, MessageCircle, ChevronLeft, ChevronRight, Zap,
  Car, Clock, Award, Heart
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useP2PVehicleDetail, useBookingPricing, useVehicleReviews, useCreateBooking } from "@/hooks/useP2PBooking";
import { toast } from "sonner";

export default function P2PVehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pickupDate = searchParams.get("pickup_date") || "";
  const returnDate = searchParams.get("return_date") || "";

  const { data: vehicle, isLoading } = useP2PVehicleDetail(id);
  const { data: pricing } = useBookingPricing(id, pickupDate, returnDate);
  const { data: reviews } = useVehicleReviews(id);
  const createBooking = useCreateBooking();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const [insuranceAccepted, setInsuranceAccepted] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const images = (vehicle?.images as string[]) || [];

  const handleBook = async () => {
    if (!user) {
      toast.error("Please log in to book");
      navigate(`/login?redirect=/p2p/vehicle/${id}?${searchParams.toString()}`);
      return;
    }

    if (!pickupDate || !returnDate) {
      toast.error("Please select dates");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        vehicleId: id!,
        pickupDate,
        returnDate,
        notes,
        insuranceAccepted,
        termsAccepted,
      });
      navigate(`/p2p/booking/${booking.id}/confirmation`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This vehicle may no longer be available
            </p>
            <Button asChild>
              <Link to="/p2p/search">Browse Vehicles</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const features = (vehicle.features as string[]) || [];
  const totalDays = pickupDate && returnDate 
    ? differenceInDays(parseISO(returnDate), parseISO(pickupDate))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Rent from Owner | ZIVO`}
        description={`Rent this ${vehicle.year} ${vehicle.make} ${vehicle.model} directly from the owner. $${vehicle.daily_rate}/day. Located in ${vehicle.location_city}, ${vehicle.location_state}.`}
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Image Gallery */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-muted">
            {images.length > 0 ? (
              <>
                <div className="aspect-video md:aspect-[21/9] relative">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) =>
                          i === 0 ? images.length - 1 : i - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) =>
                          i === images.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={cn(
                            "w-2 h-2 rounded-full transition",
                            i === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <Car className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Quick Info */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                      {vehicle.trim && ` ${vehicle.trim}`}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vehicle.location_city}, {vehicle.location_state}
                      </div>
                      {vehicle.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">
                            {vehicle.rating.toFixed(1)}
                          </span>
                          <span>({vehicle.total_trips || 0} trips)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {vehicle.instant_book && (
                    <Badge className="bg-emerald-500 text-white gap-1">
                      <Zap className="w-3 h-3" />
                      Instant Book
                    </Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {vehicle.category}
                  </Badge>
                  {vehicle.fuel_type === "electric" && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Electric
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {vehicle.seats && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-medium">{vehicle.seats}</p>
                    </div>
                  </div>
                )}
                {vehicle.doors && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Car className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Doors</p>
                      <p className="font-medium">{vehicle.doors}</p>
                    </div>
                  </div>
                )}
                {vehicle.transmission && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Settings2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-medium capitalize">{vehicle.transmission}</p>
                    </div>
                  </div>
                )}
                {vehicle.fuel_type && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Fuel className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel</p>
                      <p className="font-medium capitalize">{vehicle.fuel_type}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">About this car</h2>
                  <p className="text-muted-foreground">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Owner */}
              {vehicle.owner && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Hosted by</h2>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-lg">
                        {vehicle.owner.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{vehicle.owner.full_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {vehicle.owner.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {vehicle.owner.rating.toFixed(1)}
                          </div>
                        )}
                        {vehicle.owner.total_trips && (
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {vehicle.owner.total_trips} trips
                          </div>
                        )}
                        {vehicle.owner.response_rate && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {vehicle.owner.response_rate}% response
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < (review.rating || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(parseISO(review.created_at!), "MMM d, yyyy")}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">{review.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      <span className="text-2xl">${vehicle.daily_rate}</span>
                      <span className="text-muted-foreground font-normal">/day</span>
                    </span>
                    {vehicle.instant_book && (
                      <Badge className="bg-emerald-500 text-white gap-1">
                        <Zap className="w-3 h-3" />
                        Instant
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trip Summary */}
                  {pickupDate && returnDate ? (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pick-up</span>
                        <span className="font-medium">
                          {format(parseISO(pickupDate), "EEE, MMM d")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Return</span>
                        <span className="font-medium">
                          {format(parseISO(returnDate), "EEE, MMM d")}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Trip length</span>
                        <span>{totalDays} day{totalDays !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed text-center">
                      <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Select dates to see pricing
                      </p>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  {pricing && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>
                          ${pricing.dailyRate.toFixed(0)} × {pricing.totalDays} days
                        </span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Service fee</span>
                        <span>${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      {insuranceAccepted && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Insurance</span>
                          <span>${pricing.insuranceFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxes</span>
                        <span>${pricing.taxes.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>${pricing.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Insurance */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      id="insurance"
                      checked={insuranceAccepted}
                      onCheckedChange={(checked) =>
                        setInsuranceAccepted(checked === true)
                      }
                    />
                    <div>
                      <Label htmlFor="insurance" className="font-medium cursor-pointer">
                        Add Insurance Protection
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        $15/day coverage for peace of mind
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Message to owner (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Hi! I'm interested in renting your car..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked === true)
                      }
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary underline">
                        privacy policy
                      </Link>
                    </Label>
                  </div>

                  {/* Book Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBook}
                    disabled={
                      !pickupDate ||
                      !returnDate ||
                      !termsAccepted ||
                      createBooking.isPending
                    }
                  >
                    {createBooking.isPending
                      ? "Booking..."
                      : vehicle.instant_book
                      ? "Book Instantly"
                      : "Request to Book"}
                  </Button>

                  {!vehicle.instant_book && (
                    <p className="text-xs text-center text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Owner approval required (usually within 24h)
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Trust indicators */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>$1M liability coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Verified owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

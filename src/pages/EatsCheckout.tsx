/**
 * ZIVO Eats — Checkout Page
 * MVP: Submit order request — no payment processing
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  UtensilsCrossed, MapPin, Clock, User, Phone, Mail, 
  ArrowLeft, Plus, Minus, Loader2, CheckCircle, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useCreateFoodOrder } from "@/hooks/useEatsOrders";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_phone: z.string().min(10, "Valid phone number required"),
  customer_email: z.string().email("Valid email required"),
  delivery_address: z.string().min(5, "Delivery address required"),
  delivery_instructions: z.string().optional(),
  preferred_time: z.enum(["asap", "scheduled"]),
  scheduled_time: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function EatsCheckoutContent() {
  const navigate = useNavigate();
  const { items, updateQuantity, getSubtotal, clearCart, deliveryAddress } = useCart();
  const createOrder = useCreateFoodOrder();
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = 3.99;
  const total = subtotal + deliveryFee;

  const restaurantId = items.length > 0 ? items[0].restaurantId : null;
  const restaurantName = items.length > 0 ? items[0].restaurantName : "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_address: deliveryAddress,
      preferred_time: "asap",
    },
  });

  const preferredTime = watch("preferred_time");

  const onSubmit = async (data: CheckoutFormData) => {
    if (!restaurantId || items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      await createOrder.mutateAsync({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        delivery_address: data.delivery_address,
        delivery_instructions: data.delivery_instructions,
        preferred_time: data.preferred_time,
        scheduled_time: data.scheduled_time,
        restaurant_id: restaurantId,
        items: items.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
      });

      setOrderSubmitted(true);
      clearCart();
    } catch (error) {
      // Error handled in hook
    }
  };

  // Success state
  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">
                Order Request Received!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your order from <strong>{restaurantName}</strong>. 
                We'll contact you shortly to confirm your order and arrange delivery.
              </p>
              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  What happens next?
                </p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>We'll confirm your order and contact you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>The restaurant will prepare your food</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>A driver will deliver your order</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/eats")}>
                  Back to ZIVO Eats
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-eats to-orange-500"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h1 className="font-bold text-2xl mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some delicious food to get started
            </p>
            <Button 
              onClick={() => navigate("/eats/restaurants")}
              className="bg-gradient-to-r from-eats to-orange-500"
            >
              Browse Restaurants
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Checkout — ZIVO Eats"
        description="Complete your food order with ZIVO Eats"
      />
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <h1 className="font-display text-3xl font-bold mb-8">
            Checkout
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-eats" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer_name">Full Name *</Label>
                        <Input
                          id="customer_name"
                          {...register("customer_name")}
                          placeholder="John Doe"
                          className="mt-1.5"
                        />
                        {errors.customer_name && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="customer_phone">Phone Number *</Label>
                        <Input
                          id="customer_phone"
                          {...register("customer_phone")}
                          placeholder="(555) 123-4567"
                          className="mt-1.5"
                        />
                        {errors.customer_phone && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_phone.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email Address *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        {...register("customer_email")}
                        placeholder="john@example.com"
                        className="mt-1.5"
                      />
                      {errors.customer_email && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_email.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-eats" />
                      Delivery Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Input
                        id="delivery_address"
                        {...register("delivery_address")}
                        placeholder="123 Main St, City, State"
                        className="mt-1.5"
                      />
                      {errors.delivery_address && (
                        <p className="text-sm text-destructive mt-1">{errors.delivery_address.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="delivery_instructions">Delivery Instructions (optional)</Label>
                      <Textarea
                        id="delivery_instructions"
                        {...register("delivery_instructions")}
                        placeholder="Apt #, gate code, leave at door, etc."
                        className="mt-1.5"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Timing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-eats" />
                      Delivery Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      defaultValue="asap"
                      onValueChange={(value) => {
                        // Handled by react-hook-form
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="asap" id="asap" {...register("preferred_time")} />
                        <Label htmlFor="asap" className="flex-1 cursor-pointer">
                          <span className="font-medium">As Soon As Possible</span>
                          <p className="text-sm text-muted-foreground">Usually 30-45 minutes</p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="scheduled" id="scheduled" {...register("preferred_time")} />
                        <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                          <span className="font-medium">Schedule for Later</span>
                          <p className="text-sm text-muted-foreground">Choose a specific time</p>
                        </Label>
                      </div>
                    </RadioGroup>
                    {preferredTime === "scheduled" && (
                      <div className="mt-4">
                        <Label htmlFor="scheduled_time">Preferred Time</Label>
                        <Input
                          id="scheduled_time"
                          type="datetime-local"
                          {...register("scheduled_time")}
                          className="mt-1.5 max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-eats" />
                      Order Summary
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{restaurantName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <hr />

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-lg pt-1">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-xs">
                      <strong>Note:</strong> Payment will be collected upon delivery or via follow-up contact. 
                      This is an order request — we'll confirm availability.
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-eats to-orange-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Place Order Request"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EatsCheckout() {
  return (
    <CartProvider>
      <EatsCheckoutContent />
    </CartProvider>
  );
}

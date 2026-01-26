import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw, Car, UtensilsCrossed, Plane, Hotel, Key, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RefundPolicy = () => {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <RefreshCcw className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Refund & Cancellation Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              At ZIVO, we want you to have a great experience. If something goes wrong, we're here to help. 
              This policy outlines refund and cancellation terms for all ZIVO services.
            </p>
          </CardContent>
        </Card>

        {/* Refund Timeline Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Standard Refunds</p>
              <p className="text-xs text-muted-foreground">3-5 business days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-sm font-medium">Instant Credits</p>
              <p className="text-xs text-muted-foreground">Same day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="h-6 w-6 mx-auto mb-2 text-rides" />
              <p className="text-sm font-medium">Ride Disputes</p>
              <p className="text-xs text-muted-foreground">48 hours review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-sm font-medium">Chargebacks</p>
              <p className="text-xs text-muted-foreground">30 days max</p>
            </CardContent>
          </Card>
        </div>

        {/* Service-Specific Policies */}
        <Tabs defaultValue="rides" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rides" className="text-xs sm:text-sm">Rides</TabsTrigger>
            <TabsTrigger value="eats" className="text-xs sm:text-sm">Eats</TabsTrigger>
            <TabsTrigger value="rental" className="text-xs sm:text-sm">Car Rental</TabsTrigger>
            <TabsTrigger value="flights" className="text-xs sm:text-sm">Flights</TabsTrigger>
            <TabsTrigger value="hotels" className="text-xs sm:text-sm">Hotels</TabsTrigger>
          </TabsList>

          {/* Rides */}
          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-rides" />
                  ZIVO Rides Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Cancellation Fees</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Before driver accepts</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">Free</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>After driver accepts (within 2 min)</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">Free</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>After driver accepts (after 2 min)</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">$3-5 fee</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>No-show after driver arrives</span>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">$5-10 fee</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible for Refund</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Driver took a significantly longer route without explanation</li>
                    <li>Driver ended trip before reaching destination</li>
                    <li>You were charged for a trip you didn't take</li>
                    <li>Safety issues during the trip</li>
                    <li>Driver was rude or unprofessional</li>
                    <li>Wrong fare charged (toll errors, duplicate charges)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Not Eligible for Refund</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Traffic delays or road conditions</li>
                    <li>Route changes at your request</li>
                    <li>Surge pricing applied at booking</li>
                    <li>Wait time charges (after 5 min grace period)</li>
                    <li>Cleaning fees for spills or damage</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="font-semibold">How to Request</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Go to Trip History → Select the trip → Report an Issue → Choose the reason → Submit
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eats */}
          <TabsContent value="eats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-eats" />
                  ZIVO Eats Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Order Cancellation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Before restaurant accepts</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">Full refund</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>After accepted, before preparation</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Partial refund</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>During preparation</span>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">No refund</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible for Refund/Credit</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Missing items from your order</li>
                    <li>Wrong items delivered</li>
                    <li>Food quality issues (cold, stale, undercooked)</li>
                    <li>Order never arrived</li>
                    <li>Significant delay (over 30 min past estimate)</li>
                    <li>Allergies not accommodated (when noted in order)</li>
                    <li>Spilled or damaged packaging</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Refund Options</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="font-semibold">ZIVO Credits</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Instant, 110% value for minor issues. Valid for 90 days.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-semibold">Original Payment Method</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        3-5 business days for major issues or on request.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Photo Evidence</h4>
                  <p className="text-sm text-muted-foreground">
                    For quality issues (wrong items, damaged food), submitting photos helps us process your 
                    refund faster and improve restaurant quality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Car Rental */}
          <TabsContent value="rental">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  ZIVO Car Rental Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Cancellation Policy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>48+ hours before pickup</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">Full refund</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>24-48 hours before pickup</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">75% refund</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Less than 24 hours</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">50% refund</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>No-show</span>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">No refund</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Early Return</h4>
                  <p className="text-muted-foreground">
                    If you return the vehicle early, you may be eligible for a partial refund of unused days, 
                    minus a re-stocking fee. Early return policies vary by vehicle owner.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Deposit Returns</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Security deposits are released within 5-7 business days after return</li>
                    <li>Deductions may apply for damage, cleaning, or fuel shortages</li>
                    <li>Toll violations discovered later may be charged</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible for Refund</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Vehicle not as described (different model, missing features)</li>
                    <li>Mechanical issues that prevent use</li>
                    <li>Vehicle not available at pickup time</li>
                    <li>Cleanliness issues upon pickup</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flights */}
          <TabsContent value="flights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-sky-500" />
                  ZIVO Flights Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="font-semibold text-warning">Important Note</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Flight refunds are subject to airline policies. ZIVO facilitates refunds but final 
                    decisions are made by the operating airline.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Fare Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Refundable fares</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">Full refund (may have fee)</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Flexible fares</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Credit for future travel</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Non-refundable fares</span>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">No refund*</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    *Non-refundable fares may be eligible for change with fee, or refund in case of airline cancellation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Airline-Initiated Changes</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Flight cancelled:</strong> Full refund or rebooking</li>
                    <li><strong>Schedule change (2+ hours):</strong> Refund or change without fee</li>
                    <li><strong>Minor schedule change:</strong> No refund, must accept new time</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">24-Hour Cancellation</h4>
                  <p className="text-muted-foreground">
                    For flights departing from the US, you can cancel within 24 hours of booking for a full 
                    refund, as long as the departure is 7+ days away (per DOT regulations).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">ZIVO Service Fee</h4>
                  <p className="text-muted-foreground">
                    ZIVO's booking service fee ($0-15) is non-refundable except when the flight is cancelled 
                    by the airline.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels */}
          <TabsContent value="hotels">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-amber-500" />
                  ZIVO Hotels Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Rate Types</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <p className="font-semibold text-success">Flexible Rate</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Free cancellation until 24-48 hours before check-in</li>
                        <li>• Full refund to original payment method</li>
                        <li>• Slightly higher price for flexibility</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="font-semibold text-warning">Partially Refundable</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Partial refund if cancelled within policy window</li>
                        <li>• First night charge may be retained</li>
                        <li>• Check specific terms at booking</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="font-semibold text-destructive">Non-Refundable</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• No refund for cancellation or no-show</li>
                        <li>• Lower price in exchange for commitment</li>
                        <li>• May be eligible for date change (hotel dependent)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Early Checkout</h4>
                  <p className="text-muted-foreground">
                    Early checkout does not entitle you to a refund for unused nights, unless the hotel 
                    agrees to waive remaining charges. Always check with the front desk.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible for Refund/Compensation</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Room not as described (different view, amenities missing)</li>
                    <li>Cleanliness or maintenance issues not resolved</li>
                    <li>Overbooking (hotel cannot honor reservation)</li>
                    <li>Safety concerns (unresolved by hotel)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* General Information */}
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="process" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-semibold">How to Request a Refund</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
              <ol className="list-decimal list-inside space-y-3">
                <li><strong>In-App:</strong> Go to your order/booking history → Select the item → Tap "Help" or "Report Issue"</li>
                <li><strong>Help Center:</strong> Visit /help and submit a refund request ticket</li>
                <li><strong>Email:</strong> Contact support@zivo.com with your booking reference</li>
                <li><strong>Response Time:</strong> We aim to respond within 24-48 hours</li>
              </ol>
              <p className="mt-4">
                <strong>Required Information:</strong> Booking/order ID, date of service, description of issue, 
                any supporting photos or screenshots.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timing" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-semibold">Refund Processing Times</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>ZIVO Credits</span>
                  <span className="text-primary">Instant</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Debit Card</span>
                  <span className="text-primary">3-5 business days</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Credit Card</span>
                  <span className="text-primary">5-10 business days</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Digital Wallet (Apple/Google Pay)</span>
                  <span className="text-primary">3-5 business days</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Bank Transfer</span>
                  <span className="text-primary">5-7 business days</span>
                </div>
              </div>
              <p className="text-sm mt-4">
                Note: These are processing times after approval. Your bank may take additional time to 
                reflect the refund in your account.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="disputes" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-semibold">Dispute Resolution</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 pb-6">
              <p>
                If you disagree with a refund decision, you can request a review:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Reply to the refund decision with additional information</li>
                <li>Request escalation to a senior support representative</li>
                <li>If unresolved after 14 days, you may escalate to our Dispute Resolution Team</li>
              </ol>
              <p className="mt-4">
                We aim to resolve all disputes fairly and promptly. For payment disputes, please contact us 
                before initiating a chargeback, as we can often resolve issues faster.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contact */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-display font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is available 24/7 to assist with refund requests.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/help">
                <Button>Visit Help Center</Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="outline">Terms of Service</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RefundPolicy;

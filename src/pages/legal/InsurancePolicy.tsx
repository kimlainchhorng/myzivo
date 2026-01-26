import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Car, UtensilsCrossed, Key, Plane, Hotel, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const InsurancePolicy = () => {
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
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Insurance & Protection</h1>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              ZIVO provides comprehensive insurance and protection programs for all our services in the United States. 
              This page outlines coverage details, eligibility, and how to file claims. Coverage may vary by state 
              due to local regulations.
            </p>
          </CardContent>
        </Card>

        {/* Service Tabs */}
        <Tabs defaultValue="rides" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rides" className="text-xs sm:text-sm">Rides</TabsTrigger>
            <TabsTrigger value="eats" className="text-xs sm:text-sm">Eats</TabsTrigger>
            <TabsTrigger value="rental" className="text-xs sm:text-sm">Car Rental</TabsTrigger>
            <TabsTrigger value="flights" className="text-xs sm:text-sm">Flights</TabsTrigger>
            <TabsTrigger value="hotels" className="text-xs sm:text-sm">Hotels</TabsTrigger>
          </TabsList>

          {/* Rides Insurance */}
          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-rides" />
                  ZIVO Rides Insurance Coverage
                </CardTitle>
                <CardDescription>Commercial auto insurance for every trip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coverage Phases */}
                <div>
                  <h4 className="font-semibold mb-4">Coverage by Trip Phase</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Phase 1</Badge>
                        <span className="font-medium">App On, Waiting for Request</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Contingent liability coverage (if personal insurance denies claim)</li>
                        <li>• $50,000 per person / $100,000 per incident bodily injury</li>
                        <li>• $25,000 property damage</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary">Phase 2 & 3</Badge>
                        <span className="font-medium">En Route to Pickup & During Trip</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• $1,000,000 third-party liability coverage</li>
                        <li>• Uninsured/underinsured motorist coverage</li>
                        <li>• Contingent comprehensive & collision (driver's vehicle)</li>
                        <li>• Deductible: $2,500 for collision (may be reduced with optional coverage)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* What's Covered */}
                <div>
                  <h4 className="font-semibold mb-3">What's Covered</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Bodily injury to third parties",
                      "Property damage to third parties",
                      "Passenger injuries during trip",
                      "Driver injuries (Phase 2 & 3)",
                      "Hit-and-run incidents",
                      "Uninsured motorist accidents",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's NOT Covered */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    What's NOT Covered
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Personal belongings left in vehicle</li>
                    <li>• Intentional damage or fraud</li>
                    <li>• Driver's vehicle damage if they lack personal collision coverage</li>
                    <li>• Injuries from driving under the influence</li>
                    <li>• Use of vehicle for unauthorized purposes</li>
                  </ul>
                </div>

                {/* State Compliance */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">State-Specific Coverage</p>
                  <p className="text-sm text-muted-foreground">
                    Coverage meets or exceeds Transportation Network Company (TNC) requirements in all 50 states 
                    and D.C. Some states have higher mandatory minimums which we comply with. Contact us for 
                    state-specific details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eats Insurance */}
          <TabsContent value="eats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-eats" />
                  ZIVO Eats Protection
                </CardTitle>
                <CardDescription>Coverage for delivery partners and orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Delivery Partner Coverage</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Occupational accident insurance during active deliveries</li>
                    <li>• Up to $1,000,000 in medical expenses from on-trip injuries</li>
                    <li>• Disability payments for qualifying injuries</li>
                    <li>• Coverage for bike, scooter, and vehicle deliveries</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Customer Protection</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Full refund for orders never delivered</li>
                    <li>• Partial or full refund for missing/incorrect items</li>
                    <li>• Quality guarantee - credit for food quality issues</li>
                    <li>• Tamper-evident packaging requirements for partners</li>
                  </ul>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="font-semibold text-warning mb-2">Food Safety Disclaimer</p>
                  <p className="text-sm text-muted-foreground">
                    ZIVO is not liable for foodborne illness or allergic reactions. Restaurants are responsible 
                    for food safety and allergen information. Always inform restaurants of allergies directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Car Rental Insurance */}
          <TabsContent value="rental">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  ZIVO Car Rental Protection
                </CardTitle>
                <CardDescription>Protection plans for renters and owners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Coverage Tiers</h4>
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Basic Protection</span>
                        <Badge variant="outline">Included</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• State minimum liability coverage</li>
                        <li>• $2,000 vehicle damage deductible</li>
                        <li>• 24/7 roadside assistance</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-primary/50 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Standard Protection</span>
                        <Badge>$15/day</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• $1,000,000 liability coverage</li>
                        <li>• $500 vehicle damage deductible</li>
                        <li>• Uninsured motorist coverage</li>
                        <li>• Personal effects coverage up to $1,000</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-amber-500/50 bg-amber-500/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Premium Protection</span>
                        <Badge className="bg-amber-500">$25/day</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• $1,000,000 liability coverage</li>
                        <li>• $0 deductible for vehicle damage</li>
                        <li>• Full tire and glass coverage</li>
                        <li>• Personal effects coverage up to $2,500</li>
                        <li>• Trip interruption reimbursement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Owner Protection</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Primary liability coverage during rentals</li>
                    <li>• Physical damage coverage for your vehicle</li>
                    <li>• Lost income protection if vehicle is damaged</li>
                    <li>• $1,000,000 umbrella liability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flights Insurance */}
          <TabsContent value="flights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-sky-500" />
                  Travel Insurance for Flights
                </CardTitle>
                <CardDescription>Optional protection for air travel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ZIVO offers optional travel insurance through our partner, TravelGuard (AIG). 
                    Insurance can be added during the booking process.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Available Coverage</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Trip Cancellation</p>
                      <p className="text-sm text-muted-foreground">
                        100% of non-refundable trip costs if cancelled for covered reasons 
                        (illness, death, job loss, etc.)
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Trip Interruption</p>
                      <p className="text-sm text-muted-foreground">
                        150% of trip cost for return home and unused trip expenses
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Travel Delay</p>
                      <p className="text-sm text-muted-foreground">
                        Up to $200/day for meals, lodging during covered delays (6+ hours)
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Baggage Loss/Delay</p>
                      <p className="text-sm text-muted-foreground">
                        Up to $2,500 for lost baggage; $500 for essentials during delay
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Medical Emergency</p>
                      <p className="text-sm text-muted-foreground">
                        Up to $100,000 for emergency medical expenses abroad
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Emergency Evacuation</p>
                      <p className="text-sm text-muted-foreground">
                        Up to $500,000 for medical evacuation and repatriation
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  * Coverage details and limits vary by plan selected. Review full policy documents before purchase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels Insurance */}
          <TabsContent value="hotels">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-amber-500" />
                  Hotel Booking Protection
                </CardTitle>
                <CardDescription>Flexible cancellation and protection options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Booking Protection Plans</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Free Cancellation Rate</span>
                        <Badge variant="outline">Included with select rates</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cancel up to 24-48 hours before check-in for a full refund. 
                        Look for "Free Cancellation" badge when booking.
                      </p>
                    </div>
                    <div className="p-4 border border-primary/50 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Refund Protection</span>
                        <Badge>~10% of booking</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive a full refund if you need to cancel for covered reasons including 
                        illness, injury, job loss, or jury duty. Available for non-refundable bookings.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">ZIVO Best Price Guarantee</h4>
                  <p className="text-sm text-muted-foreground">
                    Find a lower price within 24 hours of booking? We'll refund the difference 
                    plus give you a $50 credit. Terms apply.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Property Standards</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• All listed properties meet safety and cleanliness standards</li>
                    <li>• 24/7 support if issues arise during your stay</li>
                    <li>• Relocation assistance if property cannot honor booking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Claims Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to File a Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Report Incident", desc: "Use in-app reporting or call our hotline" },
                { step: "2", title: "Document Everything", desc: "Photos, police report, witness info" },
                { step: "3", title: "Submit Claim", desc: "Complete claim form within 30 days" },
                { step: "4", title: "Resolution", desc: "Claims processed within 7-14 business days" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">{item.step}</span>
                  </div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Claims Hotline:</strong> 1-800-ZIVO-CLM (1-800-948-6256)<br />
                <strong>Email:</strong> claims@zivo.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="personal" className="border rounded-lg px-4">
                <AccordionTrigger>Do I need my own car insurance as a driver?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. ZIVO's insurance is secondary and contingent. You must maintain personal auto insurance 
                  that meets your state's minimum requirements. During Phase 1 (app on, no trip), your personal 
                  insurance is primary.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="deductible" className="border rounded-lg px-4">
                <AccordionTrigger>Who pays the deductible?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If you're a driver in an at-fault accident during a trip, you're responsible for the deductible 
                  (up to $2,500). This can be reduced by purchasing optional deductible coverage. If another party 
                  is at fault, we pursue their insurance.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="international" className="border rounded-lg px-4">
                <AccordionTrigger>Does coverage apply outside the US?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ZIVO Rides insurance only covers trips within the United States. For international travel 
                  (Flights, Hotels), we offer optional travel insurance through our partners. Car rental coverage 
                  does not extend beyond US borders.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/terms-of-service">
            <Button variant="outline">Terms of Service</Button>
          </Link>
          <Link to="/help">
            <Button variant="outline">Help Center</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default InsurancePolicy;

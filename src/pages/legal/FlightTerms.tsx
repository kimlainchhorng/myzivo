/**
 * Flight Terms Page
 * Legal terms for ZIVO flight bookings (MoR model)
 */

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plane, Shield, CreditCard, RefreshCw, AlertCircle, FileText } from 'lucide-react';

const FlightTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flight Booking Terms – ZIVO"
        description="Terms and conditions for booking flights through ZIVO. Learn about our policies, refunds, and airline rules."
      />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">Flight Booking Terms</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These terms apply to all flight bookings made through ZIVO. Please read carefully before booking.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: February 2, 2026
            </p>
          </div>

          <div className="space-y-8">
            {/* ZIVO as Seller */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  ZIVO as Seller of Travel
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  ZIVO operates as a seller of travel and processes payments for flight bookings. When you book a flight through ZIVO:
                </p>
                <ul>
                  <li>ZIVO is the merchant of record and will appear on your credit card statement</li>
                  <li>ZIVO issues booking confirmations and manages customer communications</li>
                  <li>Flight tickets (e-tickets) are issued by our licensed ticketing partners under a sub-agent arrangement</li>
                  <li>Your contract for carriage is with the operating airline(s)</li>
                </ul>
                <p>
                  ZIVO is a registered seller of travel operating in compliance with applicable laws and regulations.
                </p>
              </CardContent>
            </Card>

            {/* Ticketing Partners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  Ticketing Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  ZIVO works with licensed and accredited ticketing partners to issue airline tickets. These partners:
                </p>
                <ul>
                  <li>Hold IATA (International Air Transport Association) accreditation or equivalent</li>
                  <li>Are authorized to issue tickets on behalf of airlines</li>
                  <li>Comply with airline regulations and ticketing standards</li>
                </ul>
                <p>
                  Your e-ticket is a valid electronic travel document that can be used for check-in and boarding.
                </p>
              </CardContent>
            </Card>

            {/* Airline Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Airline Rules Apply
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  All flights are subject to the conditions of carriage of the operating airline(s). This includes:
                </p>
                <ul>
                  <li><strong>Baggage policies:</strong> Checked baggage allowance, carry-on limits, and excess baggage fees are set by the airline</li>
                  <li><strong>Schedule changes:</strong> Airlines may change flight times, routes, or cancel flights. ZIVO will notify you of any changes</li>
                  <li><strong>Seat selection:</strong> Available seats and seat selection fees are determined by the airline</li>
                  <li><strong>In-flight services:</strong> Meals, entertainment, and other services vary by airline and fare class</li>
                </ul>
                <p>
                  Please review the airline's conditions of carriage before traveling. Links are provided in your booking confirmation.
                </p>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Payment is processed securely through Stripe. By completing a booking, you agree that:
                </p>
                <ul>
                  <li>The total price shown at checkout is the final price, including all taxes and fees</li>
                  <li>Payment is due in full at the time of booking</li>
                  <li>ZIVO will charge your payment method immediately upon booking</li>
                  <li>All prices are in the currency displayed at checkout</li>
                </ul>
                <p>
                  Your payment information is encrypted and never stored on ZIVO's servers. All transactions are processed by Stripe, a PCI-DSS compliant payment processor.
                </p>
              </CardContent>
            </Card>

            {/* Refund Policy */}
            <Card id="refunds">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Cancellations and Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Refund eligibility depends on the fare type purchased:
                </p>
                <h4>Refundable Fares</h4>
                <ul>
                  <li>Eligible for refund minus applicable airline cancellation fees</li>
                  <li>Refunds are processed within 7-14 business days</li>
                  <li>Refund will be credited to the original payment method</li>
                </ul>
                <h4>Non-Refundable Fares</h4>
                <ul>
                  <li>Generally not eligible for refund</li>
                  <li>Some airlines offer credit for future travel (subject to change fees)</li>
                  <li>Exceptions may apply for airline-initiated cancellations or schedule changes</li>
                </ul>
                <h4>ZIVO Processing</h4>
                <ul>
                  <li>ZIVO does not charge a fee for processing refund requests</li>
                  <li>Airline cancellation/change fees are passed through as charged</li>
                  <li>Contact ZIVO Support to request a refund or change</li>
                </ul>
              </CardContent>
            </Card>

            {/* Passenger Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Passenger Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  When booking, you are responsible for:
                </p>
                <ul>
                  <li><strong>Accurate information:</strong> Names must match travel documents exactly</li>
                  <li><strong>Travel documents:</strong> Valid passport, visa, and any required documentation for your destination</li>
                  <li><strong>Check-in:</strong> Completing online check-in or arriving at the airport with sufficient time</li>
                  <li><strong>Contact information:</strong> Providing a valid email and phone number for booking updates</li>
                  <li><strong>Health requirements:</strong> Complying with any health or vaccination requirements for your destination</li>
                </ul>
                <p>
                  ZIVO is not responsible for denied boarding due to incorrect documentation or failure to meet entry requirements.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  For questions about your booking or these terms:
                </p>
                <ul>
                  <li>Email: support@hizivo.com</li>
                  <li>Visit: <a href="/support">ZIVO Support Center</a></li>
                </ul>
                <p>
                  For urgent matters related to imminent travel, please contact us as soon as possible.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Links */}
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              By booking a flight through ZIVO, you agree to these Flight Booking Terms, our{' '}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>, and{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightTerms;

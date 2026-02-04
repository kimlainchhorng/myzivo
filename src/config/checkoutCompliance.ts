/**
 * Checkout Compliance Copy Configuration
 * Centralized copy for trusted & conversion-optimized checkout experience
 */

export const CHECKOUT_HEADER = {
  title: "Secure Checkout",
  icon: "🔒",
  subtitle: "Your booking is protected and processed securely by licensed travel partners.",
};

export const CHECKOUT_PRICE = {
  noHiddenFees: "No hidden fees. Final price shown before booking.",
  finalPrice: "Final price",
};

export const CHECKOUT_PASSENGER = {
  title: "Passenger Details",
  subtitle: "Please enter passenger information exactly as shown on government-issued ID.",
  warning: "Name changes may not be allowed after booking.",
  helperTooltip: "Enter your name exactly as it appears on your passport or ID",
};

export const CHECKOUT_PAYMENT = {
  title: "Payment Information",
  security: "Payments are processed securely by our trusted travel partners using PCI-compliant systems.",
  noStorage: "ZIVO does not store your payment information.",
  accepted: "Accepted payment methods:",
};

export const CHECKOUT_NOTICE = {
  title: "Before you book:",
  flights: {
    items: [
      "Prices may change until booking is completed",
      "Ticket rules are set by the airline or provider",
      "Refunds and changes follow partner policies",
    ],
    disclaimer: "ZIVO acts as a booking facilitator. Tickets are issued by licensed providers.",
  },
  hotels: {
    items: [
      "Rates may change until booking is completed",
      "Cancellation policies are set by the property",
      "Refunds and changes follow hotel policies",
    ],
    disclaimer: "ZIVO acts as a booking facilitator. Reservations are confirmed by hotel partners.",
  },
  cars: {
    items: [
      "Rates may change until booking is completed",
      "Rental terms are set by the rental provider",
      "Refunds and changes follow partner policies",
    ],
    disclaimer: "ZIVO acts as a booking facilitator. Rentals are provided by licensed partners.",
  },
};

export const CHECKOUT_CTA = {
  button: "Continue to Secure Booking",
  subtext: "You will be redirected to complete your booking securely.",
  buttonAlt: "Proceed to Secure Payment",
};

export const CHECKOUT_CONFIRMATION = {
  success: "Thank You for Your Booking",
  icon: "✈️",
  received: "Your booking request has been received.",
  email: "A confirmation email will be sent once your ticket is issued by the provider.",
  buttons: {
    view: "View Booking",
    support: "Contact Support",
    home: "Back to Home",
  },
};

export const CHECKOUT_FOOTER = {
  help: "Need help?",
  contact: "Contact our support team or your booking provider directly.",
  trust: ["Secure payments", "Trusted partners", "Transparent pricing"],
  final: "ZIVO helps you compare and book travel options. All travel services are fulfilled by authorized providers.",
  supportEmail: "support@hizovo.com",
};

export const CHECKOUT_TRUST_SIGNALS = {
  ssl: "SSL Encrypted",
  pci: "PCI Compliant",
  secure: "256-bit Encryption",
  verified: "Verified Partners",
};

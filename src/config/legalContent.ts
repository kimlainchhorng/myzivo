/**
 * ZIVO Legal Content Configuration
 * Locked legal text for compliance
 */

export const COMPANY_INFO = {
  name: "ZIVO LLC",
  dba: "ZIVO",
  address: "United States",
  email: "info@hizivo.com",
  supportEmail: "support@hizivo.com",
  billingEmail: "payment@hizivo.com",
  website: "https://hizivo.com",
};

export const TERMS_OF_SERVICE = {
  version: "1.0",
  effectiveDate: "2026-02-03",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using ZIVO's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.`,
    },
    {
      title: "2. Platform Description",
      content: `ZIVO is a technology platform and marketplace that facilitates connections between users and third-party service providers. ZIVO does not own vehicles, operate airlines, employ drivers, or operate restaurants. All services are provided by independent third parties.`,
    },
    {
      title: "3. Services",
      subsections: [
        {
          title: "3.1 Flights",
          content: `ZIVO acts as a sub-agent of licensed ticketing providers. Airline tickets are issued by authorized partners under airline rules. ZIVO does not issue airline tickets directly.`,
        },
        {
          title: "3.2 Car Rentals",
          content: `Vehicle owners are independent providers responsible for vehicle condition and insurance. ZIVO facilitates booking, payment, and logistics.`,
        },
        {
          title: "3.3 Rides & Move",
          content: `Drivers are independent contractors. ZIVO does not provide transportation services directly. ZIVO facilitates bookings and payments only.`,
        },
        {
          title: "3.4 Eats",
          content: `Restaurants are independent partners responsible for food quality and safety. ZIVO facilitates orders and delivery logistics.`,
        },
      ],
    },
    {
      title: "4. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZIVO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.`,
    },
    {
      title: "5. Indemnification",
      content: `You agree to indemnify, defend, and hold harmless ZIVO, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the services or violation of these terms.`,
    },
    {
      title: "6. Dispute Resolution",
      content: `Any dispute arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. YOU AGREE TO WAIVE YOUR RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A CLASS ACTION.`,
    },
    {
      title: "7. Governing Law",
      content: `These terms shall be governed by the laws of the State of Delaware, without regard to its conflict of law provisions.`,
    },
    {
      title: "8. Force Majeure",
      content: `ZIVO shall not be liable for any failure or delay in performing obligations due to circumstances beyond its reasonable control, including natural disasters, acts of war, terrorism, pandemics, or government actions.`,
    },
  ],
};

export const PRIVACY_POLICY = {
  version: "1.0",
  effectiveDate: "2026-02-03",
  sections: [
    {
      title: "1. Information We Collect",
      subsections: [
        {
          title: "Personal Information",
          content: `Name, email address, phone number, date of birth, government ID (for verification), payment information.`,
        },
        {
          title: "Location Data",
          content: `Real-time location for ride services, pickup/dropoff locations, travel preferences.`,
        },
        {
          title: "Usage Data",
          content: `Browsing history, search queries, booking history, device information, IP address.`,
        },
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: `We use your information to: provide and improve services, process payments, communicate with you, verify identity, prevent fraud, and comply with legal obligations.`,
    },
    {
      title: "3. Third-Party Processors",
      content: `We share data with: Stripe (payment processing), Duffel (flight ticketing), insurance providers (protection plans), and other service partners necessary to fulfill your bookings.`,
    },
    {
      title: "4. Data Retention",
      content: `We retain personal data for as long as necessary to provide services and comply with legal obligations. You may request deletion of your data subject to legal requirements.`,
    },
    {
      title: "5. Your Rights",
      content: `You have the right to: access your data, correct inaccurate data, request deletion, opt out of marketing, and data portability. Contact privacy@hizivo.com to exercise these rights.`,
    },
    {
      title: "6. Security",
      content: `We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data.`,
    },
  ],
};

export const SELLER_OF_TRAVEL_DISCLOSURE = {
  version: "1.0",
  companyName: COMPANY_INFO.name,
  disclosure: `${COMPANY_INFO.name} sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under airline rules. ZIVO does not issue airline tickets directly.`,
  registrations: {
    california: { status: "pending", number: null },
    florida: { status: "pending", number: null },
  },
};

export const TRANSPORTATION_DISCLAIMER = {
  version: "1.0",
  content: `ZIVO is a technology platform that connects riders with independent contractor drivers. ZIVO does not provide transportation services and is not a transportation carrier. Drivers are not employees of ZIVO. There is no employer-employee relationship between ZIVO and any driver.`,
};

export const CAR_RENTAL_DISCLAIMER = {
  version: "1.0",
  content: `Vehicle owners listing on ZIVO are independent providers responsible for maintaining their vehicles in safe, roadworthy condition and maintaining adequate insurance coverage. ZIVO facilitates booking, payment, and logistics but does not own or operate rental vehicles. Damage claims are handled through platform dispute resolution.`,
};

export const INSURANCE_DISCLOSURE = {
  version: "1.0",
  content: `ZIVO does not underwrite or provide insurance coverage. Protection plans offered through ZIVO are provided by licensed third-party insurance providers. Coverage is subject to policy terms, conditions, and exclusions. Deductibles may apply. Review the full policy before purchasing.`,
};

export const REFUND_POLICY = {
  version: "1.0",
  sections: [
    {
      title: "Flights",
      content: `Flight refunds follow the fare rules set by the airline. Refund eligibility depends on the ticket type purchased. Non-refundable tickets may only be eligible for credit toward future travel.`,
    },
    {
      title: "Car Rentals",
      content: `Refunds follow the cancellation policy set by the vehicle owner. Free cancellation is typically available up to 24-48 hours before pickup. Late cancellations may incur fees.`,
    },
    {
      title: "Rides & Eats",
      content: `Refunds for ride and food delivery services are discretionary and evaluated on a case-by-case basis. Contact support within 48 hours of the service.`,
    },
    {
      title: "Chargebacks",
      content: `Disputed charges should first be reported to ZIVO support. Filing a chargeback with your bank before contacting ZIVO may result in account suspension.`,
    },
  ],
};

export const LEGAL_FOOTER_LINKS = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Seller of Travel", href: "/legal/seller-of-travel" },
  { label: "Refund Policy", href: "/legal/refunds" },
  { label: "Insurance Disclosure", href: "/legal/insurance-disclosure" },
];

export const CONSENT_REQUIREMENTS = {
  flights: ["terms", "privacy", "seller_of_travel"],
  cars: ["terms", "privacy", "car_rental", "insurance"],
  rides: ["terms", "privacy", "transportation"],
  eats: ["terms", "privacy"],
  move: ["terms", "privacy", "transportation"],
} as const;

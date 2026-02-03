/**
 * ZIVO Legal Content Configuration
 * Locked legal text for compliance - MAXIMUM LIABILITY PROTECTION
 */

export const COMPANY_INFO = {
  name: "ZIVO LLC",
  dba: "ZIVO",
  address: "United States",
  email: "info@hizivo.com",
  supportEmail: "support@hizivo.com",
  billingEmail: "payment@hizivo.com",
  website: "https://hizivo.com",
  stateOfFormation: "Delaware",
  governingLaw: "State of Delaware",
};

export const TERMS_OF_SERVICE = {
  version: "2.0",
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

// ============================================
// ADVANCED LEGAL PROTECTION CLAUSES (13-30)
// Maximum liability shielding & enterprise-grade protection
// ============================================

export const ADVANCED_LEGAL_CLAUSES = {
  // Clause 13: No Agency / No Employment
  noAgencyClause: {
    id: "no_agency",
    title: "No Agency or Employment Relationship",
    content: `No user, driver, vehicle owner, fleet operator, restaurant partner, or other service provider is an agent, employee, joint venturer, or partner of ZIVO LLC. No person or entity has any authority to bind ZIVO contractually or to act on behalf of ZIVO. No employment, agency, joint venture, or partnership relationship exists between ZIVO and any user or third party by virtue of these Terms or use of the platform.`,
    version: "1.0",
  },

  // Clause 14: Platform Disclaimer (Tech Only)
  platformDisclaimer: {
    id: "platform_disclaimer",
    title: "Technology Platform Disclaimer",
    content: `ZIVO provides a technology platform only. ZIVO does not provide transportation services, travel agency services, food preparation, food delivery services, vehicle rental services, or any other services directly. All services displayed on or facilitated through the ZIVO platform are provided by independent third-party service providers. ZIVO's role is limited to operating the technology platform that enables connections between users and service providers.`,
    version: "1.0",
  },

  // Clause 15: Assumption of Risk
  assumptionOfRisk: {
    id: "assumption_of_risk",
    title: "Assumption of Risk",
    content: `By using ZIVO services, you acknowledge and agree that you assume all risks associated with: (a) travel, including flight delays, cancellations, diversions, and schedule changes; (b) vehicle rental and operation, including accidents, damage, theft, and mechanical failure; (c) ride services, including accidents, driver conduct, and personal safety; (d) food delivery, including delays, spoilage, and allergen exposure; (e) package delivery, including loss, damage, and delay. You understand that third-party services involve inherent risks that cannot be eliminated. TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOU ASSUME ALL SUCH RISKS.`,
    version: "1.0",
  },

  // Clause 16: Release of Liability
  releaseOfLiability: {
    id: "release_of_liability",
    title: "Release of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE ZIVO LLC, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, successors, and assigns from any and all claims, demands, damages, losses, liabilities, costs, and expenses (including attorneys' fees) arising from or related to your use of the platform or any third-party services. This release includes, but is not limited to, claims for personal injury, property damage, indirect, incidental, special, consequential, or punitive damages.`,
    version: "1.0",
  },

  // Clause 17: Force Majeure Expansion
  forceMajeureExpanded: {
    id: "force_majeure_expanded",
    title: "Force Majeure (Expanded)",
    content: `ZIVO shall not be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to: acts of God; natural disasters; fires, floods, earthquakes, hurricanes, or other catastrophic events; epidemics, pandemics, or public health emergencies; acts of war, terrorism, or civil unrest; government actions, orders, or restrictions; airline system outages or carrier operational issues; labor disputes, strikes, or work stoppages; third-party service provider failures (including Stripe, Duffel, insurers, and other partners); internet or telecommunications failures; power outages; or any other cause beyond ZIVO's reasonable control.`,
    version: "1.0",
  },

  // Clause 18: Third-Party Beneficiary
  thirdPartyBeneficiary: {
    id: "third_party_beneficiary",
    title: "Third-Party Beneficiaries",
    content: `Airlines, vehicle owners, drivers, fleet operators, restaurant partners, insurance providers, payment processors (including Stripe), ticketing partners (including Duffel), and other third-party service providers are intended third-party beneficiaries of these Terms. Such third parties may enforce the protections, limitations, and disclaimers set forth in these Terms as they relate to their services. Except as expressly stated, these Terms do not create any other third-party beneficiary rights.`,
    version: "1.0",
  },

  // Clause 19: Strong Indemnification
  strongIndemnification: {
    id: "strong_indemnification",
    title: "Indemnification (Comprehensive)",
    content: `You agree to defend, indemnify, and hold harmless ZIVO LLC, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, successors, and assigns from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees and costs) arising out of or related to: (a) your use or misuse of the platform; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; (d) your violation of any third-party rights; (e) any property damage or personal injury caused by you; (f) any content or materials you submit or transmit; (g) any dispute between you and a third-party service provider; (h) any regulatory fines, penalties, or enforcement actions caused by your conduct.`,
    version: "1.0",
  },

  // Clause 20: Damage Limit Cap
  damageLimitCap: {
    id: "damage_limit_cap",
    title: "Limitation of Damages",
    content: `NOTWITHSTANDING ANY OTHER PROVISION OF THESE TERMS, IN NO EVENT SHALL ZIVO'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM EXCEED THE LESSER OF: (A) THE AMOUNTS YOU PAID TO ZIVO IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED U.S. DOLLARS ($100.00). THIS LIMITATION APPLIES TO ALL CAUSES OF ACTION IN THE AGGREGATE, INCLUDING BREACH OF CONTRACT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY.`,
    version: "1.0",
  },

  // Clause 21: Jury Trial Waiver
  juryTrialWaiver: {
    id: "jury_trial_waiver",
    title: "Waiver of Jury Trial",
    content: `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AND ZIVO EACH WAIVE THE RIGHT TO A TRIAL BY JURY IN ANY LEGAL PROCEEDING ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM. This waiver is separate from and in addition to the arbitration agreement set forth in these Terms. If for any reason a claim proceeds in court rather than arbitration, you and ZIVO each waive the right to a jury trial.`,
    version: "1.0",
  },

  // Clause 22: Class Action Opt-Out Procedure
  classActionOptOut: {
    id: "class_action_opt_out",
    title: "Arbitration & Class Action Waiver Opt-Out",
    content: `YOU MAY OPT OUT OF THE ARBITRATION AGREEMENT AND CLASS ACTION WAIVER by sending written notice within thirty (30) days of first accepting these Terms to: ZIVO LLC, Legal Department, [Address]. The notice must include your full legal name, email address, physical address, and a clear statement that you wish to opt out of the arbitration agreement and class action waiver. Opting out will not affect any other provisions of these Terms. If you do not opt out within 30 days, you shall be bound by the arbitration agreement and class action waiver.`,
    version: "1.0",
  },

  // Clause 23: Government & Law Enforcement
  governmentRequests: {
    id: "government_requests",
    title: "Compliance with Legal Requests",
    content: `ZIVO may access, preserve, and disclose your account information and content if required by law or if we believe in good faith that such action is reasonably necessary to: (a) comply with legal process, such as a court order, subpoena, or search warrant; (b) respond to lawful requests from government authorities; (c) enforce these Terms; (d) respond to claims that content violates third-party rights; (e) protect the rights, property, or safety of ZIVO, its users, or the public. ZIVO shall not be liable for any disclosure made in good faith compliance with legal obligations.`,
    version: "1.0",
  },

  // Clause 24: Content & Review Disclaimer
  contentDisclaimer: {
    id: "content_disclaimer",
    title: "User Content Disclaimer",
    content: `ZIVO does not endorse, verify, or take responsibility for any user-generated content, including reviews, ratings, photos, listings, descriptions, or communications. Users are solely responsible for the accuracy and legality of content they submit. ZIVO is not liable for any errors, inaccuracies, or misrepresentations in user content. Vehicle listings, restaurant menus, and service descriptions are provided by third-party partners and may contain errors. You should independently verify important information before making booking decisions.`,
    version: "1.0",
  },

  // Clause 25: Intellectual Property
  intellectualProperty: {
    id: "intellectual_property",
    title: "Intellectual Property Protection",
    content: `The ZIVO name, logo, trademarks, service marks, trade dress, and all related intellectual property are the exclusive property of ZIVO LLC. You may not use, copy, reproduce, modify, or distribute ZIVO's intellectual property without prior written consent. You are prohibited from: (a) scraping, crawling, or automated data collection from the platform; (b) reverse engineering, decompiling, or disassembling any software; (c) creating derivative works based on ZIVO content; (d) accessing the platform through automated means without authorization; (e) circumventing any access controls or security measures. Violation of this section may result in civil and criminal penalties.`,
    version: "1.0",
  },

  // Clause 26: Service Modification Rights
  serviceModification: {
    id: "service_modification",
    title: "Right to Modify Services",
    content: `ZIVO reserves the right, in its sole discretion and without prior notice, to: (a) modify, suspend, or discontinue any part of the platform or services; (b) change pricing, fees, or commission structures; (c) impose limits on certain features or services; (d) restrict access to parts or all of the platform; (e) temporarily or permanently suspend user accounts. ZIVO shall not be liable to you or any third party for any modification, suspension, or discontinuation of services.`,
    version: "1.0",
  },

  // Clause 27: Termination Without Cause
  terminationWithoutCause: {
    id: "termination_without_cause",
    title: "Termination",
    content: `ZIVO may terminate or suspend your account or access to the platform at any time, with or without cause, and with or without notice, subject to applicable law. Reasons for termination may include, but are not limited to: violation of these Terms; fraudulent or illegal activity; conduct harmful to other users or third parties; or extended periods of inactivity. Upon termination, your right to use the platform ceases immediately. ZIVO is not liable to you or any third party for any termination of your access. Provisions of these Terms that by their nature should survive termination shall remain in effect.`,
    version: "1.0",
  },

  // Clause 28: Severability & Survival
  severabilitySurvival: {
    id: "severability_survival",
    title: "Severability & Survival",
    content: `If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent. The following provisions shall survive termination of these Terms: Limitation of Liability, Indemnification, Release of Liability, Arbitration Agreement, Jury Trial Waiver, Class Action Waiver, Intellectual Property, and any other provisions that by their nature should survive.`,
    version: "1.0",
  },

  // Clause 29: International Users
  internationalUsers: {
    id: "international_users",
    title: "International Users",
    content: `The platform is operated from the United States. These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles. Users accessing the platform from outside the United States do so at their own initiative and are responsible for compliance with local laws. By using the platform, you consent to the exclusive jurisdiction of the courts located in Delaware for any disputes not subject to arbitration.`,
    version: "1.0",
  },

  // Clause 30: Entire Agreement
  entireAgreement: {
    id: "entire_agreement",
    title: "Entire Agreement",
    content: `These Terms, together with the Privacy Policy, any service-specific terms, and any other agreements incorporated by reference, constitute the entire agreement between you and ZIVO concerning your use of the platform. These Terms supersede all prior and contemporaneous agreements, proposals, representations, warranties, and communications, whether written or oral. No verbal agreements, representations, or warranties shall modify or supplement these Terms. Any waiver of any provision of these Terms must be in writing and signed by ZIVO.`,
    version: "1.0",
  },
};

// Helper array for all advanced clauses
export const ADVANCED_CLAUSES_LIST = Object.values(ADVANCED_LEGAL_CLAUSES);

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

// ============================================
// EXTENDED LEGAL POLICIES (Clauses 31-40)
// ============================================

export const EXTENDED_LEGAL_POLICIES = {
  // Clause 31: Acceptable Use Policy
  acceptableUse: {
    id: "acceptable_use",
    title: "Acceptable Use Policy",
    version: "1.0",
    prohibitions: [
      "Fraudulent activity or misrepresentation",
      "Creating false listings, reviews, or accounts",
      "Abuse, harassment, threats, or intimidation",
      "Circumventing platform fees or payment systems",
      "Scraping, bots, automated access, or data harvesting",
      "Illegal goods, services, or activities",
      "Impersonating others or ZIVO representatives",
      "Interfering with platform operations or security",
    ],
    enforcement: `ZIVO may suspend or terminate accounts immediately for violations without prior notice. Violators may be reported to law enforcement authorities.`,
  },

  // Clause 32: Community Standards
  communityStandards: {
    id: "community_standards",
    title: "Community Standards",
    version: "1.0",
    standards: [
      "Treat all users, drivers, owners, and partners with respect",
      "Non-discrimination based on race, religion, gender, orientation, or disability",
      "No hate speech, threats of violence, or abusive language",
      "Safety-first approach in all interactions",
      "Honest and accurate communications",
      "Respect for property and personal boundaries",
    ],
    enforcement: `Violations may result in warnings, account suspension, or permanent ban from the platform at ZIVO's sole discretion.`,
  },

  // Clause 33: No Warranty Disclaimer
  noWarranty: {
    id: "no_warranty",
    title: "No Warranty Disclaimer",
    version: "1.0",
    content: `ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. ZIVO EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. ZIVO DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT DEFECTS WILL BE CORRECTED.`,
  },

  // Clause 34: Service Availability Disclaimer
  serviceAvailability: {
    id: "service_availability",
    title: "Service Availability Disclaimer",
    version: "1.0",
    content: `ZIVO does not guarantee: (a) availability of flights, vehicles, drivers, or restaurants at any given time; (b) continuous, uninterrupted access to the platform; (c) availability of specific features or services; (d) accuracy of estimated times, prices, or availability shown on the platform. Service availability is subject to third-party provider capacity and may change without notice.`,
  },

  // Clause 35: Price & Content Accuracy Disclaimer
  priceAccuracy: {
    id: "price_accuracy",
    title: "Price & Content Accuracy Disclaimer",
    version: "1.0",
    content: `Prices, availability, images, descriptions, and other content displayed on the platform are provided by third-party service providers and may change at any time without notice. ZIVO does not guarantee the accuracy, completeness, or timeliness of any information. Prices and availability are not guaranteed until a booking is confirmed by the service provider. Final terms, prices, and availability are determined by the service provider at the time of booking.`,
  },

  // Clause 36: User-Generated Content License
  ugcLicense: {
    id: "ugc_license",
    title: "User-Generated Content License",
    version: "1.0",
    content: `By uploading, posting, or submitting any content to the platform (including photos, reviews, descriptions, and communications), you grant ZIVO a worldwide, royalty-free, perpetual, irrevocable, non-exclusive, transferable, and sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such content in any media for marketing, platform operations, and any other lawful purpose. You represent that you have all necessary rights to grant this license.`,
  },

  // Clause 37: Safety & Emergency Disclaimer
  safetyEmergency: {
    id: "safety_emergency",
    title: "Safety & Emergency Disclaimer",
    version: "1.0",
    content: `ZIVO is not responsible for accidents, injuries, loss of property, medical emergencies, or any other safety incidents arising from the use of third-party services. Users must contact local emergency services (911 in the US) immediately in case of emergency. ZIVO does not provide emergency response services. Users are responsible for their own safety and should exercise appropriate caution when using any services.`,
  },

  // Clause 38: Regulatory Cooperation Policy
  regulatoryCooperation: {
    id: "regulatory_cooperation",
    title: "Regulatory Cooperation Policy",
    version: "1.0",
    content: `ZIVO may: (a) suspend or terminate accounts to comply with applicable laws, regulations, or legal process; (b) share user data with government agencies, regulators, or law enforcement when required by law or legal process; (c) cooperate with investigations without prior notice to affected users when permitted by law. ZIVO shall not be liable for any actions taken in good faith compliance with legal or regulatory requirements.`,
  },

  // Clause 39: Payment Hold & Reserve Policy
  paymentHoldReserve: {
    id: "payment_hold_reserve",
    title: "Payment Hold & Reserve Policy",
    version: "1.0",
    content: `ZIVO may, in its sole discretion: (a) place holds on funds pending verification or dispute resolution; (b) delay payouts to service providers; (c) establish reserves against potential chargebacks, refunds, or claims; (d) withhold funds to satisfy outstanding obligations or damages. These measures may be taken to prevent fraud, mitigate risk, ensure regulatory compliance, or protect the platform and its users.`,
  },

  // Clause 40: Changes to Policies
  policyChanges: {
    id: "policy_changes",
    title: "Changes to Policies",
    version: "1.0",
    content: `ZIVO reserves the right to modify, update, or replace any policies, terms, or conditions at any time. Changes become effective upon posting to the platform unless otherwise specified. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. For material changes, ZIVO may provide additional notice via email or in-app notification, but is not required to do so. Users are responsible for reviewing policies periodically.`,
  },
};

// ============================================
// SERVICE-SPECIFIC DISCLAIMERS (Strong)
// ============================================

export const SERVICE_DISCLAIMERS = {
  flights: {
    id: "flights_disclaimer",
    title: "Flights Disclaimer",
    points: [
      "Flight schedules, routes, and aircraft are controlled exclusively by airlines",
      "ZIVO is not responsible for delays, cancellations, diversions, or overbooking",
      "Airline rules govern baggage, seating, changes, and refunds",
      "Tickets are issued by licensed ticketing providers, not ZIVO",
      "Travel documents, visas, and entry requirements are the passenger's responsibility",
    ],
    summary: `ZIVO acts as a technology platform connecting travelers with licensed ticketing partners. All flight services are subject to airline terms and conditions.`,
  },

  cars: {
    id: "cars_disclaimer",
    title: "Car Rental Disclaimer",
    points: [
      "Vehicle owners control vehicle condition, maintenance, and cleanliness",
      "Insurance coverage is subject to policy terms, conditions, and exclusions",
      "ZIVO is not liable for mechanical failure, accidents, or vehicle defects",
      "Drivers must meet owner requirements and local licensing laws",
      "Damage disputes are resolved through platform arbitration procedures",
    ],
    summary: `ZIVO connects renters with independent vehicle owners. All rental transactions are between the renter and owner.`,
  },

  rides: {
    id: "rides_disclaimer",
    title: "Rides & Move Disclaimer",
    points: [
      "Drivers are independent contractors, not ZIVO employees",
      "ZIVO does not provide transportation services directly",
      "Travel time, route, and arrival times are estimates only and not guaranteed",
      "Driver availability depends on third-party partner capacity",
      "Passengers must follow local laws and safety requirements",
    ],
    summary: `ZIVO operates a technology platform connecting riders with independent driver partners.`,
  },

  eats: {
    id: "eats_disclaimer",
    title: "Eats Disclaimer",
    points: [
      "Restaurants are solely responsible for food preparation and quality",
      "ZIVO is not responsible for allergens, ingredients, or food safety",
      "Delivery times are estimates and may vary based on conditions",
      "Menu items, prices, and availability are controlled by restaurants",
      "Nutritional information is provided by restaurants and not verified by ZIVO",
    ],
    summary: `ZIVO connects customers with independent restaurant partners. All food orders are prepared by the restaurant.`,
  },
};

// ============================================
// LEGAL FAQ (DISPUTE PREVENTION)
// ============================================

export const LEGAL_FAQ = [
  {
    question: "Is ZIVO an airline, rental company, or transportation provider?",
    answer: "No. ZIVO is a technology platform that connects customers with independent service providers. ZIVO does not operate airlines, own rental vehicles, employ drivers, or operate restaurants.",
  },
  {
    question: "Who issues my flight ticket?",
    answer: "Tickets are issued by licensed airline ticketing providers under airline rules. ZIVO acts as a sub-agent facilitating the booking process.",
  },
  {
    question: "Who owns the rental cars?",
    answer: "Vehicles listed on ZIVO are owned by independent car owners or fleets, not ZIVO. Owners are responsible for vehicle condition and insurance.",
  },
  {
    question: "Does ZIVO employ drivers or restaurants?",
    answer: "No. All drivers and restaurants are independent partners or contractors. There is no employment relationship between ZIVO and any service provider.",
  },
  {
    question: "Is insurance provided by ZIVO?",
    answer: "No. Insurance and protection plans are provided by licensed third-party insurance companies. Coverage is subject to policy terms and conditions.",
  },
  {
    question: "Are prices guaranteed?",
    answer: "Prices displayed are estimates and may change. Prices are final only after booking confirmation by the service provider.",
  },
  {
    question: "Can ZIVO suspend my account?",
    answer: "Yes. ZIVO may suspend or terminate accounts at its discretion to protect the platform, other users, or comply with legal requirements.",
  },
  {
    question: "How are disputes handled?",
    answer: "Disputes are resolved through binding arbitration as outlined in the Terms of Service. Users agree to waive class action rights.",
  },
  {
    question: "Can I sue ZIVO?",
    answer: "Users agree to binding arbitration and waive the right to participate in class actions to the maximum extent permitted by law.",
  },
  {
    question: "What happens if a service is unavailable?",
    answer: "ZIVO is not liable for service interruptions, unavailability, or capacity limitations. Availability depends on third-party providers.",
  },
  {
    question: "What if I have a safety emergency?",
    answer: "Contact local emergency services (911 in the US) immediately. ZIVO does not provide emergency response services.",
  },
  {
    question: "Can ZIVO share my data with authorities?",
    answer: "Yes. ZIVO may share data with government agencies or law enforcement when required by law or legal process.",
  },
  // Advanced Lawsuit Prevention Q&A (Section G)
  {
    question: "Is ZIVO responsible if something goes wrong?",
    answer: "No. ZIVO is a technology platform and does not provide the underlying services. Responsibility lies with independent service providers.",
  },
  {
    question: "Can I hold ZIVO liable for accidents or injuries?",
    answer: "No. Responsibility lies with independent service providers to the maximum extent allowed by law. Users assume all risks.",
  },
  {
    question: "Does ZIVO guarantee safety, quality, or availability?",
    answer: "No. All services are provided by third parties 'as is' without warranties of any kind.",
  },
  {
    question: "Can ZIVO delay or hold my payout?",
    answer: "Yes. ZIVO may hold funds to prevent fraud, chargebacks, regulatory compliance, or legal risk.",
  },
  {
    question: "Can ZIVO remove my listing or account?",
    answer: "Yes. ZIVO may suspend or terminate accounts at its sole discretion without prior notice.",
  },
  {
    question: "What law applies to disputes?",
    answer: "Disputes are governed by Delaware law and resolved through binding arbitration as defined in ZIVO's Terms of Service.",
  },
  {
    question: "Can I join a class action against ZIVO?",
    answer: "No. Users waive class action rights and agree to individual arbitration where permitted by law.",
  },
  {
    question: "Is ZIVO responsible for third-party system failures?",
    answer: "No. ZIVO relies on third parties (Stripe, Duffel, insurers, maps) and is not liable for their failures or outages.",
  },
  {
    question: "Can ZIVO monitor my communications?",
    answer: "Yes. ZIVO may monitor messages to prevent fraud, abuse, and harassment. Users consent to monitoring for safety.",
  },
  {
    question: "What happens if I provide false information?",
    answer: "Providing false identity or information may result in immediate permanent ban and potential legal action.",
  },
];

// ============================================
// EXTREME LEGAL POLICIES (Clauses 43-57)
// ============================================

export const EXTREME_LEGAL_POLICIES = {
  // Clause 43: User Verification Policy
  userVerification: {
    id: "user_verification",
    title: "User Verification Policy",
    version: "1.0",
    content: `ZIVO may require identity verification at any time for security, fraud prevention, or regulatory compliance. Failure to complete verification within the specified timeframe may result in account suspension or termination. ZIVO is not liable for delays, loss of access, or missed bookings caused by pending verification. Providing false identity information constitutes fraud and will result in immediate permanent ban from the platform and potential referral to law enforcement.`,
    requirements: [
      "Government-issued photo ID may be required",
      "Verification must be completed within specified timeframe",
      "False identity results in permanent ban",
      "ZIVO not liable for verification delays",
    ],
  },

  // Clause 44: Account Security Policy
  accountSecurity: {
    id: "account_security",
    title: "Account Security Policy",
    version: "1.0",
    content: `Users are solely responsible for maintaining the confidentiality and security of their account credentials, including passwords and authentication tokens. ZIVO is not liable for unauthorized access, transactions, or losses caused by user negligence, shared credentials, or compromised devices. ZIVO may reset, lock, or terminate accounts at any time for security reasons without prior notice.`,
    userResponsibilities: [
      "Keep passwords confidential and secure",
      "Use strong, unique passwords",
      "Enable two-factor authentication when available",
      "Report suspicious activity immediately",
      "Do not share account access with others",
    ],
  },

  // Clause 45: Location & Geo-Tracking Disclosure
  locationDisclosure: {
    id: "location_disclosure",
    title: "Location & Geo-Tracking Disclosure",
    version: "1.0",
    content: `ZIVO collects, processes, and stores location data for service delivery, safety monitoring, fraud prevention, and platform improvement. Location data may be shared with service providers (drivers, owners, restaurants) involved in active bookings and with law enforcement when required. ZIVO is not liable for inaccuracies in GPS, mapping, or location data provided by devices or third-party systems.`,
    dataUsage: [
      "Real-time location for active services",
      "Historical location for safety and support",
      "Sharing with service providers during bookings",
      "Fraud prevention and risk assessment",
      "Compliance with law enforcement requests",
    ],
  },

  // Clause 46: Communication Monitoring Policy
  communicationMonitoring: {
    id: "communication_monitoring",
    title: "Communication Monitoring Policy",
    version: "1.0",
    content: `By using the ZIVO platform, users consent to monitoring, recording, and analysis of in-app communications (messages, calls, photos) for fraud prevention, safety enforcement, and platform compliance. ZIVO is not responsible for the content of user-generated communications. Violations of communication policies may result in immediate account termination.`,
    scope: [
      "In-app messages between users and providers",
      "Support communications",
      "Reviews and ratings",
      "Uploaded photos and documents",
      "Audio communications where applicable",
    ],
  },

  // Clause 47: Platform Availability & Maintenance Policy
  platformAvailability: {
    id: "platform_availability",
    title: "Platform Availability & Maintenance Policy",
    version: "1.0",
    content: `The ZIVO platform may be unavailable due to scheduled maintenance, emergency repairs, security incidents, or system failures. ZIVO does not guarantee any specific uptime, availability, or service level. ZIVO is not liable for losses, missed bookings, or damages caused by platform downtime. No Service Level Agreement (SLA) is provided to users or partners.`,
    notice: "ZIVO may perform maintenance at any time without prior notice.",
  },

  // Clause 48: Third-Party Service Dependency Policy
  thirdPartyDependency: {
    id: "third_party_dependency",
    title: "Third-Party Service Dependency Policy",
    version: "1.0",
    content: `ZIVO relies on third-party services including payment processors (Stripe), ticketing providers (Duffel), insurance partners, mapping services, cloud infrastructure, and communication providers. ZIVO is not responsible for failures, outages, errors, or service degradation caused by third-party systems. Users accept all risks associated with third-party service dependencies.`,
    thirdParties: [
      "Payment processing (Stripe)",
      "Flight ticketing (Duffel and partners)",
      "Insurance providers",
      "Mapping and navigation services",
      "Cloud infrastructure providers",
      "Communication services",
    ],
  },

  // Clause 49: Government Sanctions & Export Control
  sanctionsCompliance: {
    id: "sanctions_compliance",
    title: "Government Sanctions & Export Control Policy",
    version: "1.0",
    content: `Users must comply with all applicable U.S. sanctions laws, export controls, and trade restrictions. ZIVO may block access from sanctioned countries, regions, or individuals identified on government watchlists. ZIVO may terminate accounts without notice to comply with sanctions requirements. Users represent that they are not located in, under the control of, or a national of any sanctioned jurisdiction.`,
    restrictions: [
      "No access from OFAC-sanctioned countries",
      "No transactions with sanctioned individuals or entities",
      "Account termination without notice for violations",
      "Cooperation with government enforcement",
    ],
  },

  // Clause 50: Minimum Age & Legal Capacity
  agePolicy: {
    id: "age_policy",
    title: "Minimum Age & Legal Capacity Policy",
    version: "1.0",
    content: `Users must be at least 18 years of age and have full legal capacity to enter binding contracts in their jurisdiction. By using ZIVO, users represent and warrant that they meet these requirements. ZIVO is not responsible for use by minors or individuals lacking legal capacity. Accounts discovered to be operated by minors will be terminated immediately.`,
  },

  // Clause 51-53: High-Risk Disclaimers
  highRiskDisclaimers: {
    id: "high_risk_disclaimers",
    title: "High-Risk Disclaimers",
    version: "1.0",
    noProfessionalAdvice: `ZIVO does not provide legal advice, financial advice, travel advice, insurance advice, or any other professional guidance. All decisions made by users are at their own risk. Users should consult qualified professionals before making important decisions.`,
    safetyEquipment: `ZIVO does not guarantee vehicle safety equipment, driver training standards, food handling procedures, or any other safety measures. Responsibility for safety lies solely with independent service providers.`,
    weatherEnvironment: `ZIVO is not responsible for weather delays, road conditions, natural disasters, environmental hazards, or any other external factors affecting services.`,
  },

  // Clause 54: Partner Terms Acceptance
  partnerTerms: {
    id: "partner_terms",
    title: "Partner Terms & Acknowledgments",
    version: "1.0",
    content: `All partners (drivers, car owners, fleet owners, restaurants) must accept role-specific terms acknowledging independent contractor status, tax responsibilities, insurance requirements, and liability limitations. Partners are not employees, agents, or representatives of ZIVO.`,
    acknowledgments: [
      "Independent contractor status (not employment)",
      "Sole responsibility for tax reporting and payment",
      "Requirement to maintain adequate insurance",
      "Compliance with all applicable laws and regulations",
      "No authority to bind or represent ZIVO",
    ],
  },

  // Clause 55: Tax Responsibility Disclaimer
  taxResponsibility: {
    id: "tax_responsibility",
    title: "Tax Responsibility Disclaimer",
    version: "1.0",
    content: `ZIVO does not withhold taxes from partner payouts except where required by law. Partners are solely responsible for reporting all income to tax authorities and paying all applicable taxes. ZIVO does not provide tax advice. ZIVO may issue tax forms (1099s) as required by law.`,
  },

  // Clause 56: Automatic Risk Flags
  automaticRiskFlags: {
    id: "automatic_risk_flags",
    title: "Automatic Risk Detection & Response",
    version: "1.0",
    content: `ZIVO employs automated systems to detect fraud, abuse, and risk. When risk is detected, ZIVO may automatically: freeze accounts, delay or hold payouts, require additional verification, limit platform access, or terminate accounts. These actions may occur without prior notice and ZIVO is not liable for any resulting losses or inconvenience.`,
    automaticActions: [
      "Account freezing or suspension",
      "Payout delays or holds",
      "Mandatory re-verification",
      "Transaction limits or restrictions",
      "Immediate account termination",
    ],
  },

  // Clause 57: Survival of Protections
  survivalClause: {
    id: "survival_clause",
    title: "Survival of Legal Protections",
    version: "1.0",
    content: `All liability limitations, indemnification obligations, warranty disclaimers, arbitration agreements, and other legal protections in these terms shall survive: account termination, service discontinuation, platform closure, and resolution of any disputes. These protections remain in effect indefinitely.`,
  },
};

// ============================================
// ULTRA-LEVEL LEGAL POLICIES (Clauses 58-74)
// ============================================

export const ULTRA_LEGAL_POLICIES = {
  // Clause 58: Consumer Disclosure Policy
  consumerDisclosures: {
    id: "consumer_disclosures",
    title: "Consumer Disclosure Policy",
    version: "1.0",
    content: `ZIVO provides transparent disclosures of all prices, fees, taxes, and service terms prior to checkout. Users are responsible for reviewing all details before completing any purchase. ZIVO is not liable for user misunderstanding after acceptance of terms.`,
    disclosures: [
      "Total prices shown before payment",
      "All applicable fees and taxes disclosed",
      "Cancellation and refund policies displayed",
      "Service terms provided before booking",
      "Partner information available at checkout",
    ],
  },

  // Clause 59: Unfair Practices Disclaimer
  unfairPracticesDisclaimer: {
    id: "unfair_practices",
    title: "Unfair Practices Disclaimer",
    version: "1.0",
    content: `ZIVO disclaims liability for pricing errors, inventory errors, or service descriptions provided by third-party partners. Corrections may be made at any time without obligation to honor erroneous prices or terms.`,
    disclaimers: [
      "Pricing errors caused by third parties",
      "Inventory or availability errors",
      "Service descriptions provided by partners",
      "Technical glitches affecting displayed information",
    ],
  },

  // Clause 60: Cooling-Off Rights Disclaimer
  coolingOffDisclaimer: {
    id: "cooling_off",
    title: "Cooling-Off Rights Disclaimer",
    version: "1.0",
    content: `Where permitted by law, there is no automatic right to cancel digital services. Flights, rentals, rides, and deliveries may be non-refundable once booked. All refunds are governed strictly by posted policies and partner terms.`,
  },

  // Clause 61: Advertising & Marketing Disclaimer
  advertisingDisclaimer: {
    id: "advertising",
    title: "Advertising & Marketing Disclaimer",
    version: "1.0",
    content: `All marketing content is informational only and does not constitute a binding offer. Prices, availability, and promotions are subject to change without notice. Actual terms are confirmed only at checkout.`,
  },

  // Clause 62: Payment Processor Reliance Policy
  paymentProcessors: {
    id: "payment_processors",
    title: "Payment Processor Reliance Policy",
    version: "1.0",
    content: `All payments are processed by third-party payment processors (Stripe, banks, and card networks). ZIVO is not liable for processor outages, payment holds, or delays caused by payment systems. Chargebacks are governed by processor and card network rules.`,
    processors: [
      "Stripe payment processing",
      "Bank and card network processing",
      "Third-party fraud detection systems",
      "Currency conversion services",
    ],
  },

  // Clause 63: Funds Hold & Reserve Rights
  fundsHoldRights: {
    id: "funds_hold",
    title: "Funds Hold & Reserve Rights",
    version: "1.0",
    content: `ZIVO may place rolling reserves, delay payouts, or withhold funds to manage fraud risk, chargeback exposure, regulatory compliance, or legal obligations. Funds may be held for extended periods as necessary.`,
    actions: [
      "Place rolling reserves on partner payouts",
      "Delay payouts pending verification",
      "Withhold funds during disputes or investigations",
      "Offset funds for chargebacks or fees owed",
    ],
  },

  // Clause 64: Currency & Exchange Disclaimer
  currencyDisclaimer: {
    id: "currency",
    title: "Currency & Exchange Disclaimer",
    version: "1.0",
    content: `Exchange rates shown are estimates only. Final amounts may vary based on bank conversion rates, processing fees, and timing. ZIVO is not responsible for foreign exchange fluctuations or conversion fees charged by banks.`,
  },

  // Clause 65: AI & Recommendation Disclaimer
  aiDisclosure: {
    id: "ai_disclosure",
    title: "AI & Recommendation Disclaimer",
    version: "1.0",
    content: `ZIVO uses artificial intelligence and machine learning to provide recommendations, rankings, pricing suggestions, and other features. AI features provide suggestions only with no guarantees of outcomes. AI decisions may be incorrect, incomplete, or not suited to user needs. Users remain solely responsible for all final decisions.`,
    aiFeatures: [
      "Search rankings and recommendations",
      "Dynamic pricing suggestions",
      "Fraud detection and risk scoring",
      "Personalized content and offers",
      "Trip planning and itinerary suggestions",
    ],
  },

  // Clause 66: No Automated Decision Liability
  automatedDecisionDisclaimer: {
    id: "automated_decisions",
    title: "No Automated Decision Liability",
    version: "1.0",
    content: `ZIVO is not liable for outcomes resulting from automated systems, including search rankings, dynamic pricing, fraud flags, account restrictions, or personalization. Users may request human review of significant automated decisions where required by law.`,
  },

  // Clause 67: Cross-Border Service Disclaimer
  crossBorderDisclaimer: {
    id: "cross_border",
    title: "Cross-Border Service Disclaimer",
    version: "1.0",
    content: `Services may differ by country and jurisdiction. ZIVO is not responsible for local regulatory conflicts, service availability differences, or legal requirements that vary by location. Users are responsible for understanding applicable laws in their jurisdiction.`,
    considerations: [
      "Service availability varies by region",
      "Local laws may affect terms",
      "Regulatory requirements differ by jurisdiction",
      "Consumer protection laws vary by country",
    ],
  },

  // Clause 68: Customs, Immigration & Travel Law Disclaimer
  travelLawDisclaimer: {
    id: "travel_law",
    title: "Customs, Immigration & Travel Law Disclaimer",
    version: "1.0",
    content: `ZIVO is not responsible for visa requirements, immigration denial, customs issues, border restrictions, or any travel-related legal requirements. Users are solely responsible for ensuring they have proper documentation and authorization to travel.`,
    notResponsibleFor: [
      "Visa application or approval",
      "Immigration or border denial",
      "Customs duties or seizures",
      "Passport validity requirements",
      "Health documentation requirements",
      "Travel advisories or restrictions",
    ],
  },

  // Clause 69: Anti-Circumvention Policy
  antiCircumvention: {
    id: "anti_circumvention",
    title: "Anti-Circumvention Policy",
    version: "1.0",
    content: `Users may not bypass ZIVO payment systems, contact partners off-platform to avoid fees, or circumvent any platform mechanisms. Violations result in immediate account termination and potential legal action.`,
    prohibitions: [
      "Bypassing ZIVO payment processing",
      "Contacting partners off-platform for direct deals",
      "Avoiding service or transaction fees",
      "Manipulating pricing or availability displays",
      "Using automation to gain unfair advantages",
    ],
  },

  // Clause 70: Fraud Zero-Tolerance Policy
  fraudPolicy: {
    id: "fraud_policy",
    title: "Fraud Zero-Tolerance Policy",
    version: "1.0",
    content: `ZIVO maintains a zero-tolerance policy for fraud. Fraudulent activity results in immediate permanent ban, seizure of any pending funds, and referral to law enforcement. ZIVO may share fraud data with partners and authorities.`,
    consequences: [
      "Immediate permanent account termination",
      "Seizure of pending payouts and funds",
      "Referral to law enforcement agencies",
      "Civil liability for damages",
      "Sharing of fraud data with partners and networks",
    ],
  },

  // Clause 71: Blacklisting & Watchlist Rights
  blacklistingRights: {
    id: "blacklisting",
    title: "Blacklisting & Watchlist Rights",
    version: "1.0",
    content: `ZIVO may maintain internal risk lists, block repeat offenders, share data with fraud prevention networks, and cooperate with industry watchlists as legally permitted.`,
  },

  // Clause 72: Service Suspension Rights
  serviceSuspensionRights: {
    id: "service_suspension",
    title: "Service Suspension Rights",
    version: "1.0",
    content: `ZIVO may suspend individual services, entire regions, or specific accounts at any time without liability. Suspensions may be temporary or permanent based on risk assessment, regulatory requirements, or business decisions.`,
  },

  // Clause 73: Platform Evolution Clause
  platformEvolution: {
    id: "platform_evolution",
    title: "Platform Evolution Clause",
    version: "1.0",
    content: `ZIVO may add, modify, or remove features, change business models, rebrand services, or fundamentally alter the platform at any time. Users accept all future changes by continuing to use the platform.`,
  },

  // Clause 74: Survival of Disclaimers
  disclaimerSurvival: {
    id: "disclaimer_survival",
    title: "Survival of All Disclaimers",
    version: "1.0",
    content: `All disclaimers, liability limitations, waivers, indemnification obligations, and legal protections in these policies survive: account termination, service discontinuation, platform shutdown, and resolution of any disputes. These protections remain in effect indefinitely.`,
  },
};

// Ultra-level FAQ additions
export const ULTRA_LEGAL_FAQ = [
  {
    question: "Is ZIVO legally responsible for service failures?",
    answer: "No. Services are provided by independent third parties. ZIVO provides a technology platform only.",
  },
  {
    question: "Can ZIVO hold or delay my money?",
    answer: "Yes. ZIVO may hold, delay, or withhold funds to manage risk, fraud, chargebacks, or legal obligations.",
  },
  {
    question: "Does ZIVO guarantee prices, availability, or safety?",
    answer: "No. All services are provided 'as is' without warranties. Prices and availability are subject to change.",
  },
  {
    question: "Can ZIVO cooperate with governments or police?",
    answer: "Yes. ZIVO may share data and cooperate with law enforcement, regulators, and government agencies when required by law.",
  },
  {
    question: "Can ZIVO change or shut down services?",
    answer: "Yes. ZIVO may modify, suspend, or discontinue any service at any time without liability.",
  },
  {
    question: "Is ZIVO responsible for AI recommendations?",
    answer: "No. AI features provide suggestions only. Users are responsible for all final decisions.",
  },
  {
    question: "Can ZIVO ban me permanently?",
    answer: "Yes. ZIVO may terminate accounts permanently for fraud, policy violations, or at its discretion.",
  },
  {
    question: "Is ZIVO responsible for visa or immigration issues?",
    answer: "No. Users are solely responsible for travel documentation, visas, and immigration requirements.",
  },
];

// ============================================
// ADVANCED LEGAL POLICIES (Clauses 75-92)
// Labor, Antitrust, Accessibility, AI Law, Platform Governance
// ============================================

export const ADVANCED_PLATFORM_POLICIES = {
  // Clause 75: Independent Contractor Acknowledgment
  contractorStatus: {
    id: "contractor_status",
    title: "Independent Contractor Status",
    version: "1.0",
    content: `All partners (drivers, car owners, fleets, restaurants) acknowledge and agree that they are independent contractors, not employees. Partners control their own schedules, provide their own tools and assets, bear their own business expenses, may work with competitors, and have no exclusivity arrangement with ZIVO.`,
    acknowledgments: [
      "Control over own schedule and working hours",
      "Provision of own tools, equipment, and assets",
      "Responsibility for own business expenses",
      "Freedom to work with competing platforms",
      "No exclusivity or minimum commitment required",
      "Independent business operation",
    ],
  },

  // Clause 76: No Benefits / No Wages Clause
  noBenefits: {
    id: "no_benefits",
    title: "No Benefits or Wages",
    version: "1.0",
    content: `ZIVO does not provide wages, overtime, benefits, insurance, workers' compensation, or any employment benefits to partners. All partners acknowledge their self-employment status and sole responsibility for their own taxes, insurance, and benefits.`,
    excludedBenefits: [
      "Wages or salary",
      "Overtime compensation",
      "Health insurance",
      "Retirement benefits",
      "Workers' compensation",
      "Paid time off",
      "Employment protections",
    ],
  },

  // Clause 77: No Supervision / No Control Clause
  noSupervision: {
    id: "no_supervision",
    title: "No Supervision or Control",
    version: "1.0",
    content: `ZIVO does not supervise how services are performed, does not train partners on service delivery, and does not control routes, methods, timing, or performance standards. Partners retain full autonomy over service execution.`,
  },

  // Clause 78: Platform Neutrality Policy
  platformNeutrality: {
    id: "platform_neutrality",
    title: "Platform Neutrality Policy",
    version: "1.0",
    content: `ZIVO operates as a neutral technology platform. We do not favor or discriminate unfairly among partners. Rankings are algorithmic and based on objective factors. Visibility is not guaranteed to any partner. No promise of minimum earnings, bookings, or revenue is made.`,
    principles: [
      "Neutral platform operation",
      "Algorithmic ranking based on objective factors",
      "No guaranteed visibility or placement",
      "No promise of minimum earnings",
      "No favoritism or unfair discrimination",
    ],
  },

  // Clause 79: No Price Fixing Disclaimer
  noPriceFixing: {
    id: "no_price_fixing",
    title: "No Price Fixing Disclaimer",
    version: "1.0",
    content: `ZIVO does not set partner prices (except for platform fees), does not coordinate pricing between partners, and does not guarantee demand, income, or revenue. Partners set their own prices independently where applicable.`,
  },

  // Clause 80: Competitor Participation Clause
  competitorParticipation: {
    id: "competitor_participation",
    title: "Competitor Participation Rights",
    version: "1.0",
    content: `Partners are free to use competing platforms, advertise their services elsewhere, and operate their businesses independently. ZIVO does not require exclusivity and does not restrict partners from competitive activities.`,
  },

  // Clause 81: Accessibility Statement
  accessibilityStatement: {
    id: "accessibility",
    title: "Accessibility Statement",
    version: "1.0",
    content: `ZIVO strives to make its platform accessible to users with disabilities. However, we do not guarantee error-free accessibility compliance at all times. Users may report accessibility issues for review. ZIVO is not liable for temporary non-compliance or third-party content accessibility.`,
    commitments: [
      "Ongoing accessibility improvements",
      "User feedback consideration",
      "Regular accessibility reviews",
      "Third-party audit consideration",
    ],
  },

  // Clause 82: Assistive Technology Disclaimer
  assistiveTechDisclaimer: {
    id: "assistive_tech",
    title: "Assistive Technology Disclaimer",
    version: "1.0",
    content: `ZIVO does not guarantee full compatibility with all screen readers, voice assistants, or third-party accessibility tools. Functionality may vary based on device, browser, and assistive technology configurations.`,
  },

  // Clause 83: Data Minimization Policy
  dataMinimization: {
    id: "data_minimization",
    title: "Data Minimization Policy",
    version: "1.0",
    content: `ZIVO collects only data necessary for providing services. We are not liable for inaccuracies in data provided by users. Users are responsible for ensuring their information is accurate and up-to-date.`,
  },

  // Clause 84: Data Portability Disclaimer
  dataPortability: {
    id: "data_portability",
    title: "Data Portability Disclaimer",
    version: "1.0",
    content: `Data export is available where legally required. ZIVO may refuse excessive, repetitive, or abusive data requests. Standard processing times apply to all data requests.`,
  },

  // Clause 85: Data Deletion Limitations
  dataDeletionLimits: {
    id: "data_deletion_limits",
    title: "Data Deletion Limitations",
    version: "1.0",
    content: `Some data cannot be deleted due to legal obligations, fraud prevention requirements, accounting rules, and regulatory compliance. ZIVO will inform users of any limitations on deletion requests.`,
    retentionReasons: [
      "Legal and regulatory obligations",
      "Fraud prevention and security",
      "Accounting and tax requirements",
      "Dispute resolution records",
      "Safety and compliance records",
    ],
  },

  // Clause 86: No Solely Automated Decisions
  noSolelyAutomated: {
    id: "no_solely_automated",
    title: "No Solely Automated Decisions",
    version: "1.0",
    content: `ZIVO does not make decisions solely by AI or automation that produce significant legal effects on users without opportunity for human review. Users may request human review of significant automated decisions where required by law.`,
  },

  // Clause 87: AI Bias Disclaimer
  aiBiasDisclaimer: {
    id: "ai_bias",
    title: "AI Bias Disclaimer",
    version: "1.0",
    content: `Algorithms may reflect user behavior, market conditions, and historical patterns. ZIVO does not guarantee neutrality, fairness, or absence of bias in AI outcomes. AI systems are continuously improved but may contain inherent limitations.`,
  },

  // Clause 88: Mass Arbitration Rules
  massArbitrationRules: {
    id: "mass_arbitration",
    title: "Mass Arbitration Rules",
    version: "1.0",
    content: `If multiple similar claims arise, each claim must be resolved individually. Filing fees are allocated per claimant. No consolidated or class-wide arbitration is permitted. Sequential batching may apply to mass filings.`,
    rules: [
      "Individual claim resolution required",
      "Per-claimant filing fee allocation",
      "No consolidated arbitration",
      "Sequential batch processing for mass filings",
    ],
  },

  // Clause 89: Pre-Dispute Resolution Requirement
  preDisputeRequirement: {
    id: "pre_dispute",
    title: "Pre-Dispute Resolution Requirement",
    version: "1.0",
    content: `Before filing any formal dispute or arbitration, users must first contact ZIVO support and allow a reasonable period for informal resolution. Failure to follow this process may result in dismissal of claims.`,
    steps: [
      "Contact ZIVO support with detailed complaint",
      "Allow 30 days for informal resolution",
      "Participate in good-faith negotiation",
      "Proceed to formal dispute only if unresolved",
    ],
  },

  // Clause 90: Platform Rule Enforcement
  ruleEnforcement: {
    id: "rule_enforcement",
    title: "Platform Rule Enforcement",
    version: "1.0",
    content: `ZIVO may enforce platform rules automatically, manually, or retroactively. Enforcement decisions are at ZIVO's discretion and may include warnings, restrictions, suspensions, or permanent removal.`,
  },

  // Clause 91: Emergency Action Clause
  emergencyAction: {
    id: "emergency_action",
    title: "Emergency Action Rights",
    version: "1.0",
    content: `ZIVO may take immediate action without prior notice to suspend accounts, freeze funds, remove listings, or restrict access when safety, legal, or fraud risks are detected. Emergency actions may be taken to protect users, partners, or the platform.`,
    emergencyActions: [
      "Immediate account suspension",
      "Funds freeze pending investigation",
      "Listing removal without notice",
      "Access restriction for safety",
      "Cooperation with authorities",
    ],
  },

  // Clause 92: Survival of Advanced Protections
  advancedProtectionSurvival: {
    id: "advanced_survival",
    title: "Survival of Advanced Protections",
    version: "1.0",
    content: `All labor, antitrust, AI, neutrality, and governance protections in these policies survive: account termination, partner offboarding, service discontinuation, and resolution of any legal disputes. These protections remain in effect indefinitely.`,
  },
};

// Advanced FAQ for edge cases
export const ADVANCED_LEGAL_FAQ = [
  {
    question: "Is ZIVO my employer?",
    answer: "No. All partners are independent businesses. ZIVO is a technology platform only.",
  },
  {
    question: "Does ZIVO control how services are performed?",
    answer: "No. ZIVO provides software only. Partners control their own methods, schedules, and service delivery.",
  },
  {
    question: "Can ZIVO guarantee earnings or bookings?",
    answer: "No. ZIVO does not guarantee any minimum earnings, bookings, or revenue to partners.",
  },
  {
    question: "Does ZIVO manipulate prices?",
    answer: "No. Prices are set by partners or third parties. ZIVO does not engage in price fixing.",
  },
  {
    question: "Can ZIVO block access to the platform?",
    answer: "Yes. ZIVO may suspend or terminate access at its discretion for safety, compliance, or policy reasons.",
  },
  {
    question: "Is ZIVO responsible for accessibility issues?",
    answer: "ZIVO strives for accessibility but does not guarantee full compliance in all cases. Users may report issues for review.",
  },
  {
    question: "Can I request my data be deleted?",
    answer: "Some data may be retained for legal, fraud prevention, or accounting reasons even after deletion requests.",
  },
  {
    question: "Are AI decisions final?",
    answer: "Users may request human review of significant automated decisions where legally required.",
  },
];

// Helper arrays
export const ADVANCED_POLICIES_LIST = Object.values(ADVANCED_PLATFORM_POLICIES);
export const ULTRA_POLICIES_LIST = Object.values(ULTRA_LEGAL_POLICIES);
export const EXTREME_POLICIES_LIST = Object.values(EXTREME_LEGAL_POLICIES);
export const EXTENDED_POLICIES_LIST = Object.values(EXTENDED_LEGAL_POLICIES);

// Summary of all legal protections for display
export const LEGAL_PROTECTION_SUMMARY = {
  liabilityShield: [
    "Platform disclaimer (technology only)",
    "No agency/employment relationship",
    "Assumption of risk by users",
    "Release of liability",
    "Damage cap ($100 or 12-month payment, whichever is lower)",
    "No warranty disclaimer",
    "Service availability disclaimer",
  ],
  disputeResolution: [
    "Binding arbitration required",
    "Class action waiver",
    "Jury trial waiver",
    "30-day opt-out procedure for transparency",
    "Delaware governing law",
    "Pre-dispute resolution requirement",
    "Mass arbitration rules",
  ],
  operationalProtection: [
    "Force majeure (expanded coverage)",
    "Third-party beneficiary rights for partners",
    "Service modification rights",
    "Termination without cause",
    "Government compliance clause",
    "Payment hold & reserve rights",
    "Policy change rights",
    "Emergency action rights",
  ],
  contentProtection: [
    "User content disclaimer",
    "Intellectual property protection",
    "Anti-scraping provisions",
    "Severability and survival clauses",
    "Entire agreement clause",
    "UGC license for marketing",
    "Price & content accuracy disclaimer",
  ],
  communityCompliance: [
    "Acceptable use policy",
    "Community standards",
    "Safety & emergency disclaimer",
    "Regulatory cooperation policy",
  ],
  extremeProtection: [
    "User verification enforcement",
    "Account security responsibility",
    "Location tracking disclosure",
    "Communication monitoring consent",
    "Third-party dependency acceptance",
    "Sanctions compliance",
    "Automatic risk response",
    "Survival of protections",
  ],
  ultraProtection: [
    "Consumer disclosure transparency",
    "AI & automation disclaimer",
    "Cross-border risk insulation",
    "Payment processor reliance",
    "Fraud zero-tolerance enforcement",
    "Service suspension rights",
    "Platform evolution rights",
    "Disclaimer survival clause",
  ],
  advancedProtection: [
    "Independent contractor acknowledgment",
    "No employment benefits clause",
    "Platform neutrality policy",
    "No price fixing disclaimer",
    "Accessibility statement",
    "Data minimization & portability",
    "AI bias disclaimer",
    "Platform governance authority",
  ],
  governmentProtection: [
    "Government order compliance",
    "Regulatory interpretation disclaimer",
    "Emergency shutdown authority",
    "Content removal rights",
    "Safety incident disclaimer",
    "No endorsement disclaimer",
    "Marketplace volatility warning",
    "Corporate event survival",
  ],
};

// ============================================
// GOVERNMENT & SHUTDOWN POLICIES (Clauses 93-108)
// Government Enforcement, Shutdown Defense, Content Law, Safety
// ============================================

export const GOVERNMENT_SHUTDOWN_POLICIES = {
  // Clause 93: Government Order Compliance
  governmentOrders: {
    id: "government_orders",
    title: "Government Order Compliance",
    version: "1.0",
    content: `ZIVO may comply immediately with government orders, subpoenas, court orders, or regulatory directives. ZIVO is not required to notify users before compliance. ZIVO is not liable for any losses caused by compliance with legal requirements. Services may be restricted, modified, or suspended by region to comply with local laws.`,
    complianceActions: [
      "Immediate compliance with court orders",
      "Response to regulatory subpoenas",
      "Regional service restrictions",
      "Data disclosure as required by law",
      "Account actions per government directive",
    ],
  },

  // Clause 94: Regulatory Interpretation Disclaimer
  regulatoryInterpretation: {
    id: "regulatory_interpretation",
    title: "Regulatory Interpretation Disclaimer",
    version: "1.0",
    content: `ZIVO interprets applicable laws and regulations in good faith based on available guidance. ZIVO is not liable for changes in regulatory interpretation, enforcement priorities, or future legal developments. Users accept that legal requirements may evolve and ZIVO's policies will adapt accordingly.`,
  },

  // Clause 95: No Regulatory Guarantee
  noRegulatoryGuarantee: {
    id: "no_regulatory_guarantee",
    title: "No Regulatory Guarantee",
    version: "1.0",
    content: `ZIVO does not guarantee regulatory approval, continued legality in all jurisdictions, or availability of services under future laws. Legal status may vary by location and may change without notice. Users are responsible for ensuring their use of ZIVO complies with local laws.`,
    noGuarantees: [
      "Regulatory approval in any jurisdiction",
      "Continued legality of services",
      "Availability under future laws",
      "Licensing in all regions",
      "Compliance with evolving regulations",
    ],
  },

  // Clause 96: Emergency Shutdown Authority
  emergencyShutdown: {
    id: "emergency_shutdown",
    title: "Emergency Shutdown Authority",
    version: "1.0",
    content: `ZIVO may disable all or part of the platform, freeze transactions, suspend payouts, and remove listings immediately if legal, safety, financial, or reputational risk is detected. This authority exists to protect users, partners, and the platform.`,
    shutdownActions: [
      "Disable platform services (partial or full)",
      "Freeze all transactions",
      "Suspend partner payouts",
      "Remove listings without notice",
      "Restrict access by region or user type",
    ],
  },

  // Clause 97: No Liability for Shutdown
  noShutdownLiability: {
    id: "no_shutdown_liability",
    title: "No Liability for Shutdown",
    version: "1.0",
    content: `ZIVO is not liable for lost profits, missed bookings, business interruption, consequential damages, or any losses caused by platform shutdowns, suspensions, or service restrictions. Users and partners assume all risks associated with platform availability.`,
  },

  // Clause 98: Platform Communication Disclaimer
  communicationDisclaimer: {
    id: "communication_disclaimer",
    title: "Platform Communication Disclaimer",
    version: "1.0",
    content: `ZIVO is not responsible for messages between users, miscommunication, misunderstandings, language translation errors, or any disputes arising from communications on the platform. Users are solely responsible for their communications.`,
  },

  // Clause 99: Content Removal Rights
  contentRemoval: {
    id: "content_removal",
    title: "Content Removal Rights",
    version: "1.0",
    content: `ZIVO may remove listings, reviews, messages, profiles, or any user-generated content at its sole discretion, without prior notice or explanation. Content decisions are final and not subject to appeal except where required by law.`,
    removalScope: [
      "Listings and service offerings",
      "Reviews and ratings",
      "Messages and communications",
      "Profile information",
      "Photos and media",
    ],
  },

  // Clause 100: Defamation & Review Disclaimer
  defamationDisclaimer: {
    id: "defamation_disclaimer",
    title: "Defamation & Review Disclaimer",
    version: "1.0",
    content: `ZIVO is not liable for reviews, ratings, opinions, allegations, or statements made by users. ZIVO does not verify the accuracy of user-generated content and provides a neutral platform for communication. Disputes about reviews are between the parties involved.`,
  },

  // Clause 101: Safety Incident Disclaimer
  safetyIncidentDisclaimer: {
    id: "safety_incident",
    title: "Safety Incident Disclaimer",
    version: "1.0",
    content: `ZIVO is not liable for crimes, assaults, theft, injuries, accidents, property damage, or any other incidents occurring during use of the platform or services arranged through the platform. ZIVO is a technology platform only and does not provide the underlying services.`,
    excludedLiability: [
      "Criminal acts by any party",
      "Physical assaults or injuries",
      "Theft of property or valuables",
      "Accidents during service delivery",
      "Property damage",
      "Personal injury claims",
    ],
  },

  // Clause 102: No Background Check Guarantee
  noBackgroundGuarantee: {
    id: "no_background_guarantee",
    title: "No Background Check Guarantee",
    version: "1.0",
    content: `ZIVO may perform background checks, identity verification, or screening but does not guarantee the accuracy of criminal history information, identity verification results, or the safety of any individual. Background checks have inherent limitations and may not reveal all relevant information.`,
  },

  // Clause 103: No Endorsement Disclaimer
  noEndorsement: {
    id: "no_endorsement",
    title: "No Endorsement Disclaimer",
    version: "1.0",
    content: `ZIVO does not endorse, recommend, or vouch for any driver, car owner, restaurant, hotel, airline, or service provider. Presence on the platform does not constitute endorsement. Users must exercise their own judgment when selecting services.`,
    noEndorsementFor: [
      "Drivers or delivery partners",
      "Car owners or fleet operators",
      "Restaurants or food vendors",
      "Hotels or accommodations",
      "Airlines or travel providers",
      "Any third-party service provider",
    ],
  },

  // Clause 104: Public Statement Limitation
  publicStatementLimit: {
    id: "public_statement",
    title: "Public Statement Limitation",
    version: "1.0",
    content: `Only official ZIVO channels represent the company. ZIVO is not liable for statements, claims, or representations made by users, partners, drivers, or any third parties. Official statements come only from @hizivo.com email addresses or official social media accounts.`,
  },

  // Clause 105: Marketplace Volatility Disclaimer
  marketplaceVolatility: {
    id: "marketplace_volatility",
    title: "Marketplace Volatility Disclaimer",
    version: "1.0",
    content: `Users and partners acknowledge that demand may fluctuate, income is not guaranteed, listings may receive no bookings, and market conditions can change rapidly. ZIVO does not guarantee any level of business, revenue, or customer traffic.`,
    acknowledgments: [
      "Demand fluctuates based on market conditions",
      "Income and earnings are not guaranteed",
      "Listings may receive no bookings",
      "Market conditions change without notice",
      "Competition affects visibility and revenue",
    ],
  },

  // Clause 106: Unilateral Rule Enforcement
  unilateralEnforcement: {
    id: "unilateral_enforcement",
    title: "Unilateral Rule Enforcement",
    version: "1.0",
    content: `ZIVO may enforce rules without warning, apply penalties retroactively, remove access permanently, and take any action necessary to protect the platform. Enforcement decisions are at ZIVO's sole discretion and are not subject to external review.`,
  },

  // Clause 107: No Duty to Warn
  noDutyToWarn: {
    id: "no_duty_to_warn",
    title: "No Duty to Warn",
    version: "1.0",
    content: `ZIVO has no duty to warn users about risks, behavior of other users or partners, market conditions, regulatory changes, or any other matters. Users are responsible for their own due diligence and risk assessment.`,
  },

  // Clause 108: Survival After Company Events
  companyEventSurvival: {
    id: "company_event_survival",
    title: "Survival After Company Events",
    version: "1.0",
    content: `All liability protections, disclaimers, arbitration agreements, and user obligations survive: merger, acquisition, sale, bankruptcy, reorganization, dissolution, or any other corporate event. These terms bind successors and assigns.`,
    survivingEvents: [
      "Merger or consolidation",
      "Acquisition by another company",
      "Sale of assets or business",
      "Bankruptcy proceedings",
      "Corporate reorganization",
      "Dissolution of the company",
    ],
  },
};

// Extreme FAQ for government/shutdown scenarios
export const EXTREME_LEGAL_FAQ_EXTENDED = [
  {
    question: "Can ZIVO shut down services suddenly?",
    answer: "Yes. ZIVO may disable services immediately to comply with law, protect safety, or manage platform risk. No prior notice is required.",
  },
  {
    question: "Is ZIVO responsible for crimes or accidents?",
    answer: "No. ZIVO is a technology platform only. Responsibility for incidents lies with the individuals involved and relevant authorities.",
  },
  {
    question: "Can ZIVO remove my content or account?",
    answer: "Yes. ZIVO may remove any content or terminate any account at its sole discretion, without explanation.",
  },
  {
    question: "Does ZIVO guarantee legality in my country?",
    answer: "No. Laws vary by jurisdiction and may change. Users are responsible for ensuring their use complies with local laws.",
  },
  {
    question: "Can ZIVO comply with government requests without telling me?",
    answer: "Yes. ZIVO may comply with legal orders without prior notice to affected users.",
  },
  {
    question: "Is ZIVO responsible for what other users say or do?",
    answer: "No. ZIVO is not liable for user communications, reviews, or behavior.",
  },
  {
    question: "What happens to my rights if ZIVO is sold?",
    answer: "All terms and protections survive corporate events like mergers, acquisitions, or bankruptcy.",
  },
];

// Helper arrays
export const GOVERNMENT_POLICIES_LIST = Object.values(GOVERNMENT_SHUTDOWN_POLICIES);

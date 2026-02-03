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
];

// Helper array for extended policies
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
  ],
  operationalProtection: [
    "Force majeure (expanded coverage)",
    "Third-party beneficiary rights for partners",
    "Service modification rights",
    "Termination without cause",
    "Government compliance clause",
    "Payment hold & reserve rights",
    "Policy change rights",
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
};

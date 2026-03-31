import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, DollarSign, AlertTriangle, Ban, Scale, FileText, Clock, Gavel, CreditCard, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Shield,
    title: "1. General Limitation",
    content: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ZIVO LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (a) YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICES; (b) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (c) ANY CONTENT OBTAINED FROM THE SERVICES; AND (d) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT."
  },
  {
    icon: DollarSign,
    title: "2. Maximum Liability Cap",
    content: "IN NO EVENT SHALL ZIVO'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICES EXCEED THE GREATER OF: (a) THE AMOUNT YOU HAVE PAID TO ZIVO IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (b) ONE HUNDRED U.S. DOLLARS ($100.00). THIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE) AND EVEN IF ZIVO HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."
  },
  {
    icon: AlertTriangle,
    title: "3. No Liability for User Spending Decisions",
    content: "ZIVO IS NOT RESPONSIBLE OR LIABLE FOR ANY FINANCIAL DECISIONS YOU MAKE BASED ON INFORMATION DISPLAYED ON OUR PLATFORM. This includes but is not limited to: travel bookings, hotel reservations, car rentals, food orders, ride fares, membership subscriptions, tips, and any other transactions. You acknowledge that all spending decisions are made at your own discretion and risk. ZIVO does not guarantee savings, discounts, or the best available price. You agree not to hold ZIVO liable for any amount you spend on or through the platform, regardless of whether the outcome meets your expectations."
  },
  {
    icon: Ban,
    title: "4. Exclusion of Damages",
    content: "ZIVO shall not be liable for: (a) service interruptions, delays, or errors; (b) loss of data or unauthorized access to your account; (c) personal injury or property damage arising from your use of third-party services accessed via the platform; (d) disputes between you and third-party service providers (drivers, restaurants, airlines, hotels, car owners); (e) price fluctuations or availability changes; (f) acts or omissions of third-party payment processors; (g) any loss exceeding the liability cap stated in Section 2; (h) loss of revenue, anticipated profits, business, or goodwill; (i) cost of procurement of substitute goods or services; (j) any loss arising from reliance on information provided on the platform."
  },
  {
    icon: Scale,
    title: "5. Platform Role Disclaimer",
    content: "ZIVO operates as a technology platform that connects users with independent third-party service providers. ZIVO IS NOT a transportation company, airline, hotel operator, restaurant, or car rental company. We do not own, operate, or control vehicles, aircraft, hotel properties, restaurants, or rental fleets. All services are provided by independent third parties, and ZIVO disclaims all liability for the acts, omissions, quality, or safety of those services. For flights specifically, ZIVO acts solely as a search and referral service; ticketing, payment, and customer service are handled by the licensed travel partner."
  },
  {
    icon: FileText,
    title: "6. No Warranty",
    content: "THE SERVICES ARE PROVIDED ON AN 'AS IS' AND 'AS AVAILABLE' BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. ZIVO DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS."
  },
  {
    icon: Clock,
    title: "7. Statute of Limitations",
    content: "YOU AGREE THAT ANY CAUSE OF ACTION ARISING OUT OF OR RELATED TO THE SERVICES MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES. OTHERWISE, SUCH CAUSE OF ACTION IS PERMANENTLY BARRED. This limitation applies to all claims regardless of the legal theory under which they are brought."
  },
  {
    icon: Gavel,
    title: "8. Basis of the Bargain",
    content: "YOU ACKNOWLEDGE AND AGREE THAT ZIVO HAS OFFERED ITS SERVICES, SET ITS PRICES, AND ENTERED INTO THESE TERMS IN RELIANCE UPON THE WARRANTY DISCLAIMERS AND LIMITATIONS OF LIABILITY SET FORTH HEREIN. These disclaimers and limitations reflect a reasonable and fair allocation of risk between you and ZIVO, and form an essential basis of the bargain between us. ZIVO would not be able to provide the Services to you on an economically reasonable basis without these limitations."
  },
  {
    icon: CreditCard,
    title: "9. No Liability for Third-Party Charges",
    content: "ZIVO is not liable for any charges, fees, penalties, or costs imposed by third parties, including but not limited to: airline change fees, baggage fees, resort fees, parking fees, tolls, traffic violations, damage charges from car rentals, restaurant surcharges, or any taxes imposed by governmental authorities. Any such charges are your sole responsibility, and you agree to hold ZIVO harmless from all third-party imposed costs."
  },
  {
    icon: Globe,
    title: "10. International Use Limitation",
    content: "ZIVO makes no representations that the Services are appropriate or available for use in locations outside the United States. Users accessing the Services from other jurisdictions do so at their own risk and are responsible for compliance with local laws. ZIVO's liability in any jurisdiction shall not exceed the maximum amount permitted by that jurisdiction's laws, and where certain limitations are not permitted by local law, only those specific limitations shall not apply."
  },
  {
    icon: Users,
    title: "11. Multiple Claims & Cumulative Liability",
    content: "The liability caps set forth in this section apply to the aggregate of all claims you may have against ZIVO, not on a per-claim basis. Multiple claims shall not expand ZIVO's total liability beyond the limits stated in Section 2. If you bring multiple claims, the total recovery across all claims combined may not exceed the maximum liability cap. Any amounts already paid or credited to you for prior claims shall reduce the remaining available liability cap."
  },
  {
    icon: Shield,
    title: "12. Essential Purpose & Severability",
    content: "If any limitation or exclusion of liability in this section is found to be unenforceable, the remaining limitations shall continue in full force and effect. The parties agree that the limitations of liability are essential to these Terms and that in the absence of such limitations, the terms of the agreement between the parties would be substantially different. If a court determines that any limitation is unconscionable, the court shall reform the limitation to the maximum extent permissible rather than invalidating it entirely."
  },
  {
    icon: AlertTriangle,
    title: "13. Acknowledgment of Risks",
    content: "YOU EXPRESSLY ACKNOWLEDGE THAT USE OF THE SERVICES INVOLVES RISKS, INCLUDING BUT NOT LIMITED TO: physical harm, property damage, dealing with third parties, financial loss, data breaches, and dissatisfaction with services. You voluntarily assume all such risks. You further acknowledge that ZIVO has no duty to take any action regarding which users gain access to the Services, what content you access, or how you interpret or use the content. You release ZIVO from all liability for your having acquired or not acquired content through the Services."
  },
];

export default function LimitationOfLiability() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Limitation of Liability</h1>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto space-y-5 pb-20">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-semibold mb-3">
            <Shield className="h-3 w-3" /> Critical Legal Protection
          </span>
          <h2 className="text-2xl font-bold">Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 31, 2026</p>
        </div>
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4">
          <p className="text-sm leading-relaxed font-medium">PLEASE READ THIS SECTION CAREFULLY. IT LIMITS ZIVO'S LIABILITY TO YOU AND AFFECTS YOUR LEGAL RIGHTS. BY USING ZIVO, YOU AGREE TO THESE LIMITATIONS. IF YOU DO NOT AGREE, DO NOT USE THE SERVICES.</p>
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold"><Icon className="h-4 w-4 text-primary" />{s.title}</h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 text-center space-y-1">
          <p className="text-sm font-semibold">Questions about liability?</p>
          <p className="text-xs text-muted-foreground">Contact <span className="text-primary font-semibold">legal@hizivo.com</span></p>
        </div>
      </div>
    </div>
  );
}
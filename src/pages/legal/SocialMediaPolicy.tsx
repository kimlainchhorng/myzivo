import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, MessageCircle, Camera, Shield, AlertTriangle, Users, Heart, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Users,
    title: "1. Community Standards",
    content: "ZIVO's social features — including profiles, posts, stories, and comments — are designed to foster a respectful travel community. All users must treat others with dignity and respect. Harassment, bullying, hate speech, and discrimination of any kind are strictly prohibited."
  },
  {
    icon: Camera,
    title: "2. Content Guidelines",
    content: "Users are responsible for all content they share. Content must be original or properly licensed. Do not post copyrighted material, explicit/adult content, graphic violence, or misleading information. Travel photos, reviews, and experiences are encouraged. All content must comply with local laws."
  },
  {
    icon: MessageCircle,
    title: "3. Interactions & Messaging",
    content: "Be respectful in all interactions. Do not send spam, unsolicited promotions, or repetitive messages. Do not impersonate other users, ZIVO staff, or partner representatives. Report suspicious accounts or messages immediately."
  },
  {
    icon: Shield,
    title: "4. Privacy & Data",
    content: "Do not share other users' personal information (phone numbers, addresses, travel documents) without their explicit consent. Respect profile privacy settings. Screenshots of private conversations should not be shared publicly. ZIVO may moderate content to protect user privacy."
  },
  {
    icon: Heart,
    title: "5. Reviews & Ratings",
    content: "Reviews must reflect genuine experiences. Fake reviews, paid reviews (without disclosure), or reviews designed to manipulate ratings are prohibited. Constructive criticism is welcome; personal attacks against service providers are not. ZIVO reserves the right to remove fraudulent reviews."
  },
  {
    icon: Ban,
    title: "6. Prohibited Content",
    items: [
      "Illegal activity promotion or solicitation",
      "Scams, phishing, or fraudulent schemes",
      "Malware, viruses, or harmful links",
      "Spam or commercial advertising without authorization",
      "Content promoting dangerous or reckless behavior",
      "Misinformation about travel safety or regulations",
      "Impersonation of individuals or organizations",
    ]
  },
  {
    icon: AlertTriangle,
    title: "7. Enforcement",
    content: "Violations may result in content removal, temporary suspension, or permanent account termination. ZIVO reviews reported content within 24–48 hours. Repeated violations will lead to escalated consequences. Appeals can be submitted to support@hizivo.com within 14 days of action."
  },
  {
    icon: Share2,
    title: "8. Third-Party Platforms",
    content: "When sharing ZIVO content on external platforms (Instagram, TikTok, X, etc.), users must comply with both ZIVO's and the third-party platform's terms. ZIVO is not responsible for content once shared outside our platform. Linking to ZIVO services must not misrepresent our brand or partnerships."
  },
];

export default function SocialMediaPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Social Media Policy</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-semibold mb-3">
            <Share2 className="h-3 w-3" /> Community Guidelines
          </span>
          <h2 className="text-2xl font-bold text-foreground">Social Media Policy</h2>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 15, 2026</p>
        </div>

        {/* Intro */}
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            This policy governs the use of social features within the ZIVO platform. By using our social features, 
            you agree to follow these guidelines. We're committed to building a safe, inclusive travel community.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {section.title}
              </h3>
              <div className="rounded-2xl bg-card border border-border/40 p-4">
                {section.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                )}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        {/* Contact */}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Report a Concern</p>
          <p className="text-xs text-muted-foreground">
            If you encounter content that violates this policy, report it in-app or email{" "}
            <span className="text-primary font-semibold">support@hizivo.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

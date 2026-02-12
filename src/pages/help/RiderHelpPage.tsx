/**
 * Help Center Page
 * Full-service FAQ and support entry point covering all ZIVO services
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Search,
  AlertCircle,
  Ticket,
  Car,
  Wallet,
  User,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRiderTicketCount } from "@/hooks/useRiderSupport";

const helpSections = [
  { id: "trips", label: "Trips & Orders", icon: Car, category: "Trips" },
  { id: "payments", label: "Payments & Wallet", icon: Wallet, category: "Payments" },
  { id: "account", label: "Account & Login", icon: User, category: "Account" },
  { id: "promos", label: "Promos & Rewards", icon: Gift, category: "Promotions" },
] as const;

const allFAQs = [
  // Trips & Orders
  {
    category: "Trips",
    question: "How are ride fares calculated?",
    answer: "Ride fares are calculated based on distance, estimated time, current demand, and the ride type you select. You'll always see the estimated fare before confirming your ride.",
  },
  {
    category: "Trips",
    question: "My driver cancelled, what do I do?",
    answer: "If your driver cancels, we'll automatically try to match you with another available driver. You won't be charged for driver-initiated cancellations.",
  },
  {
    category: "Trips",
    question: "Where is my food order?",
    answer: "Track your order in real-time from the order detail page. You'll receive live updates as your order is prepared, picked up, and delivered to you.",
  },
  {
    category: "Trips",
    question: "How do I report a missing item from my delivery?",
    answer: "Go to your order history, tap the order, and select 'Get Help'. Choose 'Missing items' and we'll work with the restaurant to resolve it.",
  },
  {
    category: "Trips",
    question: "I left something in the car",
    answer: "Submit a 'Lost Item' ticket with your ride details. We'll contact your driver and help coordinate the return of your belongings if found.",
  },
  // Payments & Wallet
  {
    category: "Payments",
    question: "How do I add a payment method?",
    answer: "Go to Settings > Payment Methods to add a credit card, debit card, or link a digital wallet like Apple Pay or Google Pay.",
  },
  {
    category: "Payments",
    question: "How do I get a refund?",
    answer: "If you believe you were incorrectly charged, submit a support ticket with the order or ride details. Our team will review and process refunds within 5-7 business days.",
  },
  {
    category: "Payments",
    question: "Why was I charged a cancellation fee?",
    answer: "A cancellation fee may apply if you cancel after a driver has been assigned and is on their way, or if you cancel frequently. This compensates drivers for their time and fuel.",
  },
  {
    category: "Payments",
    question: "How do I check my wallet balance?",
    answer: "Your ZIVO Wallet balance is visible on the Account page and during checkout. Credits from referrals and promotions are added automatically.",
  },
  {
    category: "Payments",
    question: "When will my refund arrive?",
    answer: "Refunds typically process within 5-7 business days depending on your bank. Wallet credit refunds are instant.",
  },
  // Account & Login
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "Tap 'Forgot Password' on the login screen. We'll send a reset link to your registered email address. The link expires after 1 hour.",
  },
  {
    category: "Account",
    question: "How do I update my phone number?",
    answer: "Go to Settings > Account > Phone Number to update your contact information. A verification code will be sent to confirm the change.",
  },
  {
    category: "Account",
    question: "How do I change my email address?",
    answer: "Go to Settings > Account > Email. You'll need to verify your new email address before the change takes effect.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer: "Go to Settings > Account > Delete Account. Your account will be scheduled for deletion after a 30-day grace period. You can cancel the request within that time.",
  },
  // Promotions & Rewards
  {
    category: "Promotions",
    question: "How do I apply a promo code?",
    answer: "Enter your promo code at checkout in the 'Promo Code' field. The discount will be applied to your total if the code is valid and meets any minimum order requirements.",
  },
  {
    category: "Promotions",
    question: "How does the referral program work?",
    answer: "Share your unique referral code with friends. When they sign up and complete their first ride or order, you both receive ZIVO credits in your wallet.",
  },
  {
    category: "Promotions",
    question: "What are loyalty points and how do I earn them?",
    answer: "You earn points on every ride and order. Points unlock tier benefits like free delivery, discounts, and bonus multipliers as you progress through Explorer, Traveler, and Elite tiers.",
  },
  {
    category: "Promotions",
    question: "Do promo codes and loyalty points expire?",
    answer: "Promo codes have individual expiration dates shown when applied. Loyalty points remain active as long as you have activity within the last 12 months.",
  },
  // Safety
  {
    category: "Trips",
    question: "How do I report a safety concern?",
    answer: "For immediate emergencies, call 911. For other safety concerns, use the 'Report an Issue' button and select 'Safety Concern' as the category. Safety reports are prioritized.",
  },
  {
    category: "Trips",
    question: "How do I share my ride status?",
    answer: "During an active ride, tap the 'Share Trip' button to send your live location and ride details to trusted contacts.",
  },
];

const RiderHelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { data: ticketCount = 0 } = useRiderTicketCount();

  const filteredFaqs = allFAQs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = !selectedSection || faq.category === selectedSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Help Center</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Chat with Support */}
        <Card
          className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-primary/5 cursor-pointer hover:from-emerald-500/15 hover:to-primary/10 transition-colors"
          onClick={() => navigate("/support/chat")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-2xl">
              <MessageCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Chat with Support</h3>
              <p className="text-sm text-muted-foreground">Get instant help from our team</p>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Topic Sections - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {helpSections.map((section) => {
            const Icon = section.icon;
            const isActive = selectedSection === section.category;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(isActive ? null : section.category)}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all text-center",
                  isActive
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/50 bg-card/50 hover:border-emerald-500/20 hover:bg-emerald-500/5"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl",
                  isActive ? "bg-emerald-500/20" : "bg-emerald-500/10"
                )}>
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">
              {selectedSection
                ? `${helpSections.find((s) => s.category === selectedSection)?.label} FAQs`
                : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden border-border/50">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {faq.category}
                    </Badge>
                    <span className="font-medium text-sm truncate">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-2",
                      openIndex === index && "rotate-180"
                    )}
                  />
                </button>
                {openIndex === index && (
                  <CardContent className="pt-0 pb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No questions found matching your search.</p>
            </div>
          )}
        </div>

        {/* Report Issue */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Need more help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Can't find what you're looking for? Submit a support ticket and we'll get back to you.
                </p>
                <Button onClick={() => navigate("/help/new")} className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Tickets */}
        <button
          onClick={() => navigate("/help/tickets")}
          className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">View My Tickets</span>
          </div>
          <div className="flex items-center gap-2">
            {ticketCount > 0 && (
              <Badge variant="default" className="text-xs">
                {ticketCount}
              </Badge>
            )}
            <ChevronLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default RiderHelpPage;

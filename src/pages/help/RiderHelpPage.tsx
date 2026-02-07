/**
 * Rider Help Page
 * FAQ and support entry point for riders
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, HelpCircle, MessageCircle, Search, AlertCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRiderTicketCount } from "@/hooks/useRiderSupport";

// Mock FAQ data for riders
const riderFAQs = [
  {
    category: "Payment",
    question: "How are ride fares calculated?",
    answer: "Ride fares are calculated based on distance, estimated time, current demand, and the ride type you select. You'll always see the estimated fare before confirming your ride.",
  },
  {
    category: "Payment",
    question: "Why was I charged a cancellation fee?",
    answer: "A cancellation fee may apply if you cancel after a driver has been assigned and is on their way, or if you cancel frequently. This compensates drivers for their time and fuel.",
  },
  {
    category: "Payment",
    question: "How do I get a refund?",
    answer: "If you believe you were incorrectly charged, please submit a support ticket with the ride details. Our team will review and process refunds within 5-7 business days.",
  },
  {
    category: "Driver",
    question: "My driver cancelled, what do I do?",
    answer: "If your driver cancels, we'll automatically try to match you with another available driver. You won't be charged for driver-initiated cancellations.",
  },
  {
    category: "Driver",
    question: "How do I rate my driver?",
    answer: "After completing a ride, you'll be prompted to rate your experience. You can also rate past rides from your ride history in the app.",
  },
  {
    category: "Driver",
    question: "Can I request a specific driver?",
    answer: "Currently, driver assignments are automatic based on availability and proximity. We're working on a favorite driver feature for future updates.",
  },
  {
    category: "Safety",
    question: "How do I report a safety concern?",
    answer: "For immediate emergencies, call 911. For other safety concerns, use the 'Report an Issue' button and select 'Safety Concern' as the category. Safety reports are prioritized.",
  },
  {
    category: "Safety",
    question: "How do I share my ride status?",
    answer: "During an active ride, tap the 'Share Trip' button to send your live location and ride details to trusted contacts.",
  },
  {
    category: "Lost Item",
    question: "I left something in the car",
    answer: "Submit a 'Lost Item' ticket with your ride details. We'll contact your driver and help coordinate the return of your belongings if found.",
  },
  {
    category: "Rider",
    question: "How do I update my phone number?",
    answer: "Go to Settings > Account > Phone Number to update your contact information. A verification code will be sent to confirm the change.",
  },
  {
    category: "Rider",
    question: "How do I add a payment method?",
    answer: "Go to Settings > Payment Methods to add a credit card, debit card, or link a digital wallet like Apple Pay or Google Pay.",
  },
];

const RiderHelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: ticketCount = 0 } = useRiderTicketCount();

  const categories = [...new Set(riderFAQs.map((faq) => faq.category))];

  const filteredFaqs = riderFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            placeholder="Search FAQs..."
            className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden border-border/50"
              >
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
              <p className="text-muted-foreground">No questions found matching your search.</p>
            </div>
          )}
        </div>

        {/* Report Issue Button */}
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

        {/* View Tickets Link */}
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

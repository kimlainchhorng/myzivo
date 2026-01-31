import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HotelFAQSectionProps {
  className?: string;
}

export default function HotelFAQSection({ className }: HotelFAQSectionProps) {
  const faqs = [
    {
      question: "How do I get the best hotel rates?",
      answer: "Book in advance, be flexible with dates, and sign up for our newsletter to access member-only deals. Our price comparison feature shows you rates across 100+ booking sites to ensure you get the lowest price."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary by hotel and rate type. Many hotels offer free cancellation up to 24-48 hours before check-in. Look for 'Free Cancellation' badges when booking for maximum flexibility."
    },
    {
      question: "Can I modify my reservation after booking?",
      answer: "Yes! You can modify most reservations through your account dashboard. Changes to dates, room type, or guest count are subject to availability and may affect pricing."
    },
    {
      question: "How does the rewards program work?",
      answer: "Earn 1 point per $1 spent on bookings. Points can be redeemed for free nights, room upgrades, and exclusive experiences. Gold and Platinum members enjoy bonus points and priority support."
    },
    {
      question: "Are taxes and fees included in the displayed price?",
      answer: "Prices shown typically include room rates and taxes. Some hotels may have additional resort fees or parking charges which are clearly disclosed before you complete your booking."
    },
    {
      question: "How do I contact customer support?",
      answer: "Our 24/7 support team is available via live chat, email, or phone. Premium members enjoy priority access with average response times under 2 minutes."
    },
  ];

  return (
    <section className={cn("py-10 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help Center
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about booking hotels with ZIVO
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border/30">
                    <AccordionTrigger className="text-left hover:no-underline py-4 text-sm sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" className="touch-manipulation active:scale-[0.98]">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

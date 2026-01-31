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

interface FlightFAQSectionProps {
  className?: string;
}

export default function FlightFAQSection({ className }: FlightFAQSectionProps) {
  const faqs = [
    {
      question: "How does ZIVO find cheap flights?",
      answer: "ZIVO searches across 500+ airlines and travel sites in real-time to compare prices. Our algorithms identify the best deals, including hidden city fares and error fares, to help you save up to 60% on airfare."
    },
    {
      question: "Does ZIVO sell tickets directly?",
      answer: "No, ZIVO is a flight comparison platform. We help you find and compare the best prices, then redirect you to the airline or booking site of your choice to complete your purchase. This ensures you get the best available rate."
    },
    {
      question: "How do price alerts work?",
      answer: "Set an alert for any route and we'll monitor prices 24/7. When prices drop or a great deal appears, we'll send you an instant notification via email or push notification so you never miss a bargain."
    },
    {
      question: "Why do prices change so frequently?",
      answer: "Airlines use dynamic pricing based on demand, time until departure, competition, and other factors. Prices can change multiple times per day. That's why we recommend booking quickly when you find a good deal."
    },
    {
      question: "What does 'flexible dates' mean?",
      answer: "Our flexible dates feature shows you prices for days before and after your selected dates. This helps you find the cheapest days to fly, which can often save you hundreds of dollars."
    },
    {
      question: "Are there hidden fees?",
      answer: "We display all-in prices including taxes and basic fees. However, airlines may charge extra for checked bags, seat selection, or other add-ons. These are clearly shown on the airline's booking page."
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
            Flight Search FAQs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Common questions about finding and booking flights with ZIVO
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
            <p className="text-muted-foreground mb-4">Have more questions?</p>
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

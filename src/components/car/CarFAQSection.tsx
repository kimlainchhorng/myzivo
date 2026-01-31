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

interface CarFAQSectionProps {
  className?: string;
}

export default function CarFAQSection({ className }: CarFAQSectionProps) {
  const faqs = [
    {
      question: "What documents do I need to rent a car?",
      answer: "You'll need a valid driver's license (held for at least 1 year), a credit card in the driver's name, and a valid ID or passport. International renters may need an International Driving Permit depending on the location."
    },
    {
      question: "Is insurance included in the rental price?",
      answer: "Basic liability insurance is typically included. We recommend adding collision damage waiver (CDW) and theft protection for comprehensive coverage. You can add these during booking or use your own travel insurance."
    },
    {
      question: "Can I return the car to a different location?",
      answer: "Yes, one-way rentals are available at most locations. Additional fees may apply depending on the distance between pickup and drop-off points. Check the 'Different return location' option when searching."
    },
    {
      question: "What is the minimum age to rent a car?",
      answer: "The minimum age is typically 21-25 depending on the rental company and vehicle type. Drivers under 25 may incur a young driver surcharge. Some luxury and specialty vehicles require drivers to be 25+."
    },
    {
      question: "How do I add an additional driver?",
      answer: "Additional drivers can be added during booking or at pickup. They must meet the same requirements as the primary driver and present their license. Spouses may be added free of charge at participating locations."
    },
    {
      question: "What happens if I return the car late?",
      answer: "Most companies offer a 29-59 minute grace period. After that, you may be charged for an extra hour or full day. If you know you'll be late, contact the rental location to avoid additional charges."
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
            Car Rental FAQs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about renting a car with ZIVO
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
            <p className="text-muted-foreground mb-4">Need more help?</p>
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

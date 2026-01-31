import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MessageCircle, Phone, Mail, Car, UtensilsCrossed, Plane, Hotel, Key, ChevronRight, HelpCircle, FileText, Shield, CreditCard, Star, AlertTriangle, User, ChevronLeft, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    { icon: Car, label: "Rides", color: "from-primary to-teal-400", href: "#rides" },
    { icon: UtensilsCrossed, label: "Food", color: "from-eats to-orange-500", href: "#eats" },
    { icon: Key, label: "Rental", color: "from-violet-500 to-purple-500", href: "#rental" },
    { icon: Plane, label: "Flights", color: "from-sky-500 to-blue-500", href: "#flights" },
    { icon: Hotel, label: "Hotels", color: "from-amber-500 to-orange-500", href: "#hotels" },
    { icon: User, label: "Account", color: "from-pink-500 to-rose-500", href: "#account" },
  ];

  const popularArticles = [
    { title: "How to request a refund", category: "Billing", views: "12.5K" },
    { title: "My driver cancelled - what do I do?", category: "Rides", views: "8.2K" },
    { title: "Track my food delivery in real-time", category: "Eats", views: "7.8K" },
    { title: "Change or cancel my hotel booking", category: "Hotels", views: "6.4K" },
    { title: "Add or update payment methods", category: "Account", views: "5.9K" },
    { title: "Report a safety issue", category: "Safety", views: "5.1K" },
  ];

  const ridesFAQ = [
    {
      q: "How are ride fares calculated?",
      a: "Fares are calculated based on: Base fare + (per-mile rate × distance) + (per-minute rate × time) + any applicable surge pricing. You'll see an estimated fare before confirming your ride. Final charges may differ due to route changes, traffic, or wait time."
    },
    {
      q: "Why was I charged a cancellation fee?",
      a: "Cancellation fees apply when you cancel after a driver has been assigned and is on their way. This compensates drivers for their time and effort. Fees typically range from $3-10 depending on how long the driver waited."
    },
    {
      q: "How do I report a lost item?",
      a: "Go to your Trip History, select the trip, and tap 'Report Lost Item'. We'll connect you with the driver. A $15 return fee may apply. Items should be picked up within 48 hours."
    },
  ];

  const eatsFAQ = [
    {
      q: "My order is missing items, what do I do?",
      a: "Go to Order History, select the order, and tap 'Missing Items'. Select which items were missing. You'll receive a refund or credit within 24 hours. Photo evidence helps speed up the process."
    },
    {
      q: "How long does delivery take?",
      a: "Delivery time depends on restaurant prep time, distance, and driver availability. You'll see an estimated time when ordering. Average delivery is 30-45 minutes. Track in real-time once a driver picks up your order."
    },
  ];

  const accountFAQ = [
    {
      q: "How do I reset my password?",
      a: "Tap 'Forgot Password' on the login screen. Enter your email, and we'll send a reset link valid for 1 hour. If you don't receive it, check spam or try requesting again after 5 minutes."
    },
    {
      q: "How do I update my payment method?",
      a: "Go to Account → Payment Methods → Add New. You can add credit/debit cards or digital wallets (Apple Pay, Google Pay). To remove a card, swipe left and confirm deletion."
    },
  ];

  const travelFAQ = [
    {
      q: "How do I book a flight, hotel, or car rental?",
      a: "ZIVO helps you search and compare prices from trusted travel partners. When you find an option you like, click 'View Deal' or 'Book' to be redirected to our partner's website to complete your booking."
    },
    {
      q: "Does ZIVO process payments for travel bookings?",
      a: "No. ZIVO is a search and comparison platform. All bookings, payments, refunds, and changes are handled directly by our travel partners. We do not collect or store any payment information."
    },
    {
      q: "How do I change or cancel a travel booking?",
      a: "Since bookings are completed with our travel partners, you'll need to contact them directly for any changes, cancellations, or refunds. Check your booking confirmation email for partner contact details."
    },
    {
      q: "Are prices on ZIVO accurate?",
      a: "Prices shown are indicative and sourced from our partners in real-time. Final pricing is confirmed on the partner's website. Prices may change based on availability and demand."
    },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background effects - simplified for mobile */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 right-0 w-[200px] h-[200px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-gradient-to-tr from-violet-500/10 to-purple-500/6 rounded-full blur-3xl" />

      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl hover:bg-white/10 active:scale-95 transition-transform">
            <ChevronLeft className="h-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-md shadow-primary/30">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base">Help Center</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">How can we help?</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-5xl mx-auto relative z-10">
        {/* Search - Mobile optimized */}
        <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-11 h-12 text-sm rounded-xl bg-card/80 border-white/10 shadow-lg focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Categories */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all touch-manipulation active:scale-95"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2 shadow-lg`}>
                <cat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold">{cat.label}</span>
            </a>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Tabs defaultValue="faq" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 sm:p-1.5 rounded-xl h-auto">
              <TabsTrigger value="faq" className="rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white font-semibold touch-manipulation">
                FAQ
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white font-semibold touch-manipulation">
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="ticket" className="rounded-lg py-2.5 sm:py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-teal-400 data-[state=active]:text-white font-semibold touch-manipulation">
                Ticket
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-5 sm:mt-6 space-y-6 sm:space-y-8">
              {/* Popular Articles */}
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 fill-amber-500" />
                    Popular Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-1 sm:gap-2">
                    {popularArticles.map((article, i) => (
                      <button
                        key={i}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-muted/50 transition-colors text-left group touch-manipulation active:scale-[0.98]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">{article.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{article.category} • {article.views} views</p>
                        </div>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rides FAQ */}
              <div id="rides">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  ZIVO Rides
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {ridesFAQ.map((item, i) => (
                    <AccordionItem key={i} value={`rides-${i}`} className="border border-border/50 rounded-2xl px-5 bg-gradient-to-br from-card/90 to-card shadow-lg">
                      <AccordionTrigger className="hover:no-underline text-left font-semibold py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Eats FAQ */}
              <div id="eats">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg shadow-eats/30">
                    <UtensilsCrossed className="h-5 w-5 text-white" />
                  </div>
                  ZIVO Eats
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {eatsFAQ.map((item, i) => (
                    <AccordionItem key={i} value={`eats-${i}`} className="border border-border/50 rounded-2xl px-5 bg-gradient-to-br from-card/90 to-card shadow-lg">
                      <AccordionTrigger className="hover:no-underline text-left font-semibold py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Account FAQ */}
              <div id="account">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Account & Billing
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {accountFAQ.map((item, i) => (
                    <AccordionItem key={i} value={`account-${i}`} className="border border-border/50 rounded-2xl px-5 bg-gradient-to-br from-card/90 to-card shadow-lg">
                      <AccordionTrigger className="hover:no-underline text-left font-semibold py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Travel FAQ */}
              <div id="flights">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  Flights, Hotels & Car Rentals
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {travelFAQ.map((item, i) => (
                    <AccordionItem key={i} value={`travel-${i}`} className="border border-border/50 rounded-2xl px-5 bg-gradient-to-br from-card/90 to-card shadow-lg">
                      <AccordionTrigger className="hover:no-underline text-left font-semibold py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {/* Partner Disclaimer */}
                <div className="mt-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Important:</strong> All bookings, payments, refunds, and changes are handled directly by our travel partners. 
                    ZIVO is a search and comparison platform and does not collect or process any payment information.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-5 sm:mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: MessageCircle, title: "Live Chat", desc: "Chat with a support agent", badge: "24/7", gradient: "from-primary to-teal-400", action: "Start Chat" },
                  { icon: Phone, title: "Phone", desc: "Speak with our team", badge: "1-800-ZIVO", gradient: "from-violet-500 to-purple-500", action: "Call Now" },
                  { icon: Mail, title: "Email", desc: "Response within 24h", badge: "support@zivo.com", gradient: "from-sky-500 to-blue-500", action: "Send Email" },
                ].map((contact, index) => (
                  <Card key={contact.title} className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}>
                        <contact.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">{contact.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{contact.desc}</p>
                      <Badge variant="outline" className="mb-3 sm:mb-4 font-semibold text-xs">{contact.badge}</Badge>
                      <Button className={`w-full rounded-xl font-semibold touch-manipulation active:scale-[0.98] ${index === 0 ? "bg-gradient-to-r from-primary to-teal-400 text-white" : ""}`} variant={index === 0 ? "default" : "outline"}>
                        {contact.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Safety Hotline */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                <Card className="border-0 bg-gradient-to-br from-destructive/10 to-red-500/5 shadow-xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-destructive to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-destructive/30">
                        <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-destructive mb-1 sm:mb-2">Emergency & Safety</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          For immediate safety concerns during a trip, use the in-app emergency button. 
                          For life-threatening emergencies, call 911.
                        </p>
                        <p className="font-bold text-base sm:text-lg">Safety Hotline: 1-800-ZIVO-SOS</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Ticket Tab */}
            <TabsContent value="ticket" className="mt-6">
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Can't find an answer? Submit a ticket and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketSubmitted ? (
                    <div className="text-center py-8 sm:py-10 animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-emerald-500/30">
                        <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h3 className="font-bold text-xl sm:text-2xl mb-2">Ticket Submitted!</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        Your ticket #ZV-{Math.random().toString(36).substr(2, 9).toUpperCase()} has been created. 
                        You'll receive a confirmation email shortly.
                      </p>
                      <Button onClick={() => setTicketSubmitted(false)} className="rounded-xl font-semibold touch-manipulation active:scale-95">
                        Submit Another Ticket
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-4 sm:space-y-5">
                      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="font-semibold text-sm">Category</Label>
                          <Select required>
                            <SelectTrigger className="h-11 sm:h-12 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rides">Rides</SelectItem>
                              <SelectItem value="eats">Food Delivery</SelectItem>
                              <SelectItem value="rental">Car Rental</SelectItem>
                              <SelectItem value="flights">Flights</SelectItem>
                              <SelectItem value="hotels">Hotels</SelectItem>
                              <SelectItem value="account">Account & Billing</SelectItem>
                              <SelectItem value="safety">Safety Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="font-semibold text-sm">Priority</Label>
                          <Select defaultValue="normal">
                            <SelectTrigger className="h-11 sm:h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="font-semibold text-sm">Subject</Label>
                        <Input id="subject" placeholder="Brief description of your issue" required className="h-11 sm:h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="font-semibold text-sm">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Please provide as much detail as possible..." 
                          required 
                          className="min-h-[120px] sm:min-h-[150px] rounded-xl resize-none"
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 gap-2 touch-manipulation active:scale-[0.98]">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        Submit Ticket
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
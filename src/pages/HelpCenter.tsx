import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, MessageCircle, Phone, Mail, Car, UtensilsCrossed, Plane, Hotel, Key, ChevronRight, HelpCircle, FileText, Shield, CreditCard, Star, AlertTriangle, User } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    { icon: Car, label: "Rides", color: "text-rides", href: "#rides" },
    { icon: UtensilsCrossed, label: "Food Delivery", color: "text-eats", href: "#eats" },
    { icon: Key, label: "Car Rental", color: "text-primary", href: "#rental" },
    { icon: Plane, label: "Flights", color: "text-sky-500", href: "#flights" },
    { icon: Hotel, label: "Hotels", color: "text-amber-500", href: "#hotels" },
    { icon: User, label: "Account", color: "text-muted-foreground", href: "#account" },
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
    {
      q: "Can I request a specific driver?",
      a: "You can't request specific drivers, but you can save favorite drivers and receive notifications when they're nearby. Premium subscription members get priority matching with top-rated drivers."
    },
    {
      q: "What happens if my driver doesn't arrive?",
      a: "If your driver cancels or doesn't arrive within 5 minutes of ETA, you won't be charged. You can request a new ride immediately. If this happens repeatedly, contact support for credits."
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
    {
      q: "Can I schedule orders in advance?",
      a: "Yes! When ordering, tap 'Schedule' instead of 'ASAP'. You can schedule up to 7 days in advance. Note that menu availability may change, and scheduled orders can be cancelled up to 1 hour before."
    },
    {
      q: "My food arrived cold or damaged",
      a: "Report quality issues within 1 hour of delivery for fastest resolution. Go to Order History → Select Order → 'Food Quality Issue'. Include photos. You may receive a partial or full refund depending on severity."
    },
    {
      q: "How do I provide feedback about a restaurant?",
      a: "After delivery, you'll receive a rating prompt. Rate the food quality (1-5 stars) and leave comments. Your feedback helps restaurants improve and helps other customers make informed choices."
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
    {
      q: "How do I delete my account?",
      a: "Go to Account → Settings → Delete Account. This action is irreversible. Your data will be removed within 30 days per our Privacy Policy. Outstanding balances must be settled first."
    },
    {
      q: "Can I change my email address?",
      a: "Yes, go to Account → Profile → Edit Email. You'll need to verify the new email address. Your login credentials will change to the new email once verified."
    },
    {
      q: "How do I enable two-factor authentication?",
      a: "Go to Account → Security → Two-Factor Authentication. Choose SMS or authenticator app. 2FA adds an extra layer of security requiring a code in addition to your password."
    },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Help Center</h1>
              <p className="text-sm text-muted-foreground">How can we help you today?</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles..."
            className="pl-12 h-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Categories */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <cat.icon className={`h-6 w-6 mb-2 ${cat.color}`} />
              <span className="text-sm font-medium">{cat.label}</span>
            </a>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-6">
            {/* Popular Articles */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2">
                  {popularArticles.map((article, i) => (
                    <button
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.category}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rides FAQ */}
            <div id="rides" className="mb-6">
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <Car className="h-5 w-5 text-rides" />
                ZIVO Rides
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {ridesFAQ.map((item, i) => (
                  <AccordionItem key={i} value={`rides-${i}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Eats FAQ */}
            <div id="eats" className="mb-6">
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-eats" />
                ZIVO Eats
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {eatsFAQ.map((item, i) => (
                  <AccordionItem key={i} value={`eats-${i}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Account FAQ */}
            <div id="account" className="mb-6">
              <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Account & Billing
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {accountFAQ.map((item, i) => (
                  <AccordionItem key={i} value={`account-${i}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with a support agent in real-time
                  </p>
                  <Badge variant="outline" className="mb-3">Available 24/7</Badge>
                  <Button className="w-full">Start Chat</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Speak directly with our team
                  </p>
                  <p className="font-mono mb-3">1-800-ZIVO-HELP</p>
                  <Button variant="outline" className="w-full">Call Now</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a response within 24 hours
                  </p>
                  <p className="text-primary mb-3">support@zivo.com</p>
                  <Button variant="outline" className="w-full">Send Email</Button>
                </CardContent>
              </Card>
            </div>

            {/* Safety Hotline */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-destructive mb-2">Emergency & Safety</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For immediate safety concerns during a trip, use the in-app emergency button. 
                      For life-threatening emergencies, call 911.
                    </p>
                    <p className="font-semibold">Safety Hotline: 1-800-ZIVO-SOS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ticket Tab */}
          <TabsContent value="ticket" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Can't find an answer? Submit a ticket and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticketSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Ticket Submitted!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your ticket #ZV-{Math.random().toString(36).substr(2, 9).toUpperCase()} has been created. 
                      You'll receive a confirmation email shortly.
                    </p>
                    <Button onClick={() => setTicketSubmitted(false)}>Submit Another Ticket</Button>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select required>
                          <SelectTrigger>
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
                        <Label htmlFor="priority">Priority</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - General inquiry</SelectItem>
                            <SelectItem value="medium">Medium - Issue affecting service</SelectItem>
                            <SelectItem value="high">High - Urgent billing/safety issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Brief description of your issue" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderid">Order/Booking ID (if applicable)</Label>
                      <Input id="orderid" placeholder="e.g., ZV-ABC123XYZ" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Please provide as much detail as possible..." 
                        rows={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachments (optional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 10MB per file. Supports: JPG, PNG, PDF
                        </p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Submit Ticket</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal & Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/terms-of-service">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Button>
              </Link>
              <Link to="/privacy-policy">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/refund-policy">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Refund Policy
                </Button>
              </Link>
              <Link to="/partner-agreement">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Partner Agreement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HelpCenter;

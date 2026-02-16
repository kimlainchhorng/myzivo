import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/shared/FAQSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Car,
  DollarSign,
  Clock,
  Shield,
  Smartphone,
  CheckCircle,
  UserPlus,
  FileCheck,
  Zap,
  Headphones,
  Wallet,
  ArrowRight,
} from "lucide-react";
import AcceptedVehiclesList from "@/components/drive/AcceptedVehiclesList";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const driverFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  city: z.string().trim().min(2, "City is required").max(100),
  vehicleType: z.string().min(1, "Select a vehicle type"),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

const steps = [
  { icon: UserPlus, title: "Sign Up", desc: "Fill out the form below — it takes less than 2 minutes." },
  { icon: FileCheck, title: "Get Approved", desc: "We'll review your documents and background check." },
  { icon: Zap, title: "Start Earning", desc: "Go online whenever you want and start accepting rides." },
];

const requirements = [
  "Valid driver's license",
  "Registered vehicle (2015 or newer)",
  "Smartphone with data plan",
  "Pass background check",
  "Valid auto insurance",
];

const benefits = [
  { icon: Clock, title: "Flexible Hours", desc: "Drive when you want, as much as you want." },
  { icon: Wallet, title: "Weekly Payouts", desc: "Get paid every week — direct to your bank." },
  { icon: Headphones, title: "In-App Support", desc: "24/7 driver support right in the app." },
  { icon: Shield, title: "Safety First", desc: "In-app safety tools, SOS, and trip tracking." },
];

const faqs = [
  { question: "How much can I earn driving with ZIVO?", answer: "Earnings depend on your city, hours, and demand. Top drivers earn $1,200+ per week in major metro areas." },
  { question: "What are the vehicle requirements?", answer: "You need a 4-door vehicle, 2015 or newer, in good condition with valid registration and insurance." },
  { question: "How do I get paid?", answer: "Earnings are deposited weekly to your bank account. You can also cash out instantly for a small fee." },
  { question: "Is there a minimum number of hours?", answer: "No. You choose when and how long you drive — there are no minimums or schedules." },
  { question: "What if I have an issue during a ride?", answer: "Use the in-app support or SOS button. Our driver support team is available 24/7." },
];

const Drive = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
  });

  const onSubmit = (data: DriverFormData) => {
    console.log("Driver signup:", data);
    toast.success("Application submitted! We'll be in touch soon.");
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Drive with ZIVO – Earn on Your Schedule"
        description="Join ZIVO as a driver. Flexible hours, weekly payouts, and 24/7 support. Sign up today and start earning."
      />
      <FAQSchema faqs={faqs} pageType="general" />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <motion.section {...fadeIn} className="container mx-auto px-4 text-center mb-20 max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Car className="w-3 h-3 mr-1" />
            Drive with ZIVO
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Drive with ZIVO. Earn on your schedule.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Be your own boss. Set your hours. Get paid weekly. Join thousands of drivers earning with ZIVO.
          </p>
          <p className="text-2xl font-bold text-primary mb-8">
            Top drivers earn $1,200+/week
          </p>
          <Button size="lg" variant="hero" onClick={() => document.getElementById("signup-form")?.scrollIntoView({ behavior: "smooth" })}>
            Apply Now <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </motion.section>

        {/* How It Works */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Step {i + 1}</span>
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Requirements */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Requirements</h2>
          <Card>
            <CardContent className="p-8">
              <ul className="space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Accepted Vehicles */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-4xl">
          <AcceptedVehiclesList />
        </motion.section>

        {/* Benefits */}
        <motion.section {...fadeIn} className="container mx-auto px-4 mb-20 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">Why drive with ZIVO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 shrink-0">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Signup Form */}
        <motion.section {...fadeIn} id="signup-form" className="container mx-auto px-4 mb-20 max-w-lg scroll-mt-24">
          <h2 className="text-3xl font-bold text-center mb-10">Apply to drive</h2>
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" {...register("city")} />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label>Vehicle type</Label>
                  <Select onValueChange={(v) => setValue("vehicleType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="van">Van / Minivan</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.vehicleType && <p className="text-sm text-destructive mt-1">{errors.vehicleType.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        {/* FAQ */}
        <motion.section {...fadeIn} className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Driver FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Drive;

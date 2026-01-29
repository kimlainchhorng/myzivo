import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UtensilsCrossed, Store, MapPin, Phone, Mail, Clock, Upload, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  cuisineType: z.string().min(1, "Please select a cuisine type"),
  address: z.string().min(5, "Please enter a valid address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  description: z.string().optional(),
  avgPrepTime: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

const cuisineTypes = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
  "Thai", "Mediterranean", "French", "Korean", "Vietnamese", "Greek",
  "Middle Eastern", "Caribbean", "Soul Food", "BBQ", "Seafood", 
  "Pizza", "Burgers", "Sushi", "Vegan", "Bakery & Cafe", "Other"
];

const RestaurantRegistration = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(user ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authData, setAuthData] = useState({ email: "", password: "", fullName: "" });

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      cuisineType: "",
      address: "",
      phone: "",
      email: user?.email || "",
      description: "",
      avgPrepTime: "30",
      acceptTerms: false,
    },
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(authData.email, authData.password, authData.fullName);
      toast.success("Account created! Please check your email to verify.");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: RestaurantFormData) => {
    if (!user) {
      toast.error("Please create an account first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("restaurants").insert({
        owner_id: user.id,
        name: data.name,
        cuisine_type: data.cuisineType,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description || null,
        avg_prep_time: data.avgPrepTime ? parseInt(data.avgPrepTime) : 30,
        status: "pending",
        is_open: false,
      });

      if (error) throw error;

      toast.success("Restaurant registration submitted! We'll review your application.");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to register restaurant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: Store, title: "Reach More Customers", desc: "Access thousands of hungry customers in your area" },
    { icon: Clock, title: "Flexible Hours", desc: "Set your own operating hours and availability" },
    { icon: UtensilsCrossed, title: "Easy Menu Management", desc: "Update your menu in real-time with our dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-eats/15 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-eats/20 to-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-tr from-amber-500/15 to-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg shadow-eats/30">
              <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl">ZIVO Eats</h1>
              <p className="text-xs text-muted-foreground">Restaurant Partners</p>
            </div>
          </div>
          {!user && (
            <Button variant="ghost" onClick={() => navigate("/login")} className="rounded-xl text-sm touch-manipulation active:scale-95">
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
          {[1, 2, 3].map((s, index) => (
            <div 
              key={s} 
              className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all shadow-lg ${
                step >= s 
                  ? "bg-gradient-to-br from-eats to-orange-500 text-white shadow-eats/30" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Account" : s === 2 ? "Restaurant Info" : "Complete"}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-gradient-to-r from-eats to-orange-500" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Benefits */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">Partner with ZIVO Eats</h2>
                <p className="text-muted-foreground">
                  Join thousands of restaurants growing their business with ZIVO Eats delivery.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <Card key={i} className="border-0 bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-eats/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-5 w-5 text-eats" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-eats/10 border border-eats/20">
                <p className="text-sm">
                  <strong>Commission:</strong> 15-20% per order<br />
                  <strong>Payout:</strong> Weekly direct deposit<br />
                  <strong>Support:</strong> Dedicated partner success team
                </p>
              </div>
            </div>

            {/* Sign Up Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>First, let's set up your owner account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                      placeholder="John Smith"
                      value={authData.fullName}
                      onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      type="email"
                      placeholder="you@restaurant.com"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                      type="password"
                      placeholder="Create a strong password"
                      value={authData.password}
                      onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-eats hover:bg-eats/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Restaurant Details */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-eats" />
                  Restaurant Details
                </CardTitle>
                <CardDescription>Tell us about your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="The Best Kitchen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cuisineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cuisine type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cuisineTypes.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                                  {cuisine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="123 Main St, City, State" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="(555) 123-4567" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="contact@restaurant.com" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="avgPrepTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Prep Time (minutes)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="20">20 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell customers about your restaurant..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <a href="/terms-of-service" className="text-primary underline">Terms of Service</a>
                              {" "}and{" "}
                              <a href="/partner-agreement" className="text-primary underline">Partner Agreement</a>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-eats hover:bg-eats/90" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Submit Application
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Application Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Thank you for applying to partner with ZIVO Eats. Our team will review your application 
              and get back to you within 2-3 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Return Home
              </Button>
              <Button onClick={() => navigate("/help")} className="bg-eats hover:bg-eats/90">
                Visit Help Center
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantRegistration;

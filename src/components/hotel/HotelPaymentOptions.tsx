import { CreditCard, Wallet, Building, Calendar, Shield, CheckCircle2, Percent } from "lucide-react";
import { useState } from "react";

const paymentOptions = [
  {
    id: "card",
    icon: CreditCard,
    title: "Credit/Debit Card",
    description: "Pay securely with Visa, Mastercard, or Amex",
    features: ["Instant confirmation", "Earn reward points", "Price protection"],
    recommended: true,
  },
  {
    id: "wallet",
    icon: Wallet,
    title: "Digital Wallets",
    description: "Apple Pay, Google Pay, PayPal",
    features: ["One-tap checkout", "Extra security", "Fast processing"],
    recommended: false,
  },
  {
    id: "bank",
    icon: Building,
    title: "Bank Transfer",
    description: "Direct payment from your bank account",
    features: ["No card fees", "Secure transfer", "Up to 48h processing"],
    recommended: false,
  },
  {
    id: "later",
    icon: Calendar,
    title: "Pay Later",
    description: "Reserve now, pay at hotel",
    features: ["No upfront payment", "Free cancellation", "Flexible booking"],
    recommended: false,
  },
];

const installmentPlans = [
  { months: 3, interest: 0, monthly: "$150" },
  { months: 6, interest: 0, monthly: "$75" },
  { months: 12, interest: 5, monthly: "$40" },
];

const HotelPaymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState("card");

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Flexible <span className="text-primary">Payment Options</span>
            </h2>
            <p className="text-muted-foreground">
              Choose the payment method that works best for you
            </p>
          </div>

          {/* Payment Options Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`relative text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-card/50 border-border/50 hover:border-primary/30"
                  }`}
                >
                  {option.recommended && (
                    <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Recommended
                    </span>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Installment Plans */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Percent className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Split Your Payment</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {installmentPlans.map((plan, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card/80 border border-border/50 text-center"
                >
                  <div className="text-3xl font-bold mb-1">{plan.months}</div>
                  <div className="text-sm text-muted-foreground mb-3">Monthly Payments</div>
                  <div className="text-lg font-semibold text-primary mb-1">{plan.monthly}/mo</div>
                  {plan.interest === 0 ? (
                    <span className="text-xs text-emerald-400 font-medium">0% Interest</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{plan.interest}% APR</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              All transactions are encrypted and secure
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelPaymentOptions;

import { HeadphonesIcon, MessageCircle, Phone, Mail, Globe, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant support",
    availability: "24/7",
    action: "Start Chat",
    primary: true,
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "+1 (888) 123-4567",
    availability: "24/7",
    action: "Call Now",
    primary: false,
  },
  {
    icon: Mail,
    title: "Email",
    description: "support@zivo.com",
    availability: "Response < 2hrs",
    action: "Send Email",
    primary: false,
  },
];

const CustomerSupport247 = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
                <HeadphonesIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                  We're Here to Help
                </h2>
                <p className="text-muted-foreground">
                  Get support anytime, anywhere. Our team is available 24/7 across multiple channels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportChannels.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.title}
                    className={cn(
                      "p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                      "animate-in fade-in slide-in-from-bottom-4"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{channel.title}</h3>
                        <p className="text-xs text-muted-foreground">{channel.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{channel.availability}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={channel.primary ? "default" : "outline"}
                        className={cn(
                          "rounded-xl text-xs",
                          channel.primary && "bg-gradient-to-r from-primary to-teal-400"
                        )}
                      >
                        {channel.action}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Available in 12 languages</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Avg. response: 2 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSupport247;

import { 
  Phone, 
  MessageCircle,
  MapPin,
  Shield,
  AlertTriangle,
  ExternalLink,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmergencySupportWidgetProps {
  className?: string;
  destination?: string;
}

const emergencyContacts = [
  { type: "Police", number: "17", icon: Shield },
  { type: "Medical", number: "15", icon: Heart },
  { type: "Fire", number: "18", icon: AlertTriangle },
];

const EmergencySupportWidget = ({ className, destination = "Paris" }: EmergencySupportWidgetProps) => {
  return (
    <div className={cn("p-4 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm">Emergency Support</h3>
        </div>
        <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
          24/7 Available
        </Badge>
      </div>

      {/* Destination Info */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/30 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{destination}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Emergency numbers for your destination</p>
      </div>

      {/* Emergency Numbers */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {emergencyContacts.map((contact) => {
          const Icon = contact.icon;
          return (
            <a
              key={contact.type}
              href={`tel:${contact.number}`}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center hover:bg-red-500/20 transition-colors"
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-red-400" />
              <p className="text-xs font-medium">{contact.type}</p>
              <p className="text-lg font-bold text-red-400">{contact.number}</p>
            </a>
          );
        })}
      </div>

      {/* ZIVO Support */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
        <p className="text-xs text-muted-foreground mb-2">ZIVO Travel Support</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="w-3 h-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="w-3 h-3 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors text-sm">
          <span>Nearest Hospital</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors text-sm">
          <span>Embassy Information</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors text-sm">
          <span>Insurance Claim</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default EmergencySupportWidget;

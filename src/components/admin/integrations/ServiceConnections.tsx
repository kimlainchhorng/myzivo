import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plug, CheckCircle2, XCircle, Settings, RefreshCw, ExternalLink,
  CreditCard, MessageSquare, Mail, MapPin, Cloud, Shield, BarChart3, Bell
} from "lucide-react";
import { toast } from "sonner";

interface ServiceConnection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  status: "connected" | "disconnected" | "error";
  isEnabled: boolean;
  lastSync: string | null;
  config: Record<string, string>;
  requiredFields: { key: string; label: string; type: "text" | "password" }[];
}

const mockServices: ServiceConnection[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and subscriptions",
    icon: CreditCard,
    category: "Payments",
    status: "connected",
    isEnabled: true,
    lastSync: "2024-01-27T14:00:00",
    config: { api_key: "sk_live_••••••••", webhook_secret: "whsec_••••" },
    requiredFields: [
      { key: "api_key", label: "API Key", type: "password" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password" }
    ]
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS and voice communications",
    icon: MessageSquare,
    category: "Communications",
    status: "connected",
    isEnabled: true,
    lastSync: "2024-01-27T13:45:00",
    config: { account_sid: "AC••••••••", auth_token: "••••••••" },
    requiredFields: [
      { key: "account_sid", label: "Account SID", type: "text" },
      { key: "auth_token", label: "Auth Token", type: "password" }
    ]
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery and marketing",
    icon: Mail,
    category: "Communications",
    status: "connected",
    isEnabled: true,
    lastSync: "2024-01-27T12:30:00",
    config: { api_key: "SG.••••••••" },
    requiredFields: [
      { key: "api_key", label: "API Key", type: "password" }
    ]
  },
  {
    id: "mapbox",
    name: "Mapbox",
    description: "Maps and location services",
    icon: MapPin,
    category: "Location",
    status: "connected",
    isEnabled: true,
    lastSync: "2024-01-27T14:15:00",
    config: { access_token: "pk.••••••••" },
    requiredFields: [
      { key: "access_token", label: "Access Token", type: "password" }
    ]
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    description: "File storage and CDN",
    icon: Cloud,
    category: "Storage",
    status: "connected",
    isEnabled: true,
    lastSync: "2024-01-27T11:00:00",
    config: { access_key: "AKIA••••", secret_key: "••••••••", bucket: "zivo-assets" },
    requiredFields: [
      { key: "access_key", label: "Access Key ID", type: "text" },
      { key: "secret_key", label: "Secret Access Key", type: "password" },
      { key: "bucket", label: "Bucket Name", type: "text" }
    ]
  },
  {
    id: "firebase",
    name: "Firebase",
    description: "Push notifications",
    icon: Bell,
    category: "Notifications",
    status: "error",
    isEnabled: false,
    lastSync: "2024-01-25T09:00:00",
    config: { project_id: "zivo-app", server_key: "••••••••" },
    requiredFields: [
      { key: "project_id", label: "Project ID", type: "text" },
      { key: "server_key", label: "Server Key", type: "password" }
    ]
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Product analytics",
    icon: BarChart3,
    category: "Analytics",
    status: "disconnected",
    isEnabled: false,
    lastSync: null,
    config: {},
    requiredFields: [
      { key: "token", label: "Project Token", type: "password" }
    ]
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Identity management",
    icon: Shield,
    category: "Security",
    status: "disconnected",
    isEnabled: false,
    lastSync: null,
    config: {},
    requiredFields: [
      { key: "domain", label: "Domain", type: "text" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" }
    ]
  }
];

export default function ServiceConnections() {
  const [services, setServices] = useState<ServiceConnection[]>(mockServices);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceConnection | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleConfigureService = (service: ServiceConnection) => {
    setSelectedService(service);
    setFormData(service.config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = () => {
    if (!selectedService) return;
    
    setServices(svcs => svcs.map(svc => 
      svc.id === selectedService.id 
        ? { ...svc, config: formData, status: "connected" as const, isEnabled: true, lastSync: new Date().toISOString() }
        : svc
    ));
    setConfigDialogOpen(false);
    toast.success(`${selectedService.name} configured successfully`);
  };

  const handleDisconnect = (id: string) => {
    setServices(svcs => svcs.map(svc => 
      svc.id === id 
        ? { ...svc, status: "disconnected" as const, isEnabled: false, config: {} }
        : svc
    ));
    toast.success("Service disconnected");
  };

  const handleToggleService = (id: string) => {
    setServices(svcs => svcs.map(svc => 
      svc.id === id ? { ...svc, isEnabled: !svc.isEnabled } : svc
    ));
    toast.success("Service status updated");
  };

  const handleSync = (id: string) => {
    setServices(svcs => svcs.map(svc => 
      svc.id === id ? { ...svc, lastSync: new Date().toISOString() } : svc
    ));
    toast.success("Sync initiated");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const categories = [...new Set(services.map(s => s.category))];

  const getStatusBadge = (status: ServiceConnection["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Plug className="h-3 w-3" />
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Third-Party Services</h3>
        <p className="text-sm text-muted-foreground">Connect and manage external service integrations</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category}</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {services.filter(s => s.category === category).map((service) => (
              <Card key={service.id} className={service.status === "disconnected" ? "opacity-70" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        service.status === "connected" 
                          ? "bg-primary/10" 
                          : service.status === "error"
                          ? "bg-destructive/10"
                          : "bg-muted"
                      }`}>
                        <service.icon className={`h-5 w-5 ${
                          service.status === "connected"
                            ? "text-primary"
                            : service.status === "error"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{service.name}</h5>
                          {getStatusBadge(service.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                        {service.lastSync && service.status === "connected" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last sync: {formatDate(service.lastSync)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    {service.status === "connected" ? (
                      <>
                        <Switch 
                          checked={service.isEnabled} 
                          onCheckedChange={() => handleToggleService(service.id)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSync(service.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleConfigureService(service)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(service.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleConfigureService(service)}
                      >
                        <Plug className="h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedService && <selectedService.icon className="h-5 w-5" />}
              Configure {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {selectedService?.name} credentials to enable the integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedService?.requiredFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input 
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveConfig}>Save & Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

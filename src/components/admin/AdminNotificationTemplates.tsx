import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Plus,
  Edit,
  Copy,
  Trash2,
  Search,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  category: string;
  type: "push" | "email" | "sms" | "in-app";
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  lastUsed: string;
}

const templates: Template[] = [
  {
    id: "1",
    name: "Ride Confirmed",
    category: "Rides",
    type: "push",
    content: "Your ride with {{driver_name}} is confirmed. ETA: {{eta}} minutes.",
    variables: ["driver_name", "eta"],
    isActive: true,
    lastUsed: "2024-01-26 10:30"
  },
  {
    id: "2",
    name: "Order Ready",
    category: "Food",
    type: "push",
    content: "Your order from {{restaurant_name}} is ready for pickup!",
    variables: ["restaurant_name"],
    isActive: true,
    lastUsed: "2024-01-26 11:00"
  },
  {
    id: "3",
    name: "Welcome Email",
    category: "Onboarding",
    type: "email",
    subject: "Welcome to ZIVO, {{user_name}}!",
    content: "Hi {{user_name}}, welcome to ZIVO! Your journey starts here...",
    variables: ["user_name"],
    isActive: true,
    lastUsed: "2024-01-25 14:00"
  },
  {
    id: "4",
    name: "Payment Receipt",
    category: "Payments",
    type: "email",
    subject: "Receipt for your {{service_type}}",
    content: "Thank you for your payment of ${{amount}}. Transaction ID: {{transaction_id}}",
    variables: ["service_type", "amount", "transaction_id"],
    isActive: true,
    lastUsed: "2024-01-26 09:00"
  },
  {
    id: "5",
    name: "Promo Code",
    category: "Marketing",
    type: "sms",
    content: "ZIVO: Use code {{promo_code}} for {{discount}}% off your next ride! Valid until {{expiry_date}}",
    variables: ["promo_code", "discount", "expiry_date"],
    isActive: false,
    lastUsed: "2024-01-20 12:00"
  }
];

const getTypeIcon = (type: Template["type"]) => {
  switch (type) {
    case "push": return <Smartphone className="h-4 w-4 text-blue-500" />;
    case "email": return <Mail className="h-4 w-4 text-purple-500" />;
    case "sms": return <MessageSquare className="h-4 w-4 text-green-500" />;
    case "in-app": return <Bell className="h-4 w-4 text-amber-500" />;
  }
};

const getTypeBadge = (type: Template["type"]) => {
  const config = {
    push: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    email: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    sms: "bg-green-500/10 text-green-500 border-green-500/20",
    "in-app": "bg-amber-500/10 text-amber-500 border-amber-500/20"
  };
  return <Badge className={config[type]}>{type.toUpperCase()}</Badge>;
};

const AdminNotificationTemplates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Templates
          </h2>
          <p className="text-muted-foreground">Manage message templates for all channels</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-xs text-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.type === "push").length}</p>
                <p className="text-xs text-muted-foreground">Push</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.type === "email").length}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Templates Library</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-9 w-[250px] bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id}
                className={cn(
                  "p-4 rounded-xl transition-all hover:shadow-md",
                  template.isActive ? "bg-muted/20" : "bg-muted/10 opacity-60"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(template.type)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{template.name}</h4>
                        {getTypeBadge(template.type)}
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        {!template.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {template.subject && (
                        <p className="text-sm text-muted-foreground mb-1">Subject: {template.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{template.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.map((variable) => (
                          <code key={variable} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {`{{${variable}}}`}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationTemplates;

/**
 * Global Support Center Page
 * Unified support across all ZIVO services
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, MessageCircle, Clock, CheckCircle,
  AlertCircle, ChevronRight, Send, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSupportTickets,
  useCreateSupportTicket,
  SUPPORT_CATEGORIES,
  getCategoryLabel,
  type CreateTicketInput,
} from "@/hooks/useGlobalSupport";
import { getServiceMeta } from "@/hooks/useZivoWallet";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { format } from "date-fns";

function NewTicketDialog() {
  const navigate = useNavigate();
  const createTicket = useCreateSupportTicket();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateTicketInput>>({
    service_type: "",
    category: "",
    subject: "",
    description: "",
    priority: "normal",
  });

  const selectedService = formData.service_type ? SUPPORT_CATEGORIES[formData.service_type] : null;

  const handleSubmit = async () => {
    if (!formData.service_type || !formData.category || !formData.subject || !formData.description) {
      return;
    }
    
    await createTicket.mutateAsync(formData as CreateTicketInput);
    setIsOpen(false);
    setFormData({
      service_type: "",
      category: "",
      subject: "",
      description: "",
      priority: "normal",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            We're here to help. Describe your issue and we'll get back to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select
              value={formData.service_type}
              onValueChange={(v) => setFormData({ ...formData, service_type: v, category: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORT_CATEGORIES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {getServiceMeta(key).icon} {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          {selectedService && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {selectedService.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Brief summary of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Please provide details about your issue..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData({ ...formData, priority: v })}
            >
              <SelectTrigger>
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

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={createTicket.isPending || !formData.subject || !formData.description}
          >
            {createTicket.isPending ? "Creating..." : "Submit Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportCenterPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  const { data: tickets, isLoading } = useSupportTickets(
    statusFilter === "all" ? undefined : statusFilter
  );

  const filteredTickets = tickets?.filter((t) =>
    search ? t.subject.toLowerCase().includes(search.toLowerCase()) : true
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "waiting_customer":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/app">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Support Center</h1>
                <p className="text-sm text-muted-foreground">
                  Get help across all services
                </p>
              </div>
            </div>
            <NewTicketDialog />
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tickets List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredTickets && filteredTickets.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTickets.map((ticket) => {
                const meta = getServiceMeta(ticket.service_type);
                
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to={`/support/${ticket.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getStatusIcon(ticket.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium">{ticket.subject}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {ticket.description}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className="text-xs">{meta.icon} {meta.label}</Badge>
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(ticket.status)}`}>
                                  {ticket.status.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {ticket.ticket_number}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No tickets found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? "Try a different search term" : "Create a new ticket to get help"}
              </p>
              <NewTicketDialog />
            </CardContent>
          </Card>
        )}

        {/* Help Resources */}
        <div>
          <h3 className="font-semibold mb-3">Help Resources</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="justify-start h-auto py-3">
              <Link to="/help">
                <div className="text-left">
                  <p className="font-medium">Help Center</p>
                  <p className="text-xs text-muted-foreground">Browse FAQs</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start h-auto py-3">
              <Link to="/contact">
                <div className="text-left">
                  <p className="font-medium">Contact Us</p>
                  <p className="text-xs text-muted-foreground">Email & chat</p>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

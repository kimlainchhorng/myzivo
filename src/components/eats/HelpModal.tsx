/**
 * Help Modal Component
 * Support options for order issues with inline ticket creation
 */
import { useState } from "react";
import { Phone, MessageCircle, RefreshCw, HelpCircle, AlertTriangle, Send, CheckCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCreateEatsTicket, EatsIssueCategory } from "@/hooks/useEatsSupport";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantPhone?: string | null;
  restaurantName?: string;
}

const helpOptions = [
  {
    id: "order_issue",
    icon: HelpCircle,
    title: "Report an Issue",
    description: "Wrong or missing items, quality concerns",
    category: "order_issue" as EatsIssueCategory,
  },
  {
    id: "refund",
    icon: RefreshCw,
    title: "Request Refund",
    description: "Get help with refunds or credits",
    category: "refund" as EatsIssueCategory,
  },
  {
    id: "missing_item",
    icon: AlertTriangle,
    title: "Missing Item",
    description: "Something was left out of your order",
    category: "missing_item" as EatsIssueCategory,
  },
];

export function HelpModal({
  open,
  onOpenChange,
  orderId,
  restaurantPhone,
  restaurantName,
}: HelpModalProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<EatsIssueCategory | null>(null);
  const [message, setMessage] = useState("");
  const [ticketCreated, setTicketCreated] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  
  const createTicket = useCreateEatsTicket();

  const handleSelectOption = (category: EatsIssueCategory) => {
    setSelectedCategory(category);
  };

  const handleSubmitTicket = async () => {
    if (!selectedCategory) return;
    
    const result = await createTicket.mutateAsync({
      orderId,
      message,
      category: selectedCategory,
      restaurantName,
    });
    
    setCreatedTicketNumber(result.ticket_number);
    setCreatedTicketId(result.id);
    setTicketCreated(true);
  };

  const handleClose = () => {
    // Reset state on close
    setSelectedCategory(null);
    setMessage("");
    setTicketCreated(false);
    setCreatedTicketNumber(null);
    setCreatedTicketId(null);
    onOpenChange(false);
  };

  const handleViewTicket = () => {
    if (createdTicketId) {
      handleClose();
      navigate(`/support/tickets/${createdTicketId}`);
    }
  };

  const handleContactSupport = () => {
    handleClose();
    navigate("/support");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {ticketCreated ? "Ticket Created" : selectedCategory ? "Describe the Issue" : "Need Help?"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Success State */}
          {ticketCreated && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">We're on it!</h3>
              <p className="text-zinc-400 text-sm mb-1">
                Your ticket <span className="text-orange-400 font-mono">{createdTicketNumber}</span> has been created.
              </p>
              <p className="text-zinc-500 text-xs">
                We'll get back to you within 24 hours.
              </p>
              
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleViewTicket}
                  className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full h-12 rounded-xl border-zinc-700 bg-transparent text-white"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}

          {/* Issue Form State */}
          {!ticketCreated && selectedCategory && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <Textarea
                placeholder="Tell us what happened... (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-zinc-800 border-white/10 text-white placeholder:text-zinc-500 min-h-[120px] rounded-xl resize-none"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="flex-1 h-12 rounded-xl border-zinc-700 bg-transparent text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitTicket}
                  disabled={createTicket.isPending}
                  className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {createTicket.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Options List State */}
          {!ticketCreated && !selectedCategory && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 py-4"
            >
              {helpOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectOption(option.category)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-orange-500/30 transition-all text-left active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <option.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.title}</p>
                    <p className="text-xs text-zinc-500">{option.description}</p>
                  </div>
                </motion.button>
              ))}

              {/* Live Chat - Real-time support */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => {
                  handleClose();
                  navigate(`/support/chat?context=eats&orderId=${orderId}`);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-emerald-500/30 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Live Chat</p>
                  <p className="text-xs text-zinc-500">Chat with an agent now</p>
                </div>
              </motion.button>

              {/* Contact Support - Navigate to full support page */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleContactSupport}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-orange-500/30 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Submit Ticket</p>
                  <p className="text-xs text-zinc-500">Create a support ticket</p>
                </div>
              </motion.button>

              {/* Call Restaurant */}
              {restaurantPhone && (
                <a
                  href={`tel:${restaurantPhone}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-orange-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Call Restaurant</p>
                    <p className="text-xs text-zinc-500">{restaurantPhone}</p>
                  </div>
                </a>
              )}
              
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full h-12 rounded-xl border-zinc-700 bg-transparent text-white mt-2"
              >
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

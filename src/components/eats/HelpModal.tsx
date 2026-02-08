/**
 * Help Modal Component
 * Support options for order issues
 */
import { Phone, MessageCircle, RefreshCw, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantPhone?: string | null;
}

const helpOptions = [
  {
    id: "contact",
    icon: MessageCircle,
    title: "Contact Support",
    description: "Chat with our support team",
    action: "support",
  },
  {
    id: "issue",
    icon: HelpCircle,
    title: "Report an Issue",
    description: "Wrong or missing items, quality concerns",
    action: "report",
  },
  {
    id: "refund",
    icon: RefreshCw,
    title: "Request Refund",
    description: "Get help with refunds or credits",
    action: "refund",
  },
];

export function HelpModal({
  open,
  onOpenChange,
  orderId,
  restaurantPhone,
}: HelpModalProps) {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    onOpenChange(false);
    
    switch (action) {
      case "support":
        navigate("/support");
        break;
      case "report":
        navigate(`/support?type=order_issue&order_id=${orderId}`);
        break;
      case "refund":
        navigate(`/support?type=refund&order_id=${orderId}`);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Need Help?</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {helpOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleAction(option.action)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-orange-500/30 transition-all text-left active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <option.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{option.title}</p>
                <p className="text-xs text-zinc-500">{option.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </motion.button>
          ))}

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
        </div>

        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full h-12 rounded-xl border-zinc-700 bg-transparent text-white"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

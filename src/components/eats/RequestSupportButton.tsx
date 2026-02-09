/**
 * Request Support Button for Order Chat header
 * Shows three states: default, waiting, active
 */
import { Headset, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useOrderSupportRequest, SupportStatus } from "@/hooks/useOrderSupportRequest";
import { useState } from "react";
import { toast } from "sonner";

interface RequestSupportButtonProps {
  orderId: string;
  chatId: string | undefined;
  onAgentJoined?: () => void;
}

export function RequestSupportButton({
  orderId,
  chatId,
  onAgentJoined,
}: RequestSupportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { supportStatus, requestSupport, isRequesting } = useOrderSupportRequest({
    orderId,
    chatId,
    onAgentJoined: () => {
      toast.success("A support agent has joined the chat", {
        icon: <Headset className="w-4 h-4" />,
      });
      onAgentJoined?.();
    },
  });

  const handleRequest = async () => {
    try {
      await requestSupport();
      setDialogOpen(false);
      toast.success("Support requested! An agent will join shortly.");
    } catch {
      toast.error("Failed to request support. Please try again.");
    }
  };

  // Active state - agent joined
  if (supportStatus === "active") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
        <CheckCircle className="w-3 h-3" />
        Support joined
      </Badge>
    );
  }

  // Waiting state - request sent
  if (supportStatus === "waiting") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10 gap-1.5"
      >
        <Loader2 className="w-3 h-3 animate-spin" />
        Support joining...
      </Button>
    );
  }

  // Default state - can request
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 gap-1.5"
        >
          <Headset className="w-3 h-3" />
          Support
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headset className="w-5 h-5 text-orange-500" />
            Request live support?
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            A support agent will join this chat to help with your order.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="text-zinc-400">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleRequest}
            disabled={isRequesting}
            className="bg-orange-500 hover:bg-orange-600 gap-1.5"
          >
            {isRequesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Headset className="w-3 h-3" />
            )}
            Request Support
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

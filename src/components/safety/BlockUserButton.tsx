/**
 * Block User Button
 * Confirmation dialog for blocking a user
 */
import { useState } from "react";
import { Ban, ShieldX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUserBlocks } from "@/hooks/useUserBlocks";

interface BlockUserButtonProps {
  userId: string;
  userName?: string;
  variant?: "icon" | "button" | "dropdown-item";
  className?: string;
}

export function BlockUserButton({
  userId,
  userName,
  variant = "button",
  className,
}: BlockUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { blockUser } = useUserBlocks();

  const handleBlock = async () => {
    await blockUser.mutateAsync({
      blockedUserId: userId,
      reason: reason.trim() || "No reason provided",
    });
    setOpen(false);
    setReason("");
  };

  const trigger =
    variant === "icon" ? (
      <Button
        variant="ghost"
        size="icon"
        className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 ${className}`}
      >
        <Ban className="w-4 h-4" />
      </Button>
    ) : variant === "dropdown-item" ? (
      <button className={`flex items-center gap-2 text-red-400 w-full px-2 py-1.5 hover:bg-red-500/10 rounded ${className}`}>
        <Ban className="w-4 h-4" />
        Block User
      </button>
    ) : (
      <Button
        variant="outline"
        className={`border-red-500/30 text-red-400 hover:bg-red-500/10 ${className}`}
      >
        <Ban className="w-4 h-4 mr-2" />
        Block User
      </Button>
    );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <ShieldX className="w-5 h-5 text-red-500" />
            Block {userName || "User"}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            They won't be able to interact with you in future orders. This action can be undone later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          <Label className="text-zinc-300 text-sm">Reason (optional)</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you blocking this user?"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlock}
            disabled={blockUser.isPending}
            className="bg-red-500 hover:bg-red-600"
          >
            {blockUser.isPending ? "Blocking..." : "Block User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

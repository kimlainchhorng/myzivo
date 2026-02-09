/**
 * Start Group Order Button
 * Shown on restaurant menu page to initiate a group order session
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupOrder } from "@/hooks/useGroupOrder";
import { toast } from "sonner";

interface StartGroupOrderButtonProps {
  restaurantId: string;
}

export function StartGroupOrderButton({ restaurantId }: StartGroupOrderButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startGroupOrder } = useGroupOrder();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!user) {
      toast.error("Please log in to start a group order");
      navigate("/login");
      return;
    }

    setIsStarting(true);
    const inviteCode = await startGroupOrder(restaurantId);
    setIsStarting(false);

    if (inviteCode) {
      navigate(`/eats/group/${inviteCode}`);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStart}
      disabled={isStarting}
      className="gap-2"
    >
      {isStarting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Users className="w-4 h-4" />
      )}
      Group Order
    </Button>
  );
}

import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

interface Props {
  isSubscribed: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  disabled?: boolean;
}

export function SubscribeButton({ isSubscribed, onSubscribe, onUnsubscribe, disabled }: Props) {
  if (isSubscribed) {
    return (
      <Button variant="secondary" onClick={onUnsubscribe} disabled={disabled} className="gap-2">
        <BellOff className="h-4 w-4" /> Subscribed
      </Button>
    );
  }
  return (
    <Button onClick={onSubscribe} disabled={disabled} className="gap-2">
      <Bell className="h-4 w-4" /> Subscribe
    </Button>
  );
}

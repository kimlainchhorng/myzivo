/**
 * ReadReceipt — Double-check marks for message read status
 */
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadReceiptProps {
  status: "sent" | "delivered" | "read";
  className?: string;
}

export default function ReadReceipt({ status, className }: ReadReceiptProps) {
  if (status === "read") {
    return <CheckCheck className={cn("h-3.5 w-3.5 text-blue-500", className)} />;
  }
  if (status === "delivered") {
    return <CheckCheck className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
  }
  return <Check className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
}

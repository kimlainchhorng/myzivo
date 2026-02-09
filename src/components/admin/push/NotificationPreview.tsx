/**
 * Notification Preview
 * Shows how the push notification will appear on devices
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

interface NotificationPreviewProps {
  title: string;
  body: string;
  icon?: string;
}

export function NotificationPreview({ title, body, icon }: NotificationPreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Notification Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-xl p-1">
          {/* iOS-style notification */}
          <div className="bg-background rounded-lg p-3 shadow-sm">
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {icon ? (
                  <img src={icon} alt="Icon" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  "Z"
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    ZIVO
                  </span>
                  <span className="text-xs text-muted-foreground">now</span>
                </div>
                <p className="font-semibold text-sm truncate mt-0.5">
                  {title || "Notification Title"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {body || "Notification body text will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Character counts */}
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span>Title: {title.length}/50</span>
          <span>Body: {body.length}/200</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationPreview;

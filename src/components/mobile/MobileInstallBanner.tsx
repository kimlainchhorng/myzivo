/**
 * Mobile Install Banner
 * Prompts users to install the PWA
 */

import { useState } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileApp } from '@/hooks/useMobileApp';
import { cn } from '@/lib/utils';

interface MobileInstallBannerProps {
  className?: string;
}

export default function MobileInstallBanner({ className }: MobileInstallBannerProps) {
  const {
    platform,
    canInstall,
    shouldShowInstallBanner,
    showInstallPrompt,
    getIOSInstallInstructions,
    dismissInstallBanner,
  } = useMobileApp();

  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !shouldShowInstallBanner()) return null;

  const handleDismiss = () => {
    dismissInstallBanner();
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (platform === 'ios') {
      setShowInstructions(true);
    } else if (canInstall) {
      const installed = await showInstallPrompt();
      if (installed) {
        setDismissed(true);
      }
    }
  };

  if (showInstructions && platform === 'ios') {
    return (
      <div className={cn(
        "fixed inset-x-4 bottom-20 z-50 p-4 rounded-2xl bg-card border border-border shadow-xl animate-in slide-in-from-bottom-4",
        className
      )}>
        <button
          onClick={() => setShowInstructions(false)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Install ZIVO</h3>
            <p className="text-sm text-muted-foreground">Follow these steps:</p>
          </div>
        </div>

        <ol className="space-y-3">
          {getIOSInstallInstructions().map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm pt-0.5 flex items-center gap-2">
                {step}
                {index === 0 && <Share className="w-4 h-4 text-primary" />}
                {index === 1 && <Plus className="w-4 h-4 text-primary" />}
              </span>
            </li>
          ))}
        </ol>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => setShowInstructions(false)}
        >
          Got it
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-x-4 bottom-20 z-50 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-xl animate-in slide-in-from-bottom-4",
      className
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Get the ZIVO App</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Faster bookings, offline access & push alerts
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleInstall}
          className="flex-shrink-0"
        >
          Install
        </Button>
      </div>
    </div>
  );
}

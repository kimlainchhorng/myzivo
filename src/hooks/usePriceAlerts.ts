import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface PriceAlert {
  id: string;
  route: {
    from: string;
    fromCode: string;
    to: string;
    toCode: string;
  };
  targetPrice: number;
  currentPrice: number;
  historicalLow: number;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  flexibleDates: boolean;
  departureDate?: string;
  returnDate?: string;
  createdAt: Date;
  lastCheckedAt?: Date;
  triggered?: boolean;
  triggeredPrice?: number;
}

const STORAGE_KEY = 'zivo_price_alerts';

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored).map((alert: PriceAlert) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          lastCheckedAt: alert.lastCheckedAt ? new Date(alert.lastCheckedAt) : undefined,
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist alerts to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const createAlert = useCallback((
    route: PriceAlert['route'],
    targetPrice: number,
    currentPrice: number,
    historicalLow: number,
    email: string,
    notifications: PriceAlert['notifications'],
    flexibleDates: boolean,
    departureDate?: string,
    returnDate?: string
  ): PriceAlert => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      route,
      targetPrice,
      currentPrice,
      historicalLow,
      email,
      notifications,
      flexibleDates,
      departureDate,
      returnDate,
      createdAt: new Date(),
    };

    setAlerts(prev => [...prev, newAlert]);
    
    toast.success(
      `Price alert created for ${route.fromCode} → ${route.toCode}. We'll notify you when prices drop below $${targetPrice}.`
    );

    return newAlert;
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.info('Price alert removed');
  }, []);

  const updateAlert = useCallback((alertId: string, updates: Partial<PriceAlert>) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, ...updates } : a
    ));
  }, []);

  // Check price alerts using indicative price simulation
  // Note: Real price alerts would require user to check partner sites
  const checkAlerts = useCallback(async () => {
    if (alerts.length === 0) return;
    
    const updatedAlerts = alerts.map((alert) => {
      // Skip already triggered alerts
      if (alert.triggered) return alert;
      
      // TODO: Check real price from partner API
      // Price alerts disabled until real pricing API is integrated
      const newPrice = alert.currentPrice;
      const isTriggered = newPrice <= alert.targetPrice;

      return {
        ...alert,
        currentPrice: Math.round(newPrice),
        lastCheckedAt: new Date(),
        triggered: isTriggered,
        triggeredPrice: isTriggered ? Math.round(newPrice) : undefined,
      };
    });

    setAlerts(updatedAlerts);
  }, [alerts]);

  const getAlertForRoute = useCallback((fromCode: string, toCode: string): PriceAlert | undefined => {
    return alerts.find(a => 
      a.route.fromCode === fromCode && 
      a.route.toCode === toCode &&
      !a.triggered
    );
  }, [alerts]);

  const hasAlertForRoute = useCallback((fromCode: string, toCode: string): boolean => {
    return alerts.some(a => 
      a.route.fromCode === fromCode && 
      a.route.toCode === toCode &&
      !a.triggered
    );
  }, [alerts]);

  return {
    alerts,
    createAlert,
    removeAlert,
    updateAlert,
    checkAlerts,
    getAlertForRoute,
    hasAlertForRoute,
    activeAlertsCount: alerts.filter(a => !a.triggered).length,
  };
}

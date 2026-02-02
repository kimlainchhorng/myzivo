import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Car, UtensilsCrossed, Package } from 'lucide-react';

interface ServiceTogglesProps {
  enabledServices: {
    rides: boolean;
    eats: boolean;
    move: boolean;
  };
  onToggle: (service: 'rides' | 'eats' | 'move', enabled: boolean) => void;
  disabled?: boolean;
}

export const ServiceToggles = ({ enabledServices, onToggle, disabled }: ServiceTogglesProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <Label htmlFor="rides-toggle" className="cursor-pointer">
              Rides
            </Label>
          </div>
          <Switch
            id="rides-toggle"
            checked={enabledServices.rides}
            onCheckedChange={(checked) => onToggle('rides', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <UtensilsCrossed className="h-4 w-4 text-orange-600" />
            </div>
            <Label htmlFor="eats-toggle" className="cursor-pointer">
              Eats
            </Label>
          </div>
          <Switch
            id="eats-toggle"
            checked={enabledServices.eats}
            onCheckedChange={(checked) => onToggle('eats', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <Label htmlFor="move-toggle" className="cursor-pointer">
              Move
            </Label>
          </div>
          <Switch
            id="move-toggle"
            checked={enabledServices.move}
            onCheckedChange={(checked) => onToggle('move', checked)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

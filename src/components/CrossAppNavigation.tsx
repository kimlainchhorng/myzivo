import { ExternalLink, Loader2, Car, UtensilsCrossed, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCrossAppAuth, AppType } from "@/hooks/useCrossAppAuth";

const apps = [
  { 
    key: "main" as AppType, 
    label: "ZIVO Main", 
    description: "Book rides, order food, travel",
    icon: Home 
  },
  { 
    key: "restaurant" as AppType, 
    label: "ZIVO Restaurant", 
    description: "Manage your restaurant",
    icon: UtensilsCrossed 
  },
  { 
    key: "driver" as AppType, 
    label: "ZIVO Driver", 
    description: "Accept rides & deliveries",
    icon: Car 
  },
];

interface CrossAppNavigationProps {
  currentApp?: AppType;
}

const CrossAppNavigation = ({ currentApp = "main" }: CrossAppNavigationProps) => {
  const { navigateToApp, isRedirecting } = useCrossAppAuth();

  const otherApps = apps.filter(app => app.key !== currentApp);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isRedirecting}>
          {isRedirecting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Switch App
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>ZIVO Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {otherApps.map((app) => (
          <DropdownMenuItem
            key={app.key}
            onClick={() => navigateToApp(app.key)}
            className="cursor-pointer"
          >
            <app.icon className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">{app.label}</span>
              <span className="text-xs text-muted-foreground">{app.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CrossAppNavigation;

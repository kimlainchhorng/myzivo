import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download, FileText, Calendar, Share2, Printer,
  Smartphone, ExternalLink
} from 'lucide-react';
import { useItineraryExport, type FlightData } from '@/hooks/useItineraryExport';
import { cn } from '@/lib/utils';

interface ItineraryExportMenuProps {
  flight: FlightData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export default function ItineraryExportMenu({
  flight,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
}: ItineraryExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportToICS, exportToGoogleCalendar, exportToPDF, shareItinerary } = useItineraryExport();

  const menuItems = [
    {
      group: 'Export',
      items: [
        {
          label: 'Download PDF',
          icon: FileText,
          description: 'Print-ready itinerary',
          onClick: () => exportToPDF(flight),
        },
        {
          label: 'Print',
          icon: Printer,
          description: 'Open print dialog',
          onClick: () => exportToPDF(flight),
        },
      ],
    },
    {
      group: 'Calendar',
      items: [
        {
          label: 'Add to Google Calendar',
          icon: Calendar,
          description: 'Open in new tab',
          onClick: () => exportToGoogleCalendar(flight),
          external: true,
        },
        {
          label: 'Download .ics',
          icon: Download,
          description: 'Apple Calendar, Outlook',
          onClick: () => exportToICS(flight),
        },
      ],
    },
    {
      group: 'Share',
      items: [
        {
          label: 'Share Itinerary',
          icon: Share2,
          description: 'Send to others',
          onClick: () => shareItinerary(flight),
        },
      ],
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn("gap-2", className)}>
          <Download className="w-4 h-4" />
          {showLabel && size !== 'icon' && 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuItems.map((group, groupIndex) => (
          <div key={group.group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {group.group}
            </DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem
                key={item.label}
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick();
                  setIsOpen(false);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      {item.label}
                      {item.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

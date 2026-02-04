/**
 * Airline Partners Grid Component
 * Alliance-grouped grid with tab filtering
 */

import { useState, useMemo } from 'react';
import { Globe, Star, Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AirlineLogoCard } from './AirlineLogoCard';
import { 
  allAirlines, 
  getAirlinesByAllianceGroup,
  type Airline 
} from '@/data/airlines';

interface AirlinePartnersGridProps {
  maxDisplay?: number;
  showTabs?: boolean;
  className?: string;
}

type AllianceKey = 'all' | 'Star Alliance' | 'SkyTeam' | 'Oneworld' | 'Independent';

const allianceConfig: Record<AllianceKey, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All Airlines', icon: Globe, color: 'text-primary' },
  'Star Alliance': { label: 'Star Alliance', icon: Star, color: 'text-amber-500' },
  'SkyTeam': { label: 'SkyTeam', icon: Users, color: 'text-sky-500' },
  'Oneworld': { label: 'Oneworld', icon: Crown, color: 'text-rose-500' },
  'Independent': { label: 'Independent', icon: Globe, color: 'text-muted-foreground' },
};

export default function AirlinePartnersGrid({ 
  maxDisplay = 24, 
  showTabs = true,
  className 
}: AirlinePartnersGridProps) {
  const [activeTab, setActiveTab] = useState<AllianceKey>('all');
  
  const allianceGroups = useMemo(() => getAirlinesByAllianceGroup(), []);
  
  const displayedAirlines = useMemo(() => {
    if (activeTab === 'all') {
      // Mix premium, full-service for balanced display
      const sorted = [...allAirlines].sort((a, b) => {
        const categoryOrder = { premium: 0, 'full-service': 1, 'low-cost': 2 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      });
      return sorted.slice(0, maxDisplay);
    }
    return allianceGroups[activeTab]?.slice(0, maxDisplay) || [];
  }, [activeTab, allianceGroups, maxDisplay]);

  const allianceCounts = useMemo(() => ({
    all: allAirlines.length,
    'Star Alliance': allianceGroups['Star Alliance']?.length || 0,
    'SkyTeam': allianceGroups['SkyTeam']?.length || 0,
    'Oneworld': allianceGroups['Oneworld']?.length || 0,
    'Independent': allianceGroups['Independent']?.length || 0,
  }), [allianceGroups]);

  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Global Partners
          </div>
          <h2 className="text-heading-lg mb-3">
            <span className="text-foreground">{allAirlines.length}+</span>{' '}
            <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
              Airline Partners
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare prices across all major airlines and alliances worldwide
          </p>
        </div>

        {/* Tabs */}
        {showTabs && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AllianceKey)} className="mb-8">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent p-0">
              {(Object.keys(allianceConfig) as AllianceKey[]).map((key) => {
                const config = allianceConfig[key];
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium',
                      'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                      'data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground',
                      'transition-all duration-200'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 mr-1.5', activeTab === key && 'text-current')} />
                    {config.label}
                    <span className="ml-1.5 text-xs opacity-70">
                      ({allianceCounts[key]})
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}

        {/* Airlines Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayedAirlines.map((airline, index) => (
            <div
              key={airline.code}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
            >
              <AirlineLogoCard
                airline={airline}
                size="md"
                showAlliance={activeTab === 'all'}
                showCategory={false}
              />
            </div>
          ))}
        </div>

        {/* View All Link */}
        {displayedAirlines.length < allianceCounts[activeTab] && (
          <div className="text-center mt-8">
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View all {allianceCounts[activeTab]} airlines →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

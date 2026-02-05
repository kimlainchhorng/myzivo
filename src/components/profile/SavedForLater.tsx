/**
 * SavedForLater Component
 * Sidebar showing bookmarked items and quick actions
 */
import { Link } from "react-router-dom";
import { Bookmark, CreditCard, Users, Settings, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  icon: typeof Bookmark;
  label: string;
  href: string;
}

const quickActions: QuickAction[] = [
  { icon: Settings, label: "Edit Profile", href: "/profile" },
  { icon: Users, label: "Saved Travelers", href: "/profile#travelers" },
  { icon: CreditCard, label: "Payment Methods", href: "/profile#payment" },
  { icon: Heart, label: "Wishlist", href: "/profile#wishlist" },
];

export function SavedForLater() {
  // In a real app, this would fetch saved items from the database
  const savedItems: Array<{ id: string; type: string; title: string; subtitle: string }> = [];

  return (
    <div className="space-y-6">
      {/* Saved Items Section */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Saved for Later
          </h3>
        </div>

        {savedItems.length > 0 ? (
          <div className="space-y-3">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="font-medium text-foreground text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bookmark className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No saved items yet
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/hotels">Browse Hotels</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Quick Actions
        </h3>

        <div className="space-y-1">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SavedForLater;
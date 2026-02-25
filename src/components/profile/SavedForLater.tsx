/**
 * SavedForLater Component
 * Premium 2026-era sidebar with dark zinc aesthetic
 */
import { Link } from "react-router-dom";
import { Bookmark, CreditCard, Users, Settings, ChevronRight, Heart } from "lucide-react";

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
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 h-full min-h-[400px]">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
        Saved for Later
      </h3>

      {savedItems.length > 0 ? (
        <div className="space-y-3 mb-6">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="font-medium text-white text-sm">{item.title}</div>
              <div className="text-xs text-zinc-500">{item.subtitle}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <Bookmark className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-3">
            No saved items yet
          </p>
          <Link 
            to="/hotels"
            className="inline-block text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-[0.97] touch-manipulation"
          >
            Browse Hotels
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-white/5 pt-4">
        <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">
          Quick Actions
        </h4>
        <div className="space-y-1">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">{action.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SavedForLater;
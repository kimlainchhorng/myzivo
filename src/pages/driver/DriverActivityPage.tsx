import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Car, UtensilsCrossed, Package, Wallet, ArrowDownToLine, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentDriver } from "@/hooks/useCurrentDriver";
import {
  useDriverActivityFeed,
  filterActivity,
  groupByDate,
  type ActivityFilter,
  type ActivityItem,
} from "@/hooks/useDriverActivityFeed";
import { formatDistanceToNow } from "date-fns";

const FILTERS: { value: ActivityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "deliveries", label: "Deliveries" },
  { value: "earnings", label: "Earnings" },
  { value: "payouts", label: "Payouts" },
];

const iconMap: Record<string, React.ReactNode> = {
  green: <Car className="w-4 h-4 text-green-400" />,
  blue: <UtensilsCrossed className="w-4 h-4 text-blue-400" />,
  purple: <ArrowDownToLine className="w-4 h-4 text-purple-400" />,
  amber: <Award className="w-4 h-4 text-amber-400" />,
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const isPositive = item.amount >= 0;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        {iconMap[item.iconColor] || <Wallet className="w-4 h-4 text-white/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{item.title}</p>
        <p className="text-xs text-white/40 truncate">{item.description}</p>
        <div className="flex items-center gap-1 mt-0.5 text-xs text-white/30">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </div>
      </div>
      <span
        className={`text-sm font-bold tabular-nums shrink-0 ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        {isPositive ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
      </span>
    </div>
  );
}

const DriverActivityPage = () => {
  const navigate = useNavigate();
  const { driver } = useCurrentDriver();
  const { data: items = [], isLoading } = useDriverActivityFeed(driver?.id);
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const filtered = filterActivity(items, filter);
  const groups = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/driver")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex-1">Activity</h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-lg mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="py-16 text-center text-white/40">Loading activity…</div>
        ) : groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No activity yet</p>
            <p className="text-white/20 text-xs mt-1">Complete deliveries to see your earnings here</p>
          </motion.div>
        ) : (
          groups.map((group) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-1">
                {group.label}
              </p>
              <div className="bg-zinc-900/60 rounded-xl border border-white/5 px-4">
                {group.items.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverActivityPage;

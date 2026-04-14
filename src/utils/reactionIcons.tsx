/**
 * reactionIcons — Maps reaction keys to Lucide icon components
 * Used in livestream chat reactions and floating animations
 */
import Heart from "lucide-react/dist/esm/icons/heart";
import Flame from "lucide-react/dist/esm/icons/flame";
import Star from "lucide-react/dist/esm/icons/star";
import Hand from "lucide-react/dist/esm/icons/hand";
import Laugh from "lucide-react/dist/esm/icons/laugh";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Crown from "lucide-react/dist/esm/icons/crown";
import Gem from "lucide-react/dist/esm/icons/gem";
import Zap from "lucide-react/dist/esm/icons/zap";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import Gift from "lucide-react/dist/esm/icons/gift";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Medal from "lucide-react/dist/esm/icons/medal";
import Target from "lucide-react/dist/esm/icons/target";
import Waves from "lucide-react/dist/esm/icons/waves";
import Music from "lucide-react/dist/esm/icons/music";
import Clapperboard from "lucide-react/dist/esm/icons/clapperboard";
import Swords from "lucide-react/dist/esm/icons/swords";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";

/** Quick reaction definitions for reaction bar */
export const QUICK_REACTIONS = [
  { key: "heart", label: "Love" },
  { key: "fire", label: "Fire" },
  { key: "star", label: "Star" },
  { key: "clap", label: "Clap" },
  { key: "laugh", label: "Laugh" },
] as const;

/** Render a reaction icon by key */
export function ReactionIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  switch (name) {
    case "heart": return <Heart className={`${className} text-red-400`} />;
    case "fire": return <Flame className={`${className} text-orange-400`} />;
    case "star": return <Star className={`${className} text-yellow-400`} />;
    case "clap": return <Hand className={`${className} text-white/80`} />;
    case "laugh": return <Laugh className={`${className} text-amber-300`} />;
    case "thumbsup": return <ThumbsUp className={`${className} text-blue-400`} />;
    case "sparkle": return <Sparkles className={`${className} text-purple-300`} />;
    case "crown": return <Crown className={`${className} text-amber-400`} />;
    case "gem": return <Gem className={`${className} text-sky-400`} />;
    case "zap": return <Zap className={`${className} text-yellow-300`} />;
    case "party": return <PartyPopper className={`${className} text-pink-400`} />;
    case "gift": return <Gift className={`${className} text-amber-300`} />;
    case "trophy": return <Trophy className={`${className} text-amber-400`} />;
    case "medal": return <Medal className={`${className} text-amber-300`} />;
    case "target": return <Target className={`${className} text-red-400`} />;
    case "wave": return <Waves className={`${className} text-blue-300`} />;
    case "music": return <Music className={`${className} text-violet-300`} />;
    case "film": return <Clapperboard className={`${className} text-white/70`} />;
    case "swords": return <Swords className={`${className} text-red-400`} />;
    case "poll": return <BarChart3 className={`${className} text-blue-400`} />;
    case "chat": return <MessageCircle className={`${className} text-white/70`} />;
    case "trending": return <TrendingUp className={`${className} text-green-400`} />;
    case "coins": return <DollarSign className={`${className} text-emerald-400`} />;
    default: return <Heart className={`${className} text-red-400`} />;
  }
}

/** Medal icons for leaderboard positions */
export function MedalIcon({ position, className = "h-4 w-4" }: { position: number; className?: string }) {
  switch (position) {
    case 0: return <Medal className={`${className} text-amber-400`} />;
    case 1: return <Medal className={`${className} text-gray-300`} />;
    case 2: return <Medal className={`${className} text-orange-400`} />;
    default: return <span className="text-[10px] text-white/50 font-bold">{position + 1}</span>;
  }
}

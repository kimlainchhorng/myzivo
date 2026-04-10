import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Camera, Users, Send, Clock, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface CheckIn {
  id: string;
  user: string;
  location: string;
  caption: string;
  time: string;
  likes: number;
  comments: number;
  taggedFriends: string[];
}

const MOCK_CHECKINS: CheckIn[] = [
  { id: "1", user: "Alex M.", location: "Café Luna ☕", caption: "Best coffee in town!", time: "15m ago", likes: 23, comments: 5, taggedFriends: ["Sarah K."] },
  { id: "2", user: "Sarah K.", location: "Central Park 🌳", caption: "Morning walk vibes", time: "1h ago", likes: 45, comments: 8, taggedFriends: ["Alex M.", "Mike R."] },
  { id: "3", user: "DJ Nova", location: "Studio One 🎵", caption: "Late night session", time: "2h ago", likes: 67, comments: 12, taggedFriends: [] },
  { id: "4", user: "Mike R.", location: "FitZone Gym 💪", caption: "Leg day done!", time: "3h ago", likes: 34, comments: 3, taggedFriends: ["Tom L."] },
];

export default function CheckInPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");

  const handleCheckIn = () => {
    if (!location.trim()) return;
    setLocation("");
    setCaption("");
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Check-in</h1>
          </div>
          <Button size="sm" className="rounded-full gap-1" onClick={() => setShowCreate(!showCreate)}>
            <MapPin className="h-4 w-4" /> Check in
          </Button>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-b border-border">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <Input placeholder="Where are you?" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <Input placeholder="What's happening? (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input placeholder="Tag friends (optional)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCheckIn} className="gap-1"><Send className="h-3 w-3" /> Check in</Button>
              <Button size="sm" variant="outline" className="gap-1"><Camera className="h-3 w-3" /> Photo</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" /> Recent Check-ins
        </h2>
        {MOCK_CHECKINS.map((checkin, i) => (
          <motion.div key={checkin.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary text-xs">{checkin.user[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{checkin.user}</p>
                  <p className="text-xs text-muted-foreground">{checkin.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-sm font-medium text-primary">{checkin.location}</span>
              </div>
              {checkin.caption && <p className="text-sm text-foreground mb-2">{checkin.caption}</p>}
              {checkin.taggedFriends.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">with {checkin.taggedFriends.join(", ")}</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="flex items-center gap-1 text-xs hover:text-red-500 transition-colors">
                  <Heart className="h-3 w-3" /> {checkin.likes}
                </button>
                <button className="flex items-center gap-1 text-xs hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-3 w-3" /> {checkin.comments}
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

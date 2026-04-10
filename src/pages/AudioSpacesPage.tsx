import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mic, MicOff, Hand, Users, Plus, Radio, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Space {
  id: string;
  title: string;
  host: string;
  listeners: number;
  speakers: string[];
  isLive: boolean;
  topic: string;
}

const MOCK_SPACES: Space[] = [
  { id: "1", title: "Future of Travel Tech", host: "Alex M.", listeners: 342, speakers: ["Alex M.", "Sarah K.", "Mike R."], isLive: true, topic: "Technology" },
  { id: "2", title: "Music & Vibes Friday", host: "DJ Nova", listeners: 1200, speakers: ["DJ Nova", "Luna", "Ray B."], isLive: true, topic: "Music" },
  { id: "3", title: "Startup Stories", host: "Priya S.", listeners: 89, speakers: ["Priya S.", "Tom L."], isLive: true, topic: "Business" },
  { id: "4", title: "Mental Health Check-in", host: "Dr. Kim", listeners: 567, speakers: ["Dr. Kim", "Amy W.", "Carlos D.", "Nina P."], isLive: true, topic: "Wellness" },
];

const TOPICS = ["All", "Technology", "Music", "Business", "Wellness", "Sports", "Comedy"];

export default function AudioSpacesPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Technology");

  const filtered = selectedTopic === "All" ? MOCK_SPACES : MOCK_SPACES.filter(s => s.topic === selectedTopic);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    setActiveSpace({
      id: Date.now().toString(),
      title: newTitle,
      host: "You",
      listeners: 1,
      speakers: ["You"],
      isLive: true,
      topic: newTopic,
    });
    setIsMuted(false);
    setShowCreate(false);
    setNewTitle("");
  };

  if (activeSpace) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-gradient-to-b from-primary/20 to-background p-4 pt-12">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setActiveSpace(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Badge variant="destructive" className="animate-pulse gap-1">
              <Radio className="h-3 w-3" /> LIVE
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">{activeSpace.title}</h1>
          <p className="text-sm text-muted-foreground">{activeSpace.topic} · {activeSpace.listeners} listening</p>
        </div>

        <div className="flex-1 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Speakers</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {activeSpace.speakers.map((speaker) => (
              <motion.div key={speaker} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{speaker[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                    <Mic className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground truncate w-full text-center">{speaker}</span>
              </motion.div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            <Users className="h-4 w-4 inline mr-1" />
            Listeners ({activeSpace.listeners})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: Math.min(12, activeSpace.listeners) }).map((_, i) => (
              <Avatar key={i} className="h-10 w-10">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">U{i + 1}</AvatarFallback>
              </Avatar>
            ))}
            {activeSpace.listeners > 12 && (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{activeSpace.listeners - 12}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-center gap-4">
          <Button variant={handRaised ? "default" : "outline"} size="icon" className="rounded-full h-12 w-12" onClick={() => setHandRaised(!handRaised)}>
            <Hand className="h-5 w-5" />
          </Button>
          <Button variant={isMuted ? "outline" : "default"} size="icon" className="rounded-full h-14 w-14" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button variant="destructive" size="sm" className="rounded-full px-6" onClick={() => setActiveSpace(null)}>
            Leave
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Spaces</h1>
          </div>
          <Button size="sm" className="rounded-full gap-1" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TOPICS.map((topic) => (
            <Badge key={topic} variant={selectedTopic === topic ? "default" : "outline"} className="cursor-pointer whitespace-nowrap shrink-0"
              onClick={() => setSelectedTopic(topic)}>
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border">
            <div className="p-4 space-y-3">
              <Input placeholder="Space title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <div className="flex gap-2 flex-wrap">
                {TOPICS.filter(t => t !== "All").map((t) => (
                  <Badge key={t} variant={newTopic === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setNewTopic(t)}>{t}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>Go Live</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-3">
        {filtered.map((space) => (
          <Card key={space.id} className="p-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => { setActiveSpace(space); setIsMuted(true); setHandRaised(false); }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{space.topic}</Badge>
                  <Badge variant="destructive" className="text-xs gap-1 animate-pulse"><Radio className="h-2 w-2" /> LIVE</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{space.title}</h3>
                <p className="text-sm text-muted-foreground">Hosted by {space.host}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">{space.listeners}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {space.speakers.slice(0, 3).map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">{s[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              ))}
              {space.speakers.length > 3 && <span className="text-xs text-muted-foreground">+{space.speakers.length - 3}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Play, Pause, SkipForward, Users, MessageCircle, Send, Plus, Tv } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ChatMessage { id: string; user: string; text: string; time: string; }

const MOCK_ROOMS = [
  { id: "1", title: "Movie Night 🎬", host: "Alex M.", viewers: 24, media: "Inception (2010)", thumbnail: "🎬" },
  { id: "2", title: "Music Video Marathon 🎵", host: "DJ Nova", viewers: 89, media: "Top 50 Hits", thumbnail: "🎵" },
  { id: "3", title: "Travel Vlogs ✈️", host: "Sarah K.", viewers: 15, media: "Japan Vlog #12", thumbnail: "✈️" },
];

export default function WatchPartyPage() {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState<typeof MOCK_ROOMS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Alex", text: "This scene is amazing!", time: "now" },
    { id: "2", user: "Sarah", text: "🔥🔥🔥", time: "now" },
    { id: "3", user: "Mike", text: "Wait for the next part!", time: "now" },
  ]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), user: "You", text: chatInput, time: "now" }]);
    setChatInput("");
  };

  if (activeRoom) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-black aspect-video relative flex items-center justify-center">
          <div className="text-6xl">{activeRoom.thumbnail}</div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="text-white h-8 w-8"><SkipForward className="h-4 w-4" /></Button>
            </div>
            <Badge variant="destructive" className="text-xs gap-1"><Users className="h-3 w-3" />{activeRoom.viewers}</Badge>
          </div>
        </div>

        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground text-sm">{activeRoom.title}</h2>
              <p className="text-xs text-muted-foreground">Now playing: {activeRoom.media}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setActiveRoom(null)}>Leave</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px]">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6"><AvatarFallback className="text-xs bg-primary/20 text-primary">{msg.user[0]}</AvatarFallback></Avatar>
              <div>
                <span className="text-xs font-semibold text-foreground">{msg.user}</span>
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <Input placeholder="Say something..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="text-sm" />
          <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
            <Tv className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Watch Party</h1>
          </div>
          <Button size="sm" className="rounded-full gap-1"><Plus className="h-4 w-4" /> Create Room</Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {MOCK_ROOMS.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setActiveRoom(room)}>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl">{room.thumbnail}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{room.title}</h3>
                  <p className="text-xs text-muted-foreground">Hosted by {room.host}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs gap-1"><Users className="h-3 w-3" />{room.viewers}</Badge>
                    <Badge variant="secondary" className="text-xs">{room.media}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

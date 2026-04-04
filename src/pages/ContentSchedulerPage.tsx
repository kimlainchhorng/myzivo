import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, Plus, Image, Video, BarChart3, Trash2, Edit, Send, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  mediaType: "text" | "photo" | "video" | "poll";
  scheduledAt: Date;
  status: "scheduled" | "published" | "failed";
}

const MOCK_SCHEDULED: ScheduledPost[] = [
  { id: "1", content: "Check out our latest travel deals! ✈️🌍", mediaType: "photo", scheduledAt: new Date(Date.now() + 3600000 * 2), status: "scheduled" },
  { id: "2", content: "Friday vibes! What's your weekend plan?", mediaType: "poll", scheduledAt: new Date(Date.now() + 3600000 * 24), status: "scheduled" },
  { id: "3", content: "Behind the scenes of our new feature launch 🚀", mediaType: "video", scheduledAt: new Date(Date.now() + 3600000 * 48), status: "scheduled" },
  { id: "4", content: "Happy Monday! Start your week with a smile 😊", mediaType: "text", scheduledAt: new Date(Date.now() - 3600000 * 24), status: "published" },
];

export default function ContentSchedulerPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(MOCK_SCHEDULED);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<"text" | "photo" | "video" | "poll">("text");
  const [activeTab, setActiveTab] = useState("upcoming");

  const scheduled = posts.filter(p => p.status === "scheduled").sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const published = posts.filter(p => p.status === "published");

  const handleCreate = () => {
    if (!newContent.trim() || !newDate || !newTime) return;
    const scheduledAt = new Date(`${newDate}T${newTime}`);
    setPosts(prev => [...prev, {
      id: Date.now().toString(),
      content: newContent,
      mediaType: newType,
      scheduledAt,
      status: "scheduled",
    }]);
    setNewContent("");
    setNewDate("");
    setNewTime("");
    setShowCreate(false);
  };

  const deletePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));

  const typeIcon = (type: string) => {
    switch (type) {
      case "photo": return <Image className="h-3 w-3" />;
      case "video": return <Video className="h-3 w-3" />;
      case "poll": return <BarChart3 className="h-3 w-3" />;
      default: return <Edit className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Content Scheduler</h1>
          </div>
          <Button size="sm" className="rounded-full gap-1" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" /> Schedule
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border">
            <div className="p-4 space-y-3">
              <Textarea placeholder="What do you want to share?" value={newContent} onChange={(e) => setNewContent(e.target.value)} className="min-h-[80px]" />
              <div className="flex gap-2">
                {(["text", "photo", "video", "poll"] as const).map((type) => (
                  <Badge key={type} variant={newType === type ? "default" : "outline"} className="cursor-pointer capitalize gap-1" onClick={() => setNewType(type)}>
                    {typeIcon(type)} {type}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1" />
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-32" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} className="gap-1"><Send className="h-3 w-3" /> Schedule</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1 gap-1">
            <Clock className="h-3 w-3" /> Upcoming ({scheduled.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="flex-1 gap-1">
            <Eye className="h-3 w-3" /> Published ({published.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {scheduled.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No scheduled posts</p>
              <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>Schedule your first post</Button>
            </div>
          ) : (
            scheduled.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs gap-1 capitalize">{typeIcon(post.mediaType)} {post.mediaType}</Badge>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-2 w-2" /> {format(post.scheduledAt, "MMM d, h:mm a")}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePost(post.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">{post.content}</p>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-4 space-y-3">
          {published.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 opacity-70">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-xs">Published</Badge>
                  <span className="text-xs text-muted-foreground">{format(post.scheduledAt, "MMM d, h:mm a")}</span>
                </div>
                <p className="text-sm text-foreground">{post.content}</p>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

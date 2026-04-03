import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Link2, Plus, Trash2, GripVertical, Eye, ExternalLink, BarChart3, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface BioLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
  icon: string;
}

const MOCK_LINKS: BioLink[] = [
  { id: "1", title: "My Website", url: "https://example.com", clicks: 342, icon: "🌐" },
  { id: "2", title: "Latest Blog Post", url: "https://blog.example.com/latest", clicks: 128, icon: "📝" },
  { id: "3", title: "Shop My Store", url: "https://store.example.com", clicks: 89, icon: "🛍️" },
  { id: "4", title: "YouTube Channel", url: "https://youtube.com/@example", clicks: 567, icon: "📺" },
  { id: "5", title: "Book a Call", url: "https://cal.com/example", clicks: 45, icon: "📞" },
];

const THEMES = [
  { id: "default", label: "Default", bg: "bg-background", text: "text-foreground" },
  { id: "dark", label: "Dark", bg: "bg-zinc-900", text: "text-white" },
  { id: "gradient", label: "Gradient", bg: "bg-gradient-to-b from-primary/20 to-background", text: "text-foreground" },
  { id: "minimal", label: "Minimal", bg: "bg-white", text: "text-zinc-900" },
];

export default function LinkHubPage() {
  const navigate = useNavigate();
  const [links, setLinks] = useState(MOCK_LINKS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [isPreview, setIsPreview] = useState(false);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setLinks(prev => [...prev, { id: Date.now().toString(), title: newTitle, url: newUrl, clicks: 0, icon: "🔗" }]);
    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
  };

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id));
  const theme = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  if (isPreview) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} pb-20`}>
        <div className="max-w-md mx-auto pt-12 px-4">
          <div className="flex flex-col items-center mb-8">
            <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">Y</AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold">@yourusername</h1>
            <p className="text-sm opacity-70">Creator • Traveler • Dreamer ✨</p>
          </div>
          <div className="space-y-3">
            {links.map((link, i) => (
              <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="block">
                <Card className="p-4 text-center hover:scale-[1.02] transition-transform cursor-pointer">
                  <span className="mr-2">{link.icon}</span>
                  <span className="font-medium">{link.title}</span>
                </Card>
              </motion.a>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="ghost" size="sm" onClick={() => setIsPreview(false)}>← Back to Editor</Button>
          </div>
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
            <Link2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Link Hub</h1>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setIsPreview(true)}>
              <Eye className="h-3 w-3" /> Preview
            </Button>
            <Button size="sm" className="gap-1" onClick={() => setShowAdd(true)}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Links</p>
          <p className="text-lg font-bold text-foreground">{links.length}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Clicks</p>
          <p className="text-lg font-bold text-foreground">{totalClicks}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">CTR</p>
          <p className="text-lg font-bold text-foreground">{links.length > 0 ? Math.round(totalClicks / links.length) : 0}</p>
        </Card>
      </div>

      {/* Theme Picker */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Palette className="h-4 w-4" /> Theme</h3>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setSelectedTheme(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTheme === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Link Form */}
      {showAdd && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4">
          <Card className="p-4 space-y-2">
            <Input placeholder="Link title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addLink}>Add Link</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Links List */}
      <div className="px-4 space-y-2">
        {links.map((link, i) => (
          <motion.div key={link.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-3 flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
              <span className="text-lg shrink-0">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
              <Badge variant="secondary" className="text-xs gap-1 shrink-0"><BarChart3 className="h-2 w-2" />{link.clicks}</Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeLink(link.id)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

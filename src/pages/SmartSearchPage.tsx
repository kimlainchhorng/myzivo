import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, User, ShoppingBag, Hash, FileText, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TRENDING = ["#travel", "#photography", "#food", "#fitness", "#tech", "#music"];

const MOCK_RESULTS = {
  users: [
    { id: "1", name: "Alex Morgan", handle: "@alexm", bio: "Travel photographer", followers: 12400 },
    { id: "2", name: "Sarah Kim", handle: "@sarahk", bio: "Digital nomad & writer", followers: 8900 },
    { id: "3", name: "Mike Ross", handle: "@mikeross", bio: "Fitness coach", followers: 34000 },
  ],
  posts: [
    { id: "1", author: "Alex Morgan", content: "Beautiful sunset in Bali! 🌅", likes: 234, time: "2h ago" },
    { id: "2", author: "Sarah Kim", content: "Best coffee spots in Tokyo ☕", likes: 567, time: "5h ago" },
  ],
  communities: [
    { id: "1", name: "Travel Buddies", members: 12500, description: "Connect with fellow travelers" },
    { id: "2", name: "Photography Hub", members: 8900, description: "Share and learn photography" },
  ],
  marketplace: [
    { id: "1", title: "Vintage Camera", price: "$120", seller: "PhotoGear", condition: "Like New" },
    { id: "2", title: "Travel Backpack", price: "$85", seller: "OutdoorPro", condition: "New" },
  ],
};

export default function SmartSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [recentSearches, setRecentSearches] = useState(["flights to paris", "best hotels NYC", "travel tips"]);

  const hasResults = query.length >= 2;

  const filteredResults = useMemo(() => {
    if (!hasResults) return null;
    const q = query.toLowerCase();
    return {
      users: MOCK_RESULTS.users.filter(u => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)),
      posts: MOCK_RESULTS.posts.filter(p => p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)),
      communities: MOCK_RESULTS.communities.filter(c => c.name.toLowerCase().includes(q)),
      marketplace: MOCK_RESULTS.marketplace.filter(m => m.title.toLowerCase().includes(q)),
    };
  }, [query, hasResults]);

  const totalResults = filteredResults ? Object.values(filteredResults).reduce((sum, arr) => sum + arr.length, 0) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search everything..." value={query} onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9" autoFocus />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {!hasResults ? (
        <div className="p-4 space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recent</h3>
              <div className="space-y-1">
                {recentSearches.map((s, i) => (
                  <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent text-sm text-foreground">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Trending
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((tag) => (
                <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => setQuery(tag.replace("#", ""))}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start px-4 bg-transparent border-b border-border rounded-none">
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="users"><User className="h-3 w-3 mr-1" />People</TabsTrigger>
              <TabsTrigger value="posts"><FileText className="h-3 w-3 mr-1" />Posts</TabsTrigger>
              <TabsTrigger value="communities"><Hash className="h-3 w-3 mr-1" />Groups</TabsTrigger>
              <TabsTrigger value="marketplace"><ShoppingBag className="h-3 w-3 mr-1" />Market</TabsTrigger>
            </TabsList>

            <div className="p-4 space-y-4">
              <TabsContent value="all" className="m-0 space-y-4">
                {filteredResults?.users.slice(0, 2).map((u) => (
                  <UserCard key={u.id} user={u} />
                ))}
                {filteredResults?.posts.slice(0, 2).map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
                {filteredResults?.communities.slice(0, 1).map((c) => (
                  <CommunityCard key={c.id} community={c} />
                ))}
                {filteredResults?.marketplace.slice(0, 1).map((m) => (
                  <MarketCard key={m.id} item={m} />
                ))}
                {totalResults === 0 && <p className="text-center text-muted-foreground py-8">No results for "{query}"</p>}
              </TabsContent>
              <TabsContent value="users" className="m-0 space-y-3">
                {filteredResults?.users.map((u) => <UserCard key={u.id} user={u} />)}
              </TabsContent>
              <TabsContent value="posts" className="m-0 space-y-3">
                {filteredResults?.posts.map((p) => <PostCard key={p.id} post={p} />)}
              </TabsContent>
              <TabsContent value="communities" className="m-0 space-y-3">
                {filteredResults?.communities.map((c) => <CommunityCard key={c.id} community={c} />)}
              </TabsContent>
              <TabsContent value="marketplace" className="m-0 space-y-3">
                {filteredResults?.marketplace.map((m) => <MarketCard key={m.id} item={m} />)}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function UserCard({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-3 flex items-center gap-3">
        <Avatar><AvatarFallback className="bg-primary/20 text-primary">{user.name[0]}</AvatarFallback></Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.handle} · {(user.followers / 1000).toFixed(1)}k followers</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full text-xs">Follow</Button>
      </Card>
    </motion.div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-3">
        <p className="text-xs text-muted-foreground mb-1">{post.author} · {post.time}</p>
        <p className="text-sm text-foreground">{post.content}</p>
        <p className="text-xs text-muted-foreground mt-2">❤️ {post.likes}</p>
      </Card>
    </motion.div>
  );
}

function CommunityCard({ community }: { community: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center"><Hash className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{community.name}</p>
          <p className="text-xs text-muted-foreground">{community.members.toLocaleString()} members</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full text-xs">Join</Button>
      </Card>
    </motion.div>
  );
}

function MarketCard({ item }: { item: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.price} · {item.condition}</p>
        </div>
      </Card>
    </motion.div>
  );
}

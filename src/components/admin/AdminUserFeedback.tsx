import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Search, ThumbsUp, ThumbsDown, Tag, 
  MoreVertical, Reply, Archive, Flag, TrendingUp
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const feedbackItems = [
  { id: "1", user: "John Smith", type: "feature", title: "Add dark mode", content: "Would love to have a dark mode option for the app", votes: 128, status: "planned", date: "2 days ago", responded: true },
  { id: "2", user: "Sarah Johnson", type: "bug", title: "Payment failed on checkout", content: "Getting an error when trying to pay with Apple Pay", votes: 45, status: "in_progress", date: "3 days ago", responded: true },
  { id: "3", user: "Mike Brown", type: "improvement", title: "Faster driver matching", content: "Sometimes it takes too long to find a driver", votes: 89, status: "considering", date: "5 days ago", responded: false },
  { id: "4", user: "Emma Wilson", type: "feature", title: "Schedule rides in advance", content: "Would be great to book rides for future dates", votes: 234, status: "shipped", date: "1 week ago", responded: true },
  { id: "5", user: "David Lee", type: "improvement", title: "Better ETA accuracy", content: "The estimated arrival times are often inaccurate", votes: 67, status: "planned", date: "1 week ago", responded: false },
];

export default function AdminUserFeedback() {
  const [searchQuery, setSearchQuery] = useState("");

  const totalFeedback = 456;
  const openFeedback = 123;
  const responseRate = 78;
  const topVoted = 234;

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      feature: "bg-blue-500/10 text-blue-500",
      bug: "bg-red-500/10 text-red-500",
      improvement: "bg-purple-500/10 text-purple-500"
    };
    return <Badge className={config[type]}>{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      planned: "bg-blue-500/10 text-blue-500",
      in_progress: "bg-amber-500/10 text-amber-500",
      considering: "bg-purple-500/10 text-purple-500",
      shipped: "bg-green-500/10 text-green-500",
      closed: "bg-muted text-muted-foreground"
    };
    return <Badge className={config[status]}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            User Feedback
          </h2>
          <p className="text-muted-foreground">Feature requests and user suggestions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{openFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Reply className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ThumbsUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Votes</p>
                <p className="text-2xl font-bold">{topVoted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Feedback</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="bugs">Bugs</TabsTrigger>
            <TabsTrigger value="top">Top Voted</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search feedback..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="all" className="mt-4 space-y-4">
          {feedbackItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-sm">{item.votes}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                        {item.responded && (
                          <Badge variant="outline" className="text-green-500">
                            <Reply className="h-3 w-3 mr-1" />
                            Responded
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{item.user.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          {item.user}
                        </div>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Tag className="h-4 w-4 mr-2" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Flag className="h-4 w-4 mr-2" />
                        Flag as Spam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

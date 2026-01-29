import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, Send, Search, Clock, User, MoreVertical,
  Phone, Video, Paperclip, Smile, Circle, CheckCircle2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: "active" | "waiting" | "resolved";
  priority: "low" | "medium" | "high";
  agent?: string;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "agent" | "system";
  message: string;
  timestamp: string;
}

const mockConversations: ChatConversation[] = [
  { id: "1", customerName: "John Smith", customerEmail: "john@example.com", lastMessage: "I need help with my order", timestamp: "2 min ago", unread: 3, status: "active", priority: "high" },
  { id: "2", customerName: "Sarah Johnson", customerEmail: "sarah@example.com", lastMessage: "Thank you for the quick response!", timestamp: "5 min ago", unread: 0, status: "waiting", priority: "medium", agent: "Mike Ross" },
  { id: "3", customerName: "Mike Brown", customerEmail: "mike@example.com", lastMessage: "When will my refund be processed?", timestamp: "12 min ago", unread: 1, status: "active", priority: "high" },
  { id: "4", customerName: "Emma Wilson", customerEmail: "emma@example.com", lastMessage: "The driver was very rude", timestamp: "25 min ago", unread: 0, status: "waiting", priority: "high", agent: "Sarah Chen" },
  { id: "5", customerName: "David Lee", customerEmail: "david@example.com", lastMessage: "Issue resolved, thanks!", timestamp: "1 hour ago", unread: 0, status: "resolved", priority: "low" },
];

const mockMessages: ChatMessage[] = [
  { id: "1", sender: "system", message: "Chat started", timestamp: "10:30 AM" },
  { id: "2", sender: "customer", message: "Hi, I need help with my recent order. The driver never arrived.", timestamp: "10:31 AM" },
  { id: "3", sender: "agent", message: "Hello John! I'm sorry to hear about this issue. Let me look into your recent order.", timestamp: "10:32 AM" },
  { id: "4", sender: "agent", message: "I can see your order #12345 was placed 30 minutes ago. Let me check the driver's status.", timestamp: "10:33 AM" },
  { id: "5", sender: "customer", message: "Yes, that's the one. I've been waiting for over an hour now.", timestamp: "10:34 AM" },
  { id: "6", sender: "agent", message: "I apologize for the inconvenience. It looks like there was an issue with driver assignment. I'm going to assign a new driver right away and add a $5 credit to your account for the trouble.", timestamp: "10:35 AM" },
  { id: "7", sender: "customer", message: "I need help with my order", timestamp: "10:38 AM" },
];

export default function AdminLiveChat() {
  const [conversations] = useState<ChatConversation[]>(mockConversations);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(conversations[0]);
  const [messages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeChats = conversations.filter(c => c.status === "active").length;
  const waitingChats = conversations.filter(c => c.status === "waiting").length;

  const filteredConversations = conversations.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: ChatConversation["status"]) => {
    const config: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      waiting: "bg-amber-500/10 text-amber-500",
      resolved: "bg-muted text-muted-foreground"
    };
    return <Badge className={config[status]}>{status}</Badge>;
  };

  const getPriorityIndicator = (priority: ChatConversation["priority"]) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500",
      medium: "bg-amber-500",
      high: "bg-red-500"
    };
    return <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Live Chat Support
          </h2>
          <p className="text-muted-foreground">Real-time customer support interface</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            {activeChats} Active
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {waitingChats} Waiting
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-280px)]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedChat?.id === conv.id ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {conv.customerName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityIndicator(conv.priority)}
                          <span className="font-medium text-sm truncate">{conv.customerName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        {getStatusBadge(conv.status)}
                        {conv.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedChat.customerName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{selectedChat.customerName}</CardTitle>
                      <CardDescription>{selectedChat.customerEmail}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Customer Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Order History</DropdownMenuItem>
                        <DropdownMenuItem>Transfer Chat</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">End Chat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "agent" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}
                    >
                      {msg.sender === "system" ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {msg.message}
                        </span>
                      ) : (
                        <div className={`max-w-[70%] ${msg.sender === "agent" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}>
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-xs ${msg.sender === "agent" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {msg.timestamp}
                            </span>
                            {msg.sender === "agent" && (
                              <CheckCircle2 className="h-3 w-3 text-primary-foreground/70" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, Plus, Trash2, BarChart3, HelpCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PollOption { id: string; text: string; votes: number; }
interface QuizOption { id: string; text: string; isCorrect: boolean; }
interface StoryPoll {
  id: string;
  type: "poll" | "quiz";
  question: string;
  options: (PollOption | QuizOption)[];
  totalVotes: number;
  createdAt: string;
  active: boolean;
}

const MOCK_POLLS: StoryPoll[] = [
  {
    id: "1", type: "poll", question: "Best travel destination for 2026?",
    options: [
      { id: "a", text: "Japan 🇯🇵", votes: 142 },
      { id: "b", text: "Iceland 🇮🇸", votes: 89 },
      { id: "c", text: "Colombia 🇨🇴", votes: 67 },
      { id: "d", text: "New Zealand 🇳🇿", votes: 102 },
    ],
    totalVotes: 400, createdAt: "2h ago", active: true,
  },
  {
    id: "2", type: "quiz", question: "Which city is the capital of Australia?",
    options: [
      { id: "a", text: "Sydney", isCorrect: false },
      { id: "b", text: "Melbourne", isCorrect: false },
      { id: "c", text: "Canberra", isCorrect: true },
      { id: "d", text: "Brisbane", isCorrect: false },
    ],
    totalVotes: 250, createdAt: "5h ago", active: true,
  },
];

export default function StoryPollsPage() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<"poll" | "quiz">("poll");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const addOption = () => { if (options.length < 4) setOptions([...options, ""]); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };
  const updateOption = (i: number, val: string) => { const o = [...options]; o[i] = val; setOptions(o); };

  const handleCreate = () => {
    if (!question.trim() || options.some(o => !o.trim())) return;
    const newPoll: StoryPoll = {
      id: Date.now().toString(),
      type: createType,
      question,
      options: options.map((text, i) => createType === "quiz"
        ? { id: String(i), text, isCorrect: i === correctIndex }
        : { id: String(i), text, votes: 0 }),
      totalVotes: 0,
      createdAt: "Just now",
      active: true,
    };
    setPolls([newPoll, ...polls]);
    setQuestion("");
    setOptions(["", ""]);
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Polls & Quizzes</h1>
          </div>
          <Button size="sm" className="rounded-full gap-1" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border">
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Badge variant={createType === "poll" ? "default" : "outline"} className="cursor-pointer gap-1" onClick={() => setCreateType("poll")}>
                  <BarChart3 className="h-3 w-3" /> Poll
                </Badge>
                <Badge variant={createType === "quiz" ? "default" : "outline"} className="cursor-pointer gap-1" onClick={() => setCreateType("quiz")}>
                  <HelpCircle className="h-3 w-3" /> Quiz
                </Badge>
              </div>
              <Input placeholder="Ask a question..." value={question} onChange={(e) => setQuestion(e.target.value)} />
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {createType === "quiz" && (
                    <button onClick={() => setCorrectIndex(i)} className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${i === correctIndex ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {i === correctIndex && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                    </button>
                  )}
                  <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <Button variant="outline" size="sm" className="w-full gap-1" onClick={addOption}><Plus className="h-3 w-3" /> Add option</Button>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} className="gap-1"><Send className="h-3 w-3" /> Post to Story</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {polls.map((poll, i) => (
          <motion.div key={poll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={poll.type === "quiz" ? "secondary" : "outline"} className="text-xs capitalize gap-1">
                  {poll.type === "quiz" ? <HelpCircle className="h-3 w-3" /> : <BarChart3 className="h-3 w-3" />}
                  {poll.type}
                </Badge>
                {poll.active && <Badge variant="default" className="text-xs">Active</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{poll.createdAt}</span>
              </div>
              <p className="font-semibold text-foreground mb-3">{poll.question}</p>
              <div className="space-y-2">
                {poll.options.map((opt) => {
                  const isPoll = poll.type === "poll";
                  const votes = isPoll ? (opt as PollOption).votes : 0;
                  const pct = poll.totalVotes > 0 && isPoll ? Math.round((votes / poll.totalVotes) * 100) : 0;
                  const isCorrect = !isPoll && (opt as QuizOption).isCorrect;

                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`text-foreground ${isCorrect ? "font-semibold" : ""}`}>
                          {isCorrect && <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />}
                          {opt.text}
                        </span>
                        {isPoll && <span className="text-xs text-muted-foreground">{pct}%</span>}
                      </div>
                      {isPoll && <Progress value={pct} className="h-2" />}
                    </div>
                  );
                })}
              </div>
              {poll.totalVotes > 0 && (
                <p className="text-xs text-muted-foreground mt-3">{poll.totalVotes} votes</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

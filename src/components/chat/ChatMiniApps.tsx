/**
 * ChatMiniApps — In-chat polls, shared to-do lists, and split bills
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import ListTodo from "lucide-react/dist/esm/icons/list-todo";
import Receipt from "lucide-react/dist/esm/icons/receipt";
import Plus from "lucide-react/dist/esm/icons/plus";
import Check from "lucide-react/dist/esm/icons/check";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Vote from "lucide-react/dist/esm/icons/vote";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatMiniAppsProps {
  open: boolean;
  onClose: () => void;
  chatPartnerId: string;
  chatPartnerName: string;
}

type MiniApp = "menu" | "poll" | "todo" | "split";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
  is_closed: boolean;
  creator_id: string;
}

interface TodoItem {
  text: string;
  done: boolean;
}

interface Todo {
  id: string;
  title: string;
  items: TodoItem[];
  creator_id: string;
}

interface SplitBill {
  id: string;
  title: string;
  total_amount: number;
  splits: { userId: string; name: string; amount: number; paid: boolean }[];
  status: string;
  creator_id: string;
}

export default function ChatMiniApps({ open, onClose, chatPartnerId, chatPartnerName }: ChatMiniAppsProps) {
  const { user } = useAuth();
  const [view, setView] = useState<MiniApp>("menu");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [bills, setBills] = useState<SplitBill[]>([]);

  // Create states
  const [newPollQ, setNewPollQ] = useState("");
  const [newPollOpts, setNewPollOpts] = useState(["", ""]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoItems, setNewTodoItems] = useState([""]);
  const [newBillTitle, setNewBillTitle] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");

  useEffect(() => {
    if (!open || !user?.id) return;
    const loadAll = async () => {
      const [pollsRes, todosRes, billsRes] = await Promise.all([
        (supabase as any).from("chat_polls").select("*").or(`creator_id.eq.${user.id},chat_partner_id.eq.${user.id}`).eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false }),
        (supabase as any).from("chat_todos").select("*").or(`creator_id.eq.${user.id},chat_partner_id.eq.${user.id}`).eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false }),
        (supabase as any).from("chat_split_bills").select("*").or(`creator_id.eq.${user.id},chat_partner_id.eq.${user.id}`).eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false }),
      ]);
      if (pollsRes.data) setPolls(pollsRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (billsRes.data) setBills(billsRes.data);
    };
    loadAll();
  }, [open, user?.id, chatPartnerId]);

  const createPoll = async () => {
    if (!newPollQ.trim() || newPollOpts.filter(o => o.trim()).length < 2) {
      toast.error("Need a question and at least 2 options");
      return;
    }
    const { error } = await (supabase as any).from("chat_polls").insert({
      creator_id: user!.id,
      chat_partner_id: chatPartnerId,
      question: newPollQ.trim(),
      options: newPollOpts.filter(o => o.trim()),
      votes: {},
    });
    if (error) { toast.error("Failed to create poll"); return; }
    toast.success("Poll created!");
    setNewPollQ("");
    setNewPollOpts(["", ""]);
    setView("menu");
    // Reload
    const { data } = await (supabase as any).from("chat_polls").select("*").eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false });
    if (data) setPolls(data);
  };

  const votePoll = async (pollId: string, option: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || poll.is_closed) return;
    const newVotes = { ...poll.votes, [user!.id]: option };
    await (supabase as any).from("chat_polls").update({ votes: newVotes }).eq("id", pollId);
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, votes: newVotes } : p));
  };

  const createTodo = async () => {
    if (!newTodoTitle.trim()) { toast.error("Need a title"); return; }
    const items = newTodoItems.filter(i => i.trim()).map(text => ({ text: text.trim(), done: false }));
    if (items.length === 0) { toast.error("Add at least one item"); return; }
    await (supabase as any).from("chat_todos").insert({
      creator_id: user!.id,
      chat_partner_id: chatPartnerId,
      title: newTodoTitle.trim(),
      items,
    });
    toast.success("To-do list created!");
    setNewTodoTitle("");
    setNewTodoItems([""]);
    setView("menu");
    const { data } = await (supabase as any).from("chat_todos").select("*").eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false });
    if (data) setTodos(data);
  };

  const toggleTodoItem = async (todoId: string, idx: number) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newItems = [...todo.items];
    newItems[idx] = { ...newItems[idx], done: !newItems[idx].done };
    await (supabase as any).from("chat_todos").update({ items: newItems, updated_at: new Date().toISOString() }).eq("id", todoId);
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, items: newItems } : t));
  };

  const createSplitBill = async () => {
    if (!newBillTitle.trim() || !newBillAmount) { toast.error("Need title and amount"); return; }
    const total = parseFloat(newBillAmount);
    if (isNaN(total) || total <= 0) { toast.error("Invalid amount"); return; }
    const half = Math.round(total * 100 / 2) / 100;
    await (supabase as any).from("chat_split_bills").insert({
      creator_id: user!.id,
      chat_partner_id: chatPartnerId,
      title: newBillTitle.trim(),
      total_amount: total,
      splits: [
        { userId: user!.id, name: "You", amount: half, paid: false },
        { userId: chatPartnerId, name: chatPartnerName, amount: total - half, paid: false },
      ],
    });
    toast.success("Bill split created!");
    setNewBillTitle("");
    setNewBillAmount("");
    setView("menu");
    const { data } = await (supabase as any).from("chat_split_bills").select("*").eq("chat_partner_id", chatPartnerId).order("created_at", { ascending: false });
    if (data) setBills(data);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-background rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 px-5 pt-5 pb-3 border-b border-border/30">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {view !== "menu" && (
                  <button onClick={() => setView("menu")} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
                  </button>
                )}
                <h3 className="text-lg font-bold text-foreground">
                  {view === "menu" ? "Mini Apps" : view === "poll" ? "Polls" : view === "todo" ? "To-Do Lists" : "Split Bills"}
                </h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="p-5">
            {view === "menu" && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "poll" as MiniApp, icon: BarChart3, label: "Poll", count: polls.length, color: "bg-blue-500" },
                  { id: "todo" as MiniApp, icon: ListTodo, label: "To-Do", count: todos.length, color: "bg-emerald-500" },
                  { id: "split" as MiniApp, icon: Receipt, label: "Split Bill", count: bills.length, color: "bg-amber-500" },
                ].map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setView(app.id)}
                    className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-border/30 hover:bg-muted/30 transition-colors relative"
                  >
                    <div className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center`}>
                      <app.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{app.label}</span>
                    {app.count > 0 && (
                      <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                        {app.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* POLL VIEW */}
            {view === "poll" && (
              <div className="space-y-4">
                {/* Create new poll */}
                <div className="p-4 rounded-2xl border border-border/40 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Create a Poll</h4>
                  <input
                    placeholder="Ask a question..."
                    value={newPollQ}
                    onChange={(e) => setNewPollQ(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/40 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  {newPollOpts.map((opt, i) => (
                    <input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const n = [...newPollOpts];
                        n[i] = e.target.value;
                        setNewPollOpts(n);
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-border/30 bg-muted/20 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  ))}
                  <div className="flex gap-2">
                    {newPollOpts.length < 6 && (
                      <button onClick={() => setNewPollOpts([...newPollOpts, ""])} className="text-xs text-primary font-medium flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add option
                      </button>
                    )}
                  </div>
                  <button onClick={createPoll} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    Create Poll
                  </button>
                </div>

                {/* Existing polls */}
                {polls.map((poll) => {
                  const totalVotes = Object.keys(poll.votes).length;
                  const myVote = poll.votes[user!.id];
                  return (
                    <div key={poll.id} className="p-4 rounded-2xl border border-border/40 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-foreground">{poll.question}</p>
                        {poll.is_closed && <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Closed</span>}
                      </div>
                      {(poll.options as string[]).map((opt) => {
                        const voteCount = Object.values(poll.votes).filter(v => v === opt).length;
                        const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                        const isMyVote = myVote === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => votePoll(poll.id, opt)}
                            disabled={poll.is_closed}
                            className={`w-full text-left px-3 py-2 rounded-xl border relative overflow-hidden transition-colors ${
                              isMyVote ? "border-primary/50 bg-primary/5" : "border-border/30"
                            }`}
                          >
                            <div className="absolute inset-y-0 left-0 bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
                            <div className="relative flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                {isMyVote && <Check className="w-3 h-3 text-primary" />}
                                {opt}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{pct}%</span>
                            </div>
                          </button>
                        );
                      })}
                      <p className="text-[10px] text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TODO VIEW */}
            {view === "todo" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-border/40 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Create a To-Do List</h4>
                  <input
                    placeholder="List title..."
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/40 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  {newTodoItems.map((item, i) => (
                    <input
                      key={i}
                      placeholder={`Item ${i + 1}`}
                      value={item}
                      onChange={(e) => {
                        const n = [...newTodoItems];
                        n[i] = e.target.value;
                        setNewTodoItems(n);
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-border/30 bg-muted/20 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  ))}
                  <button onClick={() => setNewTodoItems([...newTodoItems, ""])} className="text-xs text-primary font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                  <button onClick={createTodo} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    Create List
                  </button>
                </div>

                {todos.map((todo) => (
                  <div key={todo.id} className="p-4 rounded-2xl border border-border/40 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">{todo.title}</h4>
                    {(todo.items as TodoItem[]).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => toggleTodoItem(todo.id, i)}
                        className="w-full flex items-center gap-2.5 py-1.5 text-left"
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          item.done ? "bg-primary border-primary" : "border-border"
                        }`}>
                          {item.done && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                    <p className="text-[10px] text-muted-foreground">
                      {(todo.items as TodoItem[]).filter(i => i.done).length}/{(todo.items as TodoItem[]).length} completed
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* SPLIT BILL VIEW */}
            {view === "split" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-border/40 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Split a Bill</h4>
                  <input
                    placeholder="What's it for?"
                    value={newBillTitle}
                    onChange={(e) => setNewBillTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border/40 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newBillAmount}
                      onChange={(e) => setNewBillAmount(e.target.value)}
                      className="w-full h-10 pl-7 pr-3 rounded-xl border border-border/40 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Split evenly between you and {chatPartnerName}</p>
                  <button onClick={createSplitBill} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    Create Split
                  </button>
                </div>

                {bills.map((bill) => (
                  <div key={bill.id} className="p-4 rounded-2xl border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">{bill.title}</h4>
                      <span className="text-sm font-bold text-primary">${Number(bill.total_amount).toFixed(2)}</span>
                    </div>
                    {(bill.splits as any[]).map((split, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${split.paid ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span className="text-xs text-foreground">{split.userId === user?.id ? "You" : split.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">${Number(split.amount).toFixed(2)}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            split.paid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {split.paid ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

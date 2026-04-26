/**
 * AddContactSheet — Add a contact by @username (no phone required).
 * Future: QR scan + invite-link redeem will land here too.
 */
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, AtSign, UserPlus, QrCode, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContacts } from "@/hooks/useContacts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AddContactSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { findByUsername, add } = useContacts();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function onSearch() {
    setError(null); setResult(null);
    if (!value.trim()) return;
    setSearching(true);
    const r = await findByUsername(value);
    setSearching(false);
    if (r.error) setError(r.error);
    else setResult(r.user);
  }

  async function onAdd() {
    if (!result) return;
    setAdding(true);
    const r = await add(result.user_id, { via: "username" });
    setAdding(false);
    if (r.ok) {
      toast.success("Contact added");
      onOpenChange(false);
      setValue(""); setResult(null);
    } else {
      toast.error(r.error || "Couldn't add contact");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh]">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Add a contact
          </SheetTitle>
          <SheetDescription>Find people by their @username — no phone needed.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z0-9_@]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="username"
              className="pl-9 pr-12 text-base"
              maxLength={33}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSearch}
              disabled={searching || !value.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {result && (
            <div className="flex items-center gap-3 p-3 rounded-2xl border bg-card">
              <Avatar className="w-12 h-12">
                <AvatarImage src={result.avatar_url ?? undefined} />
                <AvatarFallback>{(result.full_name ?? result.username ?? "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{result.full_name ?? `@${result.username}`}</div>
                <div className="text-xs text-muted-foreground truncate">@{result.username}</div>
              </div>
              <Button size="sm" onClick={onAdd} disabled={adding} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => { onOpenChange(false); navigate("/chat/qr"); }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:bg-muted active:scale-95 transition"
            >
              <QrCode className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-medium">My QR code</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/u/me`);
                toast.success("Invite link copied");
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:bg-muted active:scale-95 transition"
            >
              <LinkIcon className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-medium">Share invite link</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

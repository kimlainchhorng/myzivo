/**
 * ContactsPage — Telegram-style contacts list (no phone required).
 * Add via @username, view, favorite, rename, remove.
 */
import { useMemo, useState } from "react";
import { useSmartBack } from "@/lib/smartBack";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserPlus, Star, MoreVertical, MessageCircle, Trash2, AtSign, Phone, Inbox, MapPin, Lock, Share2, QrCode, Smartphone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddContactSheet from "@/components/chat/AddContactSheet";
import UsernameClaimSheet from "@/components/chat/UsernameClaimSheet";
import InviteFriendsSheet from "@/components/chat/InviteFriendsSheet";
import SuggestedContactsRow from "@/components/chat/SuggestedContactsRow";
import { useContacts } from "@/hooks/useContacts";
import { useUsername } from "@/hooks/useUsername";
import { toast } from "sonner";

export default function ContactsPage() {
  const navigate = useNavigate();
  const goBack = useSmartBack("/chat");
  const { contacts, loading, toggleFavorite, remove } = useContacts();
  const { username } = useUsername();
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [usernameOpen, setUsernameOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) => {
      const name = (c.custom_name || c.profile?.full_name || c.profile?.username || "").toLowerCase();
      return name.includes(s) || c.profile?.username?.toLowerCase().includes(s);
    });
  }, [contacts, q]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b px-4 py-3 flex items-center gap-2 safe-area-top">
        <button
          onClick={goBack}
          aria-label="Go back"
          title="Back"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Contacts</h1>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setInviteOpen(true)}
          aria-label="Invite friends"
          title="Invite friends"
          className="focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/chat/qr")}
          aria-label="Open QR code"
          title="QR code"
          className="focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <QrCode className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setAddOpen(true)}
          aria-label="Add contact"
          title="Add contact"
          className="focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <UserPlus className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-4 py-3 space-y-3">
        <button
          onClick={() => setUsernameOpen(true)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl border bg-card hover:bg-muted/50 active:scale-[0.99] transition text-left"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <AtSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{username ? `@${username}` : "Set your username"}</div>
            <div className="text-xs text-muted-foreground">
              {username ? "Tap to change. Your username is how friends find you." : "Be reachable without a phone number."}
            </div>
          </div>
        </button>

        <nav aria-label="Contact quick actions" className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => navigate("/chat/find-contacts")}
            aria-label="Find people by phone number"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border bg-card hover:bg-muted/50 active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-sky-500/15 text-sky-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-center">Find by phone</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat/find-contacts")}
            aria-label="Sync contacts from your phone"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border bg-card hover:bg-muted/50 active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-violet-500/15 text-violet-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-center">Sync phone</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat/contacts/requests")}
            aria-label="View incoming and sent contact requests"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border bg-card hover:bg-muted/50 active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-center">Requests</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat/nearby")}
            aria-label="Find people nearby"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border bg-card hover:bg-muted/50 active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-center">Nearby</span>
          </button>
        </nav>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search contacts"
            className="pl-9"
          />
        </div>
      </div>

      {!q.trim() && <SuggestedContactsRow />}

      <div className="px-2 pb-24">
        {loading ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <UserPlus className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No contacts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add friends by their @username — no phone needed.</p>
            <Button onClick={() => setAddOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" /> Add contact
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => {
              const name = c.custom_name || c.profile?.full_name || (c.profile?.username ? `@${c.profile.username}` : "Unknown");
              return (
                <li key={c.contact_user_id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                  <button
                    onClick={() => navigate("/chat", {
                      state: {
                        openChat: {
                          recipientId: c.contact_user_id,
                          recipientName: name,
                          recipientAvatar: c.profile?.avatar_url || null,
                        },
                      },
                    })}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate flex items-center gap-1.5">
                        {name}
                        {c.favorite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.profile?.username ? `@${c.profile.username}` : "—"}
                      </div>
                    </div>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/chat", {
                        state: {
                          openChat: {
                            recipientId: c.contact_user_id,
                            recipientName: name,
                            recipientAvatar: c.profile?.avatar_url || null,
                          },
                        },
                      })}>
                        <MessageCircle className="w-4 h-4 mr-2" /> Message
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/chat/secret/${c.contact_user_id}`)}>
                        <Lock className="w-4 h-4 mr-2" /> Secret chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFavorite(c.contact_user_id, !c.favorite)}>
                        <Star className="w-4 h-4 mr-2" /> {c.favorite ? "Remove favorite" : "Mark favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => { await remove(c.contact_user_id); toast.success("Contact removed"); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AddContactSheet open={addOpen} onOpenChange={setAddOpen} />
      <UsernameClaimSheet open={usernameOpen} onOpenChange={setUsernameOpen} />
      <InviteFriendsSheet open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

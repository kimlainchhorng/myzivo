/**
 * ZIVO Eats — Group Order Page
 * Shared view for host + participants to see the group cart
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users, Copy, Lock, ShoppingCart, ArrowLeft, Loader2,
  Trash2, Clock, CheckCircle, Plus, UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupOrder, useGroupSession } from "@/hooks/useGroupOrder";
import { useRestaurant } from "@/hooks/useEatsOrders";
import { useCart } from "@/contexts/CartContext";
import { CartProvider } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function EatsGroupOrderContent() {
  const navigate = useNavigate();
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user } = useAuth();
  const { joinGroupOrder, removeGroupItem, lockSession, markCheckedOut } = useGroupOrder();
  const { addItem, clearCart } = useCart();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [hostUserId, setHostUserId] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Join/load session on mount
  useEffect(() => {
    if (!inviteCode) return;

    const load = async () => {
      setJoining(true);
      const session = await joinGroupOrder(inviteCode);
      if (session) {
        setSessionId(session.id);
        setRestaurantId(session.restaurant_id);
        setHostUserId(session.host_user_id);
      }
      setJoining(false);
    };
    load();
  }, [inviteCode, joinGroupOrder]);

  const { session, items, itemsByUser, total, participantCount, isLoading } =
    useGroupSession(sessionId);

  const { data: restaurant } = useRestaurant(restaurantId || undefined);

  const isHost = user?.id === hostUserId;
  const isOpen = session?.status === "open";
  const isLocked = session?.status === "locked";
  const isCheckedOut = session?.status === "checked_out";

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.deadline) {
      setTimeLeft(null);
      return;
    }

    const update = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(session.deadline!).getTime() - Date.now()) / 1000
        )
      );
      setTimeLeft(remaining);
      if (remaining <= 0 && isHost && isOpen) {
        lockSession(session.id);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session?.deadline, session?.id, isHost, isOpen, lockSession]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/eats/group/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLockAndCheckout = async () => {
    if (!sessionId || !session) return;
    setIsLocking(true);
    const locked = await lockSession(sessionId);
    setIsLocking(false);

    if (locked) {
      // Load all group items into the regular cart
      clearCart();
      items.forEach((item) => {
        addItem({
          id: item.menu_item_id,
          restaurantId: session.restaurant_id,
          restaurantName: restaurant?.name || "Restaurant",
          name: `${item.item_name} (${item.user_name})`,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || undefined,
        });
      });

      await markCheckedOut(sessionId);
      navigate("/eats/checkout");
    }
  };

  const handleAddItems = () => {
    if (!restaurantId || !sessionId) return;
    navigate(`/eats/restaurant/${restaurantId}?group=${sessionId}`);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeGroupItem(itemId);
  };

  if (joining || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h1 className="font-bold text-2xl mb-2">Group Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This group order may have expired or the link is invalid.
            </p>
            <Button onClick={() => navigate("/eats/restaurants")} variant="outline">
              Browse Restaurants
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Group Order — ZIVO Eats" description="Share a cart with friends on ZIVO Eats" />
      <Header />

      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Group Order</h1>
                <p className="text-sm text-muted-foreground">
                  {restaurant?.name || "Restaurant"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mt-3">
              <Badge
                className={cn(
                  isOpen && "bg-emerald-500/20 text-emerald-400",
                  isLocked && "bg-amber-500/20 text-amber-400",
                  isCheckedOut && "bg-blue-500/20 text-blue-400"
                )}
              >
                {isOpen && "Open — Adding Items"}
                {isLocked && "Locked — Ready to Checkout"}
                {isCheckedOut && "Checked Out"}
              </Badge>
              <Badge variant="outline">
                {participantCount} participant{participantCount !== 1 && "s"}
              </Badge>
            </div>
          </div>

          {/* Invite Link (host only, open session) */}
          {isHost && isOpen && (
            <Card className="mb-6 border-violet-500/30">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Share this link to invite friends:</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate">
                    {`${window.location.origin}/eats/group/${inviteCode}`}
                  </div>
                  <Button size="sm" onClick={handleCopyLink} className="gap-1 shrink-0">
                    {linkCopied ? (
                      <><CheckCircle className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Code: <span className="font-mono font-bold">{inviteCode}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timer */}
          {timeLeft !== null && timeLeft > 0 && isOpen && (
            <div className="flex items-center gap-2 mb-4 text-amber-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} remaining
              </span>
            </div>
          )}

          {/* Shared Cart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5 text-violet-400" />
                Shared Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No items yet — start adding!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(itemsByUser).map(([userName, userItems]) => (
                    <div key={userName}>
                      <div className="flex items-center gap-2 mb-3">
                        <UserCircle className="w-5 h-5 text-violet-400" />
                        <span className="font-semibold text-sm">{userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {userItems.length} item{userItems.length !== 1 && "s"}
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-7">
                        {userItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.item_name}</p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground truncate">{item.notes}</p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            <span className="text-sm font-medium w-16 text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            {/* Allow owner or host to remove */}
                            {isOpen && (user?.id === item.user_id || isHost) && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {items.length > 0 && (
                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold">Running Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOpen && (
              <Button
                onClick={handleAddItems}
                className="w-full h-12 rounded-xl gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
              >
                <Plus className="w-5 h-5" />
                Add Items from Menu
              </Button>
            )}

            {isHost && isOpen && items.length > 0 && (
              <Button
                onClick={handleLockAndCheckout}
                disabled={isLocking}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
              >
                {isLocking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                Lock & Checkout
              </Button>
            )}

            {!isHost && isLocked && (
              <div className="text-center p-4 bg-amber-500/10 rounded-xl">
                <Lock className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                <p className="text-sm text-amber-400 font-medium">
                  The host has locked this group order and is completing checkout.
                </p>
              </div>
            )}

            {isCheckedOut && (
              <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">
                  This group order has been checked out!
                </p>
              </div>
            )}

            {/* Split payment placeholder */}
            {isHost && items.length > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Split payment coming soon — one person pays for now
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EatsGroupOrder() {
  return (
    <CartProvider>
      <EatsGroupOrderContent />
    </CartProvider>
  );
}

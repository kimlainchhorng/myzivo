/**
 * PublicUserProfilePage — view any user's public profile
 * Route: /user/:userId
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function PublicUserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await (supabase.from("profiles") as any).select("user_id, full_name, username, avatar_url, bio").eq("user_id", userId).single();
      setProfile(data as UserProfile);
      if (authUser?.id && data?.user_id !== authUser.id) {
        const { data: friendship } = await (supabase.from("friendships") as any).select("id").or(`user_id.eq.${authUser.id},friend_id.eq.${authUser.id}`).eq("other_user_id", userId).eq("status", "accepted").limit(1);
        setIsFriend(!!friendship?.length);
      }
      setLoading(false);
    };
    load();
  }, [userId, authUser?.id]);

  const sendFriendRequest = async () => {
    if (!authUser?.id || !profile) return;
    setActionLoading(true);
    try {
      await supabase.from("friendships").insert({ user_id: authUser.id, friend_id: profile.user_id, status: "pending" });
      toast.success("Friend request sent");
    } catch (e) {
      toast.error("Failed to send request");
    }
    setActionLoading(false);
  };

  const openChat = () => {
    if (profile?.user_id) navigate(`/chat/direct/${profile.user_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="max-w-md mx-auto text-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = authUser?.id === profile.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Avatar className="w-28 h-28 mx-auto">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {(profile.full_name || profile.username || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.full_name || "User"}</h1>
            {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          </div>

          {profile.bio && <p className="text-sm text-foreground/80">{profile.bio}</p>}

          {!isOwnProfile && authUser && (
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={openChat} disabled={actionLoading}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              {!isFriend && (
                <Button className="flex-1" onClick={sendFriendRequest} disabled={actionLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

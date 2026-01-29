import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Camera, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Loader2,
  Save,
  Sparkles,
  Shield,
  Star,
  Clock,
  ChevronRight,
  Settings,
  CreditCard,
  Bell,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from "@/hooks/useUserProfile";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
    values: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadAvatar.mutateAsync(file);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      full_name: data.full_name || null,
      phone: data.phone || null,
    });
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const quickLinks = [
    { icon: CreditCard, label: "Payment Methods", href: "/dashboard", description: "Manage cards & wallets" },
    { icon: Bell, label: "Notifications", href: "/dashboard", description: "Preferences & alerts" },
    { icon: Lock, label: "Security", href: "/dashboard", description: "Password & 2FA" },
    { icon: Settings, label: "Settings", href: "/dashboard", description: "App preferences" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Background effects - simplified for mobile */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 container max-w-lg mx-auto px-4 pt-4 pb-8 safe-area-inset">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-muted/50 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account information</p>
          </div>
        </motion.div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal-500/5" />
              <CardHeader className="text-center pb-2 relative">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-primary to-teal-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <Avatar className="relative h-28 w-28 ring-4 ring-background shadow-2xl">
                      <AvatarImage 
                        src={avatarPreview || profile?.avatar_url || undefined} 
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-teal-400 text-white text-3xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAvatarClick}
                      disabled={uploadAvatar.isPending}
                      className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-br from-primary to-teal-400 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {uploadAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {profile?.full_name || "Set your name"}
                </CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <Badge className="mt-3 bg-gradient-to-r from-primary/20 to-teal-400/20 text-primary border-primary/30 font-semibold">
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  {profile?.status || "Active"} Member
                </Badge>
              </CardHeader>

              <CardContent className="pt-6 relative">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4 text-primary" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <Mail className="h-4 w-4 text-primary" />
                        Email
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="h-12 rounded-xl bg-muted/50 border-border/50 text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed here
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <Phone className="h-4 w-4 text-primary" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your phone number"
                              type="tel"
                              className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30 hover:opacity-90"
                        disabled={updateProfile.isPending || !form.formState.isDirty}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display font-bold text-lg mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={link.href}>
                      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <link.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{link.label}</p>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Account Status</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "recently"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30 font-semibold px-4 py-1.5">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
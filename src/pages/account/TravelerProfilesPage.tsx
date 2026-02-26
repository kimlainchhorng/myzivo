/**
 * Traveler Profiles Page
 * Manage saved traveler details for faster checkout
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, Plane, Shield, Trash2, Edit2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AppLayout from "@/components/app/AppLayout";
import { useNavigate } from "react-router-dom";
import {
  useTravelerProfiles,
  useCreateTravelerProfile,
  useUpdateTravelerProfile,
  useDeleteTravelerProfile,
  type TravelerProfile,
  type TravelerProfileInput,
} from "@/hooks/useTravelerProfiles";

const emptyProfile: TravelerProfileInput = {
  label: "",
  is_primary: false,
  first_name: "",
  last_name: "",
  date_of_birth: null,
  gender: null,
  email: null,
  phone: null,
  nationality: null,
  passport_number: null,
  passport_expiry: null,
  passport_country: null,
  frequent_flyer_airline: null,
  frequent_flyer_number: null,
  tsa_precheck_number: null,
  known_traveler_number: null,
  redress_number: null,
  dietary_preferences: null,
  seat_preference: null,
  special_assistance: null,
};

function TravelerForm({
  initial,
  onSubmit,
  isLoading,
  submitLabel,
}: {
  initial: TravelerProfileInput;
  onSubmit: (data: TravelerProfileInput) => void;
  isLoading: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<TravelerProfileInput>(initial);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key: keyof TravelerProfileInput, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5"
    >
      {/* Basic Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="label">Profile Label</Label>
            <Input id="label" placeholder="e.g. Self, Spouse, Child" value={form.label} onChange={(e) => set("label", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={form.gender || ""} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={form.date_of_birth || ""} onChange={(e) => set("date_of_birth", e.target.value || null)} />
          </div>
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" placeholder="e.g. US" value={form.nationality || ""} onChange={(e) => set("nationality", e.target.value || null)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value || null)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={form.phone || ""} onChange={(e) => set("phone", e.target.value || null)} />
          </div>
        </div>
      </div>

      {/* Advanced: Passport & Travel */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? "Hide" : "Show"} Passport & Travel Details
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Passport
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="passport_number">Passport Number</Label>
                  <Input id="passport_number" value={form.passport_number || ""} onChange={(e) => set("passport_number", e.target.value || null)} />
                </div>
                <div>
                  <Label htmlFor="passport_expiry">Expiry Date</Label>
                  <Input id="passport_expiry" type="date" value={form.passport_expiry || ""} onChange={(e) => set("passport_expiry", e.target.value || null)} />
                </div>
              </div>
              <div>
                <Label htmlFor="passport_country">Issuing Country</Label>
                <Input id="passport_country" placeholder="e.g. US" value={form.passport_country || ""} onChange={(e) => set("passport_country", e.target.value || null)} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Plane className="w-4 h-4" /> Frequent Flyer & Security
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ff_airline">Airline</Label>
                  <Input id="ff_airline" placeholder="e.g. Delta" value={form.frequent_flyer_airline || ""} onChange={(e) => set("frequent_flyer_airline", e.target.value || null)} />
                </div>
                <div>
                  <Label htmlFor="ff_number">FF Number</Label>
                  <Input id="ff_number" value={form.frequent_flyer_number || ""} onChange={(e) => set("frequent_flyer_number", e.target.value || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tsa">TSA PreCheck</Label>
                  <Input id="tsa" value={form.tsa_precheck_number || ""} onChange={(e) => set("tsa_precheck_number", e.target.value || null)} />
                </div>
                <div>
                  <Label htmlFor="ktn">Known Traveler #</Label>
                  <Input id="ktn" value={form.known_traveler_number || ""} onChange={(e) => set("known_traveler_number", e.target.value || null)} />
                </div>
              </div>
              <div>
                <Label htmlFor="seat">Seat Preference</Label>
                <Select value={form.seat_preference || ""} onValueChange={(v) => set("seat_preference", v)}>
                  <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="window">Window</SelectItem>
                    <SelectItem value="aisle">Aisle</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={isLoading || !form.first_name || !form.last_name} className="w-full rounded-2xl h-12">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function ProfileCard({
  profile,
  onEdit,
  onDelete,
}: {
  profile: TravelerProfile;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <Card className="border-border/50 hover:border-primary/20 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{profile.first_name} {profile.last_name}</span>
                  {profile.is_primary && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      <Star className="w-3 h-3 mr-1" /> Primary
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{profile.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete traveler profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {profile.first_name}'s profile. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Quick info chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.nationality && (
              <Badge variant="secondary" className="text-xs">{profile.nationality}</Badge>
            )}
            {profile.passport_number && (
              <Badge variant="secondary" className="text-xs">Passport: •••{profile.passport_number.slice(-4)}</Badge>
            )}
            {profile.frequent_flyer_airline && (
              <Badge variant="secondary" className="text-xs">{profile.frequent_flyer_airline} FF</Badge>
            )}
            {profile.seat_preference && (
              <Badge variant="secondary" className="text-xs">{profile.seat_preference} seat</Badge>
            )}
            {profile.tsa_precheck_number && (
              <Badge variant="secondary" className="text-xs">TSA PreCheck</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TravelerProfilesPage() {
  const navigate = useNavigate();
  const { data: profiles = [], isLoading } = useTravelerProfiles();
  const createProfile = useCreateTravelerProfile();
  const updateProfile = useUpdateTravelerProfile();
  const deleteProfile = useDeleteTravelerProfile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TravelerProfile | null>(null);

  const handleCreate = (data: TravelerProfileInput) => {
    createProfile.mutate(data, { onSuccess: () => setDialogOpen(false) });
  };

  const handleUpdate = (data: TravelerProfileInput) => {
    if (!editingProfile) return;
    updateProfile.mutate({ id: editingProfile.id, ...data }, {
      onSuccess: () => setEditingProfile(null),
    });
  };

  return (
    <AppLayout title="Travelers" showBack onBack={() => navigate(-1)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-6 max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Saved Travelers</h1>
            <p className="text-sm text-muted-foreground">Auto-fill details at checkout</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-2xl gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Traveler</DialogTitle>
              </DialogHeader>
              <TravelerForm
                initial={emptyProfile}
                onSubmit={handleCreate}
                isLoading={createProfile.isPending}
                submitLabel="Save Traveler"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">No travelers saved yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save traveler details to speed up your booking process
              </p>
              <Button onClick={() => setDialogOpen(true)} className="rounded-2xl gap-1.5">
                <Plus className="w-4 h-4" /> Add First Traveler
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => setEditingProfile(profile)}
                  onDelete={() => deleteProfile.mutate(profile.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Traveler</DialogTitle>
            </DialogHeader>
            {editingProfile && (
              <TravelerForm
                initial={{
                  label: editingProfile.label,
                  is_primary: editingProfile.is_primary,
                  first_name: editingProfile.first_name,
                  last_name: editingProfile.last_name,
                  date_of_birth: editingProfile.date_of_birth,
                  gender: editingProfile.gender,
                  email: editingProfile.email,
                  phone: editingProfile.phone,
                  nationality: editingProfile.nationality,
                  passport_number: editingProfile.passport_number,
                  passport_expiry: editingProfile.passport_expiry,
                  passport_country: editingProfile.passport_country,
                  frequent_flyer_airline: editingProfile.frequent_flyer_airline,
                  frequent_flyer_number: editingProfile.frequent_flyer_number,
                  tsa_precheck_number: editingProfile.tsa_precheck_number,
                  known_traveler_number: editingProfile.known_traveler_number,
                  redress_number: editingProfile.redress_number,
                  dietary_preferences: editingProfile.dietary_preferences,
                  seat_preference: editingProfile.seat_preference,
                  special_assistance: editingProfile.special_assistance,
                }}
                onSubmit={handleUpdate}
                isLoading={updateProfile.isPending}
                submitLabel="Update Traveler"
              />
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}

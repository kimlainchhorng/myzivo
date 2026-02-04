import { useState } from "react";
import { Plus, User, Star, Trash2, Edit, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useSavedTravelers,
  useCreateSavedTraveler,
  useUpdateSavedTraveler,
  useDeleteSavedTraveler,
  useSetPrimaryTraveler,
} from "@/hooks/useSavedTravelers";
import type { SavedTraveler, CreateSavedTravelerInput, TravelerType, Gender } from "@/types/travelers";

const TRAVELER_TYPES: { value: TravelerType; label: string }[] = [
  { value: "adult", label: "Adult (12+)" },
  { value: "child", label: "Child (2-11)" },
  { value: "infant", label: "Infant (0-1)" },
];

const TITLES = ["Mr", "Ms", "Mrs", "Miss", "Dr", "Prof"];
const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function SavedTravelersManager() {
  const { data: travelers = [], isLoading } = useSavedTravelers();
  const createTraveler = useCreateSavedTraveler();
  const updateTraveler = useUpdateSavedTraveler();
  const deleteTraveler = useDeleteSavedTraveler();
  const setPrimary = useSetPrimaryTraveler();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<SavedTraveler | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSavedTravelerInput>({
    traveler_type: "adult",
    given_name: "",
    family_name: "",
    is_primary: false,
  });

  const resetForm = () => {
    setFormData({
      traveler_type: "adult",
      given_name: "",
      family_name: "",
      is_primary: false,
    });
    setEditingTraveler(null);
  };

  const openDialog = (traveler?: SavedTraveler) => {
    if (traveler) {
      setEditingTraveler(traveler);
      setFormData({
        traveler_type: traveler.traveler_type,
        title: traveler.title || undefined,
        given_name: traveler.given_name,
        family_name: traveler.family_name,
        born_on: traveler.born_on || undefined,
        gender: traveler.gender || undefined,
        email: traveler.email || undefined,
        phone_number: traveler.phone_number || undefined,
        passport_number: traveler.passport_number || undefined,
        passport_expiry: traveler.passport_expiry || undefined,
        passport_country: traveler.passport_country || undefined,
        nationality: traveler.nationality || undefined,
        known_traveler_number: traveler.known_traveler_number || undefined,
        is_primary: traveler.is_primary,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTraveler) {
      await updateTraveler.mutateAsync({ id: editingTraveler.id, ...formData });
    } else {
      await createTraveler.mutateAsync(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTraveler.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" />
                Saved Travelers
              </CardTitle>
              <CardDescription className="mt-1">
                Save traveler details for faster checkout
              </CardDescription>
            </div>
            <Button
              onClick={() => openDialog()}
              size="sm"
              className="bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {travelers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No saved travelers</p>
              <p className="text-sm">Add travelers to speed up booking</p>
            </div>
          ) : (
            travelers.map((traveler) => (
              <div
                key={traveler.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-teal-400/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {traveler.title ? `${traveler.title}. ` : ""}
                      {traveler.given_name} {traveler.family_name}
                    </p>
                    {traveler.is_primary && (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-[10px]">
                        <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {traveler.traveler_type}
                    {traveler.email && ` • ${traveler.email}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!traveler.is_primary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPrimary.mutate(traveler.id)}
                      disabled={setPrimary.isPending}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openDialog(traveler)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(traveler.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTraveler ? "Edit Traveler" : "Add Traveler"}</DialogTitle>
            <DialogDescription>
              {editingTraveler
                ? "Update traveler details"
                : "Add a new traveler for faster checkout"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Traveler Type</Label>
                <Select
                  value={formData.traveler_type}
                  onValueChange={(v) => setFormData({ ...formData, traveler_type: v as TravelerType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVELER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Select
                  value={formData.title || ""}
                  onValueChange={(v) => setFormData({ ...formData, title: v || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  required
                  value={formData.given_name}
                  onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                  placeholder="As on ID"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  required
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                  placeholder="As on ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.born_on || ""}
                  onChange={(e) => setFormData({ ...formData, born_on: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(v) => setFormData({ ...formData, gender: (v as Gender) || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value || undefined })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone_number || ""}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value || undefined })}
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>

            {/* Passport Section */}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-3">Passport Details (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Passport Number</Label>
                  <Input
                    value={formData.passport_number || ""}
                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.passport_expiry || ""}
                    onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value || undefined })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Issuing Country</Label>
                  <Input
                    value={formData.passport_country || ""}
                    onChange={(e) => setFormData({ ...formData, passport_country: e.target.value || undefined })}
                    placeholder="e.g., USA"
                  />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input
                    value={formData.nationality || ""}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value || undefined })}
                    placeholder="e.g., American"
                  />
                </div>
              </div>
            </div>

            {/* Known Traveler Number */}
            <div>
              <Label>Known Traveler Number (TSA PreCheck, Global Entry)</Label>
              <Input
                value={formData.known_traveler_number || ""}
                onChange={(e) => setFormData({ ...formData, known_traveler_number: e.target.value || undefined })}
              />
            </div>

            {/* Primary Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Set as Primary Traveler</Label>
                <p className="text-xs text-muted-foreground">Auto-fill this traveler first</p>
              </div>
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(v) => setFormData({ ...formData, is_primary: v })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTraveler.isPending || updateTraveler.isPending}
                className="bg-gradient-to-r from-primary to-teal-400"
              >
                {(createTraveler.isPending || updateTraveler.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTraveler ? "Update" : "Save"} Traveler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Traveler?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this traveler from your saved list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

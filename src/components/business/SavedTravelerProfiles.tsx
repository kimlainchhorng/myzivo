/**
 * Saved Traveler Profiles
 * Manage saved traveler information for quick booking
 */

import { useState } from "react";
import {
  UserCircle,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SavedTraveler {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  ktn?: string; // Known Traveler Number
  redressNumber?: string;
  isVerified: boolean;
  isDefault: boolean;
}

// Mock data
const mockTravelers: SavedTraveler[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john@company.com",
    dateOfBirth: "1985-06-15",
    nationality: "US",
    passportNumber: "••••••4521",
    passportExpiry: "2028-06-15",
    ktn: "12345678",
    isVerified: true,
    isDefault: true,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@company.com",
    dateOfBirth: "1990-03-22",
    nationality: "US",
    passportNumber: "••••••7832",
    passportExpiry: "2025-08-01",
    isVerified: true,
    isDefault: false,
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Wilson",
    email: "mike@company.com",
    dateOfBirth: "1988-11-10",
    nationality: "CA",
    isVerified: false,
    isDefault: false,
  },
];

const NATIONALITIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
];

interface SavedTravelerProfilesProps {
  isAdmin?: boolean;
}

export default function SavedTravelerProfiles({ isAdmin = false }: SavedTravelerProfilesProps) {
  const [travelers, setTravelers] = useState<SavedTraveler[]>(mockTravelers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTraveler, setNewTraveler] = useState<Partial<SavedTraveler>>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
  });

  const handleAddTraveler = () => {
    if (!newTraveler.firstName || !newTraveler.lastName || !newTraveler.email) {
      toast.error("Please fill in required fields");
      return;
    }

    const traveler: SavedTraveler = {
      id: Date.now().toString(),
      firstName: newTraveler.firstName!,
      lastName: newTraveler.lastName!,
      email: newTraveler.email!,
      dateOfBirth: newTraveler.dateOfBirth || "",
      nationality: newTraveler.nationality || "US",
      isVerified: false,
      isDefault: travelers.length === 0,
    };

    setTravelers([...travelers, traveler]);
    setNewTraveler({
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      nationality: "",
    });
    setShowAddDialog(false);
    toast.success("Traveler profile saved");
  };

  const handleSetDefault = (id: string) => {
    setTravelers(
      travelers.map((t) => ({
        ...t,
        isDefault: t.id === id,
      }))
    );
    toast.success("Default traveler updated");
  };

  const handleRemoveTraveler = (id: string) => {
    setTravelers(travelers.filter((t) => t.id !== id));
    toast.success("Traveler profile removed");
  };

  const isPassportExpiringSoon = (expiry?: string) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    return expiryDate < sixMonths;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Saved Traveler Profiles
            </CardTitle>
            <CardDescription>
              Pre-filled traveler info for faster booking
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Traveler
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Traveler Profile</DialogTitle>
                <DialogDescription>
                  Save traveler details for faster checkout
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newTraveler.firstName}
                      onChange={(e) => setNewTraveler({ ...newTraveler, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newTraveler.lastName}
                      onChange={(e) => setNewTraveler({ ...newTraveler, lastName: e.target.value })}
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTraveler.email}
                    onChange={(e) => setNewTraveler({ ...newTraveler, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newTraveler.dateOfBirth}
                    onChange={(e) => setNewTraveler({ ...newTraveler, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={newTraveler.nationality}
                    onValueChange={(v) => setNewTraveler({ ...newTraveler, nationality: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((nat) => (
                        <SelectItem key={nat.code} value={nat.code}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      Passport and other sensitive documents can be added securely 
                      after creating the profile.
                    </p>
                  </div>
                </div>

                <Button onClick={handleAddTraveler} className="w-full">
                  Save Traveler Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {travelers.map((traveler) => (
            <div
              key={traveler.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                traveler.isDefault && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-bold text-lg">
                    {traveler.firstName[0]}{traveler.lastName[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {traveler.firstName} {traveler.lastName}
                    </p>
                    {traveler.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                    {traveler.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{traveler.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {NATIONALITIES.find((n) => n.code === traveler.nationality)?.name || traveler.nationality}
                    </span>
                    {traveler.passportNumber && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {traveler.passportNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {traveler.passportExpiry && isPassportExpiringSoon(traveler.passportExpiry) && (
                  <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Passport expiring soon
                  </Badge>
                )}

                {!traveler.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(traveler.id)}
                  >
                    Set Default
                  </Button>
                )}

                <Button variant="ghost" size="icon">
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleRemoveTraveler(traveler.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {travelers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No saved travelers yet</p>
              <p className="text-sm">Add travelers for faster checkout</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

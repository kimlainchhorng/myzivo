/**
 * Admin City Launch Module
 * Manages city-by-city P2P marketplace launches
 */

import { useState } from "react";
import {
  MapPin,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Rocket,
  Pause,
  Play,
  Trash2,
  Users,
  Car,
  Scale,
  Shield,
  CreditCard,
  Wrench,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  useLaunchCities,
  useCityChecklist,
  useCitySupplyStats,
  useCreateLaunchCity,
  useUpdateCityChecklist,
  useUpdateCityStatus,
  useDeleteLaunchCity,
  calculateChecklistStatus,
} from "@/hooks/useCityLaunch";
import { US_STATES, type LaunchStatus, type LaunchCityWithChecklist } from "@/types/cityLaunch";
import { cn } from "@/lib/utils";

// Status badge colors
const statusColors: Record<LaunchStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-yellow-500/20 text-yellow-600",
  live: "bg-green-500/20 text-green-600",
  paused: "bg-orange-500/20 text-orange-600",
};

export default function AdminCityLaunchModule() {
  const { data: cities, isLoading } = useLaunchCities();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const selectedCity = cities?.find((c) => c.id === selectedCityId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            City Launch Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Prepare cities for P2P marketplace launch
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add City
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Cities"
          value={cities?.length || 0}
          icon={MapPin}
        />
        <StatsCard
          label="Live"
          value={cities?.filter((c) => c.launch_status === "live").length || 0}
          icon={Rocket}
          variant="success"
        />
        <StatsCard
          label="Ready"
          value={cities?.filter((c) => c.launch_status === "ready").length || 0}
          icon={Check}
          variant="warning"
        />
        <StatsCard
          label="Draft"
          value={cities?.filter((c) => c.launch_status === "draft").length || 0}
          icon={AlertCircle}
        />
      </div>

      {/* City List */}
      {!cities?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No cities added yet</h3>
            <p className="text-muted-foreground text-center mt-2">
              Add your first city to start preparing for launch
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Add City
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSelected={selectedCityId === city.id}
              onSelect={() => setSelectedCityId(city.id)}
            />
          ))}
        </div>
      )}

      {/* Selected City Checklist */}
      {selectedCity && (
        <CityChecklistPanel
          city={selectedCity}
          onLaunch={() => setShowLaunchModal(true)}
          onDelete={() => setShowDeleteModal(true)}
          onClose={() => setSelectedCityId(null)}
        />
      )}

      {/* Add City Modal */}
      <AddCityModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Launch Confirmation Modal */}
      {selectedCity && (
        <LaunchConfirmModal
          open={showLaunchModal}
          city={selectedCity}
          onClose={() => setShowLaunchModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedCity && (
        <DeleteConfirmModal
          open={showDeleteModal}
          city={selectedCity}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCityId(null);
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  variant?: "success" | "warning";
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon
            className={cn(
              "w-8 h-8",
              variant === "success" && "text-green-500",
              variant === "warning" && "text-yellow-500",
              !variant && "text-muted-foreground"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// City Card Component
function CityCard({
  city,
  isSelected,
  onSelect,
}: {
  city: LaunchCityWithChecklist;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: supplyStats } = useCitySupplyStats(
    city.name,
    city.state,
    city.checklist?.min_approved_owners || 5,
    city.checklist?.min_approved_cars || 10
  );

  const checklistStatus = calculateChecklistStatus(city.checklist, supplyStats || null);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {city.name}, {city.state}
            </CardTitle>
          </div>
          <Badge className={statusColors[city.launch_status as LaunchStatus]}>
            {city.launch_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Supply Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className={supplyStats?.ownersMet ? "text-green-600" : "text-muted-foreground"}>
              {supplyStats?.approvedOwners || 0}/{city.checklist?.min_approved_owners || 5}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className={supplyStats?.vehiclesMet ? "text-green-600" : "text-muted-foreground"}>
              {supplyStats?.approvedVehicles || 0}/{city.checklist?.min_approved_cars || 10}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Checklist Progress</span>
            <span>
              {checklistStatus.sectionsComplete}/{checklistStatus.totalSections}
            </span>
          </div>
          <Progress
            value={(checklistStatus.sectionsComplete / checklistStatus.totalSections) * 100}
            className="h-2"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full">
          View Checklist
        </Button>
      </CardContent>
    </Card>
  );
}

// City Checklist Panel
function CityChecklistPanel({
  city,
  onLaunch,
  onDelete,
  onClose,
}: {
  city: LaunchCityWithChecklist;
  onLaunch: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { data: supplyStats } = useCitySupplyStats(
    city.name,
    city.state,
    city.checklist?.min_approved_owners || 5,
    city.checklist?.min_approved_cars || 10
  );
  const updateChecklist = useUpdateCityChecklist();
  const updateStatus = useUpdateCityStatus();

  const checklistStatus = calculateChecklistStatus(city.checklist, supplyStats || null);

  const handleChecklistChange = (field: string, value: boolean | string) => {
    updateChecklist.mutate({
      cityId: city.id,
      updates: { [field]: value },
    });
  };

  const handlePause = () => {
    updateStatus.mutate({ cityId: city.id, status: "paused" });
  };

  const handleResume = () => {
    updateStatus.mutate({ cityId: city.id, status: "live" });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>
              {city.name}, {city.state}
            </CardTitle>
            <Badge className={statusColors[city.launch_status as LaunchStatus]}>
              {city.launch_status}
            </Badge>
          </div>
          <div className="flex gap-2">
            {city.launch_status === "live" && (
              <Button variant="outline" size="sm" onClick={handlePause} className="gap-1">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            {city.launch_status === "paused" && (
              <Button variant="outline" size="sm" onClick={handleResume} className="gap-1">
                <Play className="w-4 h-4" />
                Resume
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Progress Overview */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">Overall Progress</span>
              <span>
                {checklistStatus.sectionsComplete} of {checklistStatus.totalSections} sections
              </span>
            </div>
            <Progress
              value={(checklistStatus.sectionsComplete / checklistStatus.totalSections) * 100}
            />
          </div>
          {checklistStatus.allComplete && city.launch_status !== "live" && (
            <Button onClick={onLaunch} className="gap-2">
              <Rocket className="w-4 h-4" />
              Mark as LIVE
            </Button>
          )}
        </div>

        {/* Checklist Sections */}
        <div className="space-y-2">
          {/* Legal Section */}
          <ChecklistSection
            title="Legal & Compliance"
            icon={Scale}
            status={checklistStatus.legal}
          >
            <div className="space-y-3">
              <ChecklistItem
                label="Renter Terms published"
                checked={city.checklist?.legal_renter_terms || false}
                onChange={(v) => handleChecklistChange("legal_renter_terms", v)}
              />
              <ChecklistItem
                label="Owner Terms published"
                checked={city.checklist?.legal_owner_terms || false}
                onChange={(v) => handleChecklistChange("legal_owner_terms", v)}
              />
              <ChecklistItem
                label="Insurance Disclosure published"
                checked={city.checklist?.legal_insurance_disclosure || false}
                onChange={(v) => handleChecklistChange("legal_insurance_disclosure", v)}
              />
              <ChecklistItem
                label="Damage & Incident Policy published"
                checked={city.checklist?.legal_damage_policy || false}
                onChange={(v) => handleChecklistChange("legal_damage_policy", v)}
              />
              <ChecklistItem
                label="Privacy Policy published"
                checked={city.checklist?.legal_privacy_policy || false}
                onChange={(v) => handleChecklistChange("legal_privacy_policy", v)}
              />
            </div>
          </ChecklistSection>

          {/* Insurance Section */}
          <ChecklistSection
            title="Insurance Setup"
            icon={Shield}
            status={checklistStatus.insurance}
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Insurance Provider</Label>
                  <Input
                    value={city.checklist?.insurance_provider_name || ""}
                    onChange={(e) =>
                      handleChecklistChange("insurance_provider_name", e.target.value)
                    }
                    placeholder="e.g., Liberty Mutual"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Type</Label>
                  <Input
                    value={city.checklist?.insurance_coverage_type || "Trip-based"}
                    onChange={(e) =>
                      handleChecklistChange("insurance_coverage_type", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Coverage Confirmation Reference</Label>
                <Input
                  value={city.checklist?.insurance_confirmation_ref || ""}
                  onChange={(e) =>
                    handleChecklistChange("insurance_confirmation_ref", e.target.value)
                  }
                  placeholder="Policy or confirmation number"
                />
              </div>
              <ChecklistItem
                label="Insurance coverage active for this city"
                checked={city.checklist?.insurance_active || false}
                onChange={(v) => handleChecklistChange("insurance_active", v)}
              />
            </div>
          </ChecklistSection>

          {/* Payments Section */}
          <ChecklistSection
            title="Payments & Payouts"
            icon={CreditCard}
            status={checklistStatus.payments}
          >
            <div className="space-y-3">
              <ChecklistItem
                label="Stripe Payments active"
                checked={city.checklist?.payments_stripe_active || false}
                onChange={(v) => handleChecklistChange("payments_stripe_active", v)}
              />
              <ChecklistItem
                label="Stripe Connect enabled"
                checked={city.checklist?.payments_connect_enabled || false}
                onChange={(v) => handleChecklistChange("payments_connect_enabled", v)}
              />
              <ChecklistItem
                label="Test payment completed successfully"
                checked={city.checklist?.payments_test_payment || false}
                onChange={(v) => handleChecklistChange("payments_test_payment", v)}
              />
              <ChecklistItem
                label="Test payout completed successfully"
                checked={city.checklist?.payments_test_payout || false}
                onChange={(v) => handleChecklistChange("payments_test_payout", v)}
              />
            </div>
          </ChecklistSection>

          {/* Supply Section */}
          <ChecklistSection
            title="Owner Supply (Minimum)"
            icon={Users}
            status={{ complete: checklistStatus.supply.isComplete ? 1 : 0, total: 1, isComplete: checklistStatus.supply.isComplete }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Approved Owners</span>
                  </div>
                  {supplyStats?.ownersMet ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className="text-2xl font-bold mt-2">
                  {supplyStats?.approvedOwners || 0}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{city.checklist?.min_approved_owners || 5} min
                  </span>
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Approved Vehicles</span>
                  </div>
                  {supplyStats?.vehiclesMet ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className="text-2xl font-bold mt-2">
                  {supplyStats?.approvedVehicles || 0}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{city.checklist?.min_approved_cars || 10} min
                  </span>
                </p>
              </div>
            </div>
          </ChecklistSection>

          {/* Operations Section */}
          <ChecklistSection
            title="Operational Readiness"
            icon={Wrench}
            status={checklistStatus.operations}
          >
            <div className="space-y-3">
              <ChecklistItem
                label="Admin dispute workflow tested"
                checked={city.checklist?.ops_dispute_tested || false}
                onChange={(v) => handleChecklistChange("ops_dispute_tested", v)}
              />
              <ChecklistItem
                label="Damage reporting workflow tested"
                checked={city.checklist?.ops_damage_tested || false}
                onChange={(v) => handleChecklistChange("ops_damage_tested", v)}
              />
              <ChecklistItem
                label="Booking cancellation tested"
                checked={city.checklist?.ops_cancellation_tested || false}
                onChange={(v) => handleChecklistChange("ops_cancellation_tested", v)}
              />
              <ChecklistItem
                label="Owner payout delay logic tested"
                checked={city.checklist?.ops_payout_delay_tested || false}
                onChange={(v) => handleChecklistChange("ops_payout_delay_tested", v)}
              />
            </div>
          </ChecklistSection>

          {/* Support Section */}
          <ChecklistSection
            title="Support & Contact"
            icon={HeadphonesIcon}
            status={checklistStatus.support}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  type="email"
                  value={city.checklist?.support_email || ""}
                  onChange={(e) => handleChecklistChange("support_email", e.target.value)}
                  placeholder="support@hizovo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Procedure</Label>
                <Textarea
                  value={city.checklist?.support_emergency_procedure || ""}
                  onChange={(e) =>
                    handleChecklistChange("support_emergency_procedure", e.target.value)
                  }
                  placeholder="Describe the emergency escalation process..."
                  rows={3}
                />
              </div>
              <ChecklistItem
                label="Support process confirmed"
                checked={city.checklist?.support_confirmed || false}
                onChange={(v) => handleChecklistChange("support_confirmed", v)}
              />
            </div>
          </ChecklistSection>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-1"
            disabled={city.launch_status === "live"}
          >
            <Trash2 className="w-4 h-4" />
            Delete City
          </Button>
          {checklistStatus.allComplete && city.launch_status !== "live" && (
            <Button onClick={onLaunch} className="gap-2">
              <Rocket className="w-4 h-4" />
              Mark City as LIVE
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Checklist Section Component
function ChecklistSection({
  title,
  icon: Icon,
  status,
  children,
}: {
  title: string;
  icon: React.ElementType;
  status: { complete: number; total: number; isComplete: boolean };
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
            status.isComplete && "border-green-500/50 bg-green-500/5"
          )}
        >
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {status.complete}/{status.total}
            </span>
            {status.isComplete ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-3 border-x border-b rounded-b-lg -mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Checklist Item Component
function ChecklistItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        id={label.replace(/\s+/g, "-").toLowerCase()}
      />
      <Label
        htmlFor={label.replace(/\s+/g, "-").toLowerCase()}
        className="cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}

// Add City Modal
function AddCityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const createCity = useCreateLaunchCity();

  const handleSubmit = () => {
    if (!name.trim() || !state) return;
    createCity.mutate(
      { name: name.trim(), state },
      {
        onSuccess: () => {
          setName("");
          setState("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New City</DialogTitle>
          <DialogDescription>
            Add a city to prepare for P2P marketplace launch
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>City Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Los Angeles"
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !state || createCity.isPending}
          >
            Add City
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Launch Confirmation Modal
function LaunchConfirmModal({
  open,
  city,
  onClose,
}: {
  open: boolean;
  city: LaunchCityWithChecklist;
  onClose: () => void;
}) {
  const updateStatus = useUpdateCityStatus();

  const handleLaunch = () => {
    updateStatus.mutate(
      { cityId: city.id, status: "live" },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Launch {city.name}, {city.state}
          </DialogTitle>
          <DialogDescription>
            You are about to enable public bookings for this city.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">This will:</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Make cars in this city searchable
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Allow bookings and payments
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Trigger live operations
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={updateStatus.isPending}>
            Confirm Launch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  open,
  city,
  onClose,
}: {
  open: boolean;
  city: LaunchCityWithChecklist;
  onClose: () => void;
}) {
  const deleteCity = useDeleteLaunchCity();

  const handleDelete = () => {
    deleteCity.mutate(city.id, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {city.name}, {city.state}?</DialogTitle>
          <DialogDescription>
            This will permanently delete this city and its checklist. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCity.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

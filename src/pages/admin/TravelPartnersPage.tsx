import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Plane, 
  Building2, 
  Car, 
  Pencil, 
  Trash2,
  ExternalLink,
  Check,
  X,
  GripVertical
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  useTravelPartners, 
  useCreateTravelPartner, 
  useUpdateTravelPartner, 
  useDeleteTravelPartner,
  TravelPartner,
  TravelPartnerType,
  CheckoutMode
} from "@/hooks/useTravelAdminData";

const getTypeIcon = (type: TravelPartnerType) => {
  switch (type) {
    case 'flights':
      return <Plane className="h-4 w-4 text-sky-500" />;
    case 'hotels':
      return <Building2 className="h-4 w-4 text-purple-500" />;
    case 'cars':
      return <Car className="h-4 w-4 text-emerald-500" />;
  }
};

const getTypeBgColor = (type: TravelPartnerType) => {
  switch (type) {
    case 'flights':
      return 'bg-sky-500/10';
    case 'hotels':
      return 'bg-purple-500/10';
    case 'cars':
      return 'bg-emerald-500/10';
  }
};

interface PartnerFormData {
  name: string;
  type: TravelPartnerType;
  base_url: string;
  checkout_mode: CheckoutMode;
  tracking_params: string;
  description: string;
  priority: number;
  is_active: boolean;
}

const defaultFormData: PartnerFormData = {
  name: '',
  type: 'flights',
  base_url: '',
  checkout_mode: 'redirect',
  tracking_params: '{}',
  description: '',
  priority: 100,
  is_active: true,
};

const TravelPartnersPage = () => {
  const { data: partners, isLoading } = useTravelPartners();
  const createPartner = useCreateTravelPartner();
  const updatePartner = useUpdateTravelPartner();
  const deletePartner = useDeleteTravelPartner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<TravelPartner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<TravelPartner | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>(defaultFormData);
  const [trackingParamsError, setTrackingParamsError] = useState('');

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setFormData(defaultFormData);
    setTrackingParamsError('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (partner: TravelPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      type: partner.type,
      base_url: partner.base_url,
      checkout_mode: partner.checkout_mode,
      tracking_params: JSON.stringify(partner.tracking_params, null, 2),
      description: partner.description || '',
      priority: partner.priority,
      is_active: partner.is_active,
    });
    setTrackingParamsError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validate tracking params JSON
    let parsedParams: Record<string, string> = {};
    try {
      parsedParams = JSON.parse(formData.tracking_params || '{}');
      setTrackingParamsError('');
    } catch {
      setTrackingParamsError('Invalid JSON format');
      return;
    }

    const partnerData = {
      name: formData.name,
      type: formData.type,
      base_url: formData.base_url,
      checkout_mode: formData.checkout_mode,
      tracking_params: parsedParams,
      description: formData.description || null,
      priority: formData.priority,
      is_active: formData.is_active,
    };

    if (editingPartner) {
      await updatePartner.mutateAsync({ id: editingPartner.id, updates: partnerData });
    } else {
      await createPartner.mutateAsync(partnerData);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingPartner) {
      await deletePartner.mutateAsync(deletingPartner.id);
      setIsDeleteDialogOpen(false);
      setDeletingPartner(null);
    }
  };

  const handleToggleActive = async (partner: TravelPartner) => {
    await updatePartner.mutateAsync({
      id: partner.id,
      updates: { is_active: !partner.is_active },
    });
  };

  const filterByType = (type: TravelPartnerType) => {
    return partners?.filter(p => p.type === type) || [];
  };

  const PartnerCard = ({ partner }: { partner: TravelPartner }) => (
    <Card className={`${!partner.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${getTypeBgColor(partner.type)}`}>
              {getTypeIcon(partner.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{partner.name}</h3>
                <Badge variant="outline" className="text-xs">
                  Priority: {partner.priority}
                </Badge>
                <Badge variant={partner.checkout_mode === 'redirect' ? 'secondary' : 'default'} className="text-xs">
                  {partner.checkout_mode}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {partner.base_url}
              </p>
              {partner.description && (
                <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
              )}
              {Object.keys(partner.tracking_params).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(partner.tracking_params).map(([key, value]) => (
                    <TooltipProvider key={key}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs bg-muted">
                            {key}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{key}={value}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Switch
                      checked={partner.is_active}
                      onCheckedChange={() => handleToggleActive(partner)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{partner.is_active ? 'Disable partner' : 'Enable partner'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(partner)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setDeletingPartner(partner);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/travel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Travel Partners</h1>
            <p className="text-muted-foreground">
              Manage partner URLs and tracking parameters
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Partners by Type */}
      <Tabs defaultValue="flights">
        <TabsList>
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2">
            <Building2 className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="cars" className="gap-2">
            <Car className="h-4 w-4" />
            Cars
          </TabsTrigger>
        </TabsList>

        {(['flights', 'hotels', 'cars'] as TravelPartnerType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filterByType(type).length > 0 ? (
              <div className="space-y-4">
                {filterByType(type).map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className={`mx-auto mb-4 p-4 rounded-full w-fit ${getTypeBgColor(type)}`}>
                    {getTypeIcon(type)}
                  </div>
                  <h3 className="font-semibold mb-2">No {type} partners</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first {type} partner to start tracking redirects
                  </p>
                  <Button onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? 'Edit Partner' : 'Add Partner'}
            </DialogTitle>
            <DialogDescription>
              Configure partner details and tracking parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Partner Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Expedia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TravelPartnerType) => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flights">Flights</SelectItem>
                    <SelectItem value="hotels">Hotels</SelectItem>
                    <SelectItem value="cars">Cars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url">Base Checkout URL</Label>
              <Input
                id="base_url"
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                placeholder="https://partner.com/checkout"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkout_mode">Checkout Mode</Label>
                <Select
                  value={formData.checkout_mode}
                  onValueChange={(value: CheckoutMode) => 
                    setFormData({ ...formData, checkout_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redirect">Redirect</SelectItem>
                    <SelectItem value="iframe">Embedded (iframe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Lower number = higher priority (used for fallback)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking_params">Tracking Parameters (JSON)</Label>
              <Textarea
                id="tracking_params"
                value={formData.tracking_params}
                onChange={(e) => setFormData({ ...formData, tracking_params: e.target.value })}
                placeholder='{"utm_source": "zivo", "affiliate_id": "XXX"}'
                rows={4}
                className="font-mono text-sm"
              />
              {trackingParamsError && (
                <p className="text-sm text-destructive">{trackingParamsError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                These parameters will be appended to all redirect URLs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this partner"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.base_url || createPartner.isPending || updatePartner.isPending}
            >
              {editingPartner ? 'Save Changes' : 'Create Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPartner?.name}"? This action cannot be undone.
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
    </div>
  );
};

export default TravelPartnersPage;

/**
 * Dispatch Promotions Management Page
 * Create, view, and manage promotional campaigns
 */

import { useState } from 'react';
import { 
  Tag, Plus, Copy, ToggleLeft, ToggleRight, Trash2, 
  Search, Calendar, Percent, DollarSign, Truck 
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDispatchPromotions, CreatePromotionInput } from '@/hooks/useDispatchPromotions';
import { toast } from 'sonner';

export default function DispatchPromotions() {
  const { promotions, isLoading, stats, createPromotion, toggleActive, deletePromotion } = useDispatchPromotions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<CreatePromotionInput>>({
    discount_type: 'percentage',
    discount_value: 10,
  });

  const filteredPromotions = promotions?.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'active') return matchesSearch && promo.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !promo.is_active;
    if (filterStatus === 'expired') return matchesSearch && promo.ends_at && new Date(promo.ends_at) < new Date();
    return matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code || !newPromo.discount_value) {
      toast.error('Code and discount value are required');
      return;
    }

    await createPromotion.mutateAsync(newPromo as CreatePromotionInput);
    setShowCreateDialog(false);
    setNewPromo({ discount_type: 'percentage', discount_value: 10 });
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed': return <DollarSign className="h-4 w-4" />;
      case 'free_delivery': return <Truck className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getDiscountDisplay = (promo: typeof promotions[0]) => {
    switch (promo.discount_type) {
      case 'percentage': return `${promo.discount_value}% off`;
      case 'fixed': return `$${promo.discount_value} off`;
      case 'free_delivery': return 'Free Delivery';
      default: return `${promo.discount_value}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Create and manage promo codes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., SAVE20"
                  value={newPromo.code || ''}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Winter Sale"
                  value={newPromo.name || ''}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Promotion description..."
                  value={newPromo.description || ''}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={newPromo.discount_type}
                    onValueChange={(v) => setNewPromo(prev => ({ ...prev, discount_type: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="free_delivery">Free Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {newPromo.discount_type === 'percentage' ? 'Discount %' : 'Amount $'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    value={newPromo.discount_value || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order">Min Order $</Label>
                  <Input
                    id="min_order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newPromo.min_order_amount || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount">Max Discount $</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={newPromo.max_discount || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, max_discount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={newPromo.usage_limit || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, usage_limit: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="per_user_limit">Per User Limit</Label>
                  <Input
                    id="per_user_limit"
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={newPromo.per_user_limit || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, per_user_limit: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Start Date</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={newPromo.starts_at || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, starts_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">End Date</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={newPromo.ends_at || ''}
                    onChange={(e) => setNewPromo(prev => ({ ...prev, ends_at: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromo} disabled={createPromotion.isPending}>
                {createPromotion.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Promos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promotions List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading promotions...
            </CardContent>
          </Card>
        ) : filteredPromotions?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No promotions found
            </CardContent>
          </Card>
        ) : (
          filteredPromotions?.map(promo => (
            <Card key={promo.id} className={!promo.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-lg font-bold bg-muted px-2 py-1 rounded">
                        {promo.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyCode(promo.code)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {promo.ends_at && new Date(promo.ends_at) < new Date() && (
                        <Badge variant="outline" className="text-amber-600">Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {promo.name || promo.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5">
                        {getDiscountIcon(promo.discount_type)}
                        <strong>{getDiscountDisplay(promo)}</strong>
                      </span>
                      {promo.min_order_amount > 0 && (
                        <span className="text-muted-foreground">
                          Min: ${promo.min_order_amount}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Used: {promo.usage_count}/{promo.usage_limit || '∞'}
                      </span>
                      {promo.ends_at && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          Ends {format(new Date(promo.ends_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive.mutate({ id: promo.id, is_active: !promo.is_active })}
                      disabled={toggleActive.isPending}
                    >
                      {promo.is_active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePromotion.mutate(promo.id)}
                      disabled={deletePromotion.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

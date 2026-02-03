/**
 * Admin Pricing Dashboard
 * Manage pricing rules, promotions, and A/B experiments
 */
import { useState } from 'react';
import { 
  DollarSign, 
  Tag, 
  FlaskConical, 
  TrendingUp,
  Plus,
  Pause,
  Play,
  Edit2,
  Trash2,
  Copy,
  BarChart3,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  usePricingRules, 
  usePromotions, 
  useExperiments,
  usePromoStats,
  useExperimentStats,
  useCreatePricingRule,
  useUpdatePricingRule,
  useCreatePromotion,
  useUpdatePromotion,
  useCreateExperiment,
  useUpdateExperiment,
  type PricingRule,
  type Promotion,
  type Experiment
} from '@/hooks/usePricingData';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdminPricingDashboard() {
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  
  // Data queries
  const { data: rules, isLoading: rulesLoading } = usePricingRules();
  const { data: promotions, isLoading: promosLoading } = usePromotions();
  const { data: experiments, isLoading: expLoading } = useExperiments();
  const { data: promoStats } = usePromoStats();
  const { data: experimentStats } = useExperimentStats(selectedExperiment);
  
  // Mutations
  const createRule = useCreatePricingRule();
  const updateRule = useUpdatePricingRule();
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const createExperiment = useCreateExperiment();
  const updateExperiment = useUpdateExperiment();

  // Stats
  const activeRules = rules?.filter(r => r.is_active).length || 0;
  const activePromos = promotions?.filter(p => p.is_active).length || 0;
  const runningExperiments = experiments?.filter(e => e.status === 'running').length || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing & Promotions</h1>
          <p className="text-muted-foreground">Manage dynamic pricing, promos, and A/B tests</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{activeRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Tag className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Promos</p>
                <p className="text-2xl font-bold">{activePromos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FlaskConical className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold">{runningExperiments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Percent className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discounts Given</p>
                <p className="text-2xl font-bold">${promoStats?.total_discount_given?.toFixed(0) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="promos" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            A/B Tests
          </TabsTrigger>
        </TabsList>

        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Rules are applied in priority order (highest first)
            </p>
            <CreateRuleDialog onCreate={createRule.mutate} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Rule</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Value</th>
                      <th className="text-left p-4 font-medium">Applies To</th>
                      <th className="text-left p-4 font-medium">Priority</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rulesLoading ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                    ) : rules?.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No pricing rules yet</td></tr>
                    ) : (
                      rules?.map(rule => (
                        <tr key={rule.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{rule.name}</p>
                              {rule.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{rule.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {rule.rule_type.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="p-4 font-mono">
                            {rule.rule_type.includes('percent') ? `${rule.value}%` : `$${rule.value}`}
                          </td>
                          <td className="p-4 capitalize">{rule.applies_to}</td>
                          <td className="p-4">{rule.priority}</td>
                          <td className="p-4">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => updateRule.mutate({ id: rule.id, is_active: checked })}
                            />
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{promoStats?.total_redemptions || 0} redemptions</Badge>
              <Badge variant="secondary">Avg discount: ${promoStats?.avg_discount?.toFixed(2) || 0}</Badge>
            </div>
            <CreatePromoDialog onCreate={createPromo.mutate} />
          </div>

          <div className="grid gap-4">
            {promosLoading ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : promotions?.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No promotions yet</CardContent></Card>
            ) : (
              promotions?.map(promo => (
                <Card key={promo.id} className={!promo.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{promo.name}</h3>
                            <Badge variant="outline" className="font-mono">{promo.code}</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(promo.code);
                                toast.success('Code copied');
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>
                              {promo.discount_type === 'percentage' 
                                ? `${promo.discount_value}% off`
                                : `$${promo.discount_value} off`}
                            </span>
                            {promo.min_order_amount && (
                              <span>• Min order ${promo.min_order_amount}</span>
                            )}
                            <span>• {promo.usage_count || 0}/{promo.usage_limit || '∞'} used</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PromoStatusBadge promo={promo} />
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={(checked) => updatePromo.mutate({ id: promo.id, is_active: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Test pricing changes safely with statistical significance
            </p>
            <CreateExperimentDialog onCreate={createExperiment.mutate} />
          </div>

          <div className="grid gap-4">
            {expLoading ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : experiments?.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No experiments yet</CardContent></Card>
            ) : (
              experiments?.map(exp => (
                <ExperimentCard 
                  key={exp.id} 
                  experiment={exp}
                  onUpdate={updateExperiment.mutate}
                  onViewStats={() => setSelectedExperiment(exp.id)}
                  stats={selectedExperiment === exp.id ? experimentStats : undefined}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Promo Status Badge
function PromoStatusBadge({ promo }: { promo: Promotion }) {
  const now = new Date();
  const start = promo.starts_at ? new Date(promo.starts_at) : null;
  const end = promo.ends_at ? new Date(promo.ends_at) : null;

  if (!promo.is_active) {
    return <Badge variant="secondary">Paused</Badge>;
  }
  if (start && now < start) {
    return <Badge variant="outline" className="text-blue-500 border-blue-500">Scheduled</Badge>;
  }
  if (end && now > end) {
    return <Badge variant="destructive">Expired</Badge>;
  }
  return <Badge className="bg-green-500">Active</Badge>;
}

// Experiment Card
function ExperimentCard({ 
  experiment, 
  onUpdate,
  onViewStats,
  stats 
}: { 
  experiment: Experiment;
  onUpdate: (data: Partial<Experiment> & { id: string }) => void;
  onViewStats: () => void;
  stats?: any[];
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    running: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <FlaskConical className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{experiment.name}</h3>
                <Badge className={statusColors[experiment.status]}>
                  {experiment.status}
                </Badge>
              </div>
              {experiment.hypothesis && (
                <p className="text-sm text-muted-foreground mt-1">{experiment.hypothesis}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {experiment.metric_primary}
                </span>
                <span>• {Array.isArray(experiment.variants) ? experiment.variants.length : 2} variants</span>
                {experiment.start_at && (
                  <span>• Started {formatDistanceToNow(new Date(experiment.start_at))} ago</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewStats}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </Button>
            {experiment.status === 'draft' && (
              <Button 
                size="sm"
                onClick={() => onUpdate({ 
                  id: experiment.id, 
                  status: 'running',
                  start_at: new Date().toISOString()
                })}
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            {experiment.status === 'running' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdate({ id: experiment.id, status: 'paused' })}
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}
            {experiment.status === 'paused' && (
              <Button 
                size="sm"
                onClick={() => onUpdate({ id: experiment.id, status: 'running' })}
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* Variant Stats */}
        {stats && stats.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.variant} className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium capitalize">{s.variant}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CVR</span>
                    <span className="font-mono">{s.conversion_rate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-mono">${s.revenue.toFixed(0)}</span>
                  </div>
                  <Progress value={s.conversion_rate} className="h-1 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Create Rule Dialog
function CreateRuleDialog({ onCreate }: { onCreate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    rule_type: 'markup_percent',
    value: 0,
    applies_to: 'all',
    priority: 0,
    is_active: true
  });

  const handleSubmit = () => {
    onCreate(form);
    setOpen(false);
    setForm({ name: '', description: '', rule_type: 'markup_percent', value: 0, applies_to: 'all', priority: 0, is_active: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Add Rule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pricing Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Standard Markup"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.rule_type} onValueChange={v => setForm({ ...form, rule_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="markup_percent">Markup %</SelectItem>
                  <SelectItem value="markup_flat">Markup Flat</SelectItem>
                  <SelectItem value="service_fee_percent">Service Fee %</SelectItem>
                  <SelectItem value="service_fee_flat">Service Fee Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input 
                type="number" 
                value={form.value} 
                onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Applies To</Label>
              <Select value={form.applies_to} onValueChange={v => setForm({ ...form, applies_to: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="flight">Flights</SelectItem>
                  <SelectItem value="hotel">Hotels</SelectItem>
                  <SelectItem value="activity">Activities</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="car_rental">Car Rentals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Input 
                type="number" 
                value={form.priority} 
                onChange={e => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name}>Create Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create Promo Dialog
function CreatePromoDialog({ onCreate }: { onCreate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: null as number | null,
    max_discount: null as number | null,
    max_uses: null as number | null,
    max_uses_per_user: 1,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });

  const handleSubmit = () => {
    onCreate({
      ...form,
      code: form.code.toUpperCase(),
      valid_from: new Date(form.valid_from).toISOString(),
      valid_until: new Date(form.valid_until).toISOString()
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Create Promo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Promotion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Promo Name</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Summer Sale"
            />
          </div>
          <div>
            <Label>Promo Code</Label>
            <Input 
              value={form.code} 
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SUMMER20"
              className="font-mono uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input 
                type="number" 
                value={form.discount_value} 
                onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={form.valid_from} 
                onChange={e => setForm({ ...form, valid_from: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={form.valid_until} 
                onChange={e => setForm({ ...form, valid_until: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Order ($)</Label>
              <Input 
                type="number" 
                value={form.min_order_value || ''} 
                onChange={e => setForm({ ...form, min_order_value: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Max Uses</Label>
              <Input 
                type="number" 
                value={form.max_uses || ''} 
                onChange={e => setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.code}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create Experiment Dialog
function CreateExperimentDialog({ onCreate }: { onCreate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    hypothesis: '',
    metric_primary: 'conversion_rate',
    variants: [
      { name: 'control', weight: 50 },
      { name: 'variant_a', weight: 50 }
    ],
    status: 'draft' as const
  });

  const handleSubmit = () => {
    onCreate(form);
    setOpen(false);
    setForm({
      name: '',
      description: '',
      hypothesis: '',
      metric_primary: 'conversion_rate',
      variants: [{ name: 'control', weight: 50 }, { name: 'variant_a', weight: 50 }],
      status: 'draft'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />New Experiment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create A/B Experiment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Experiment Name</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Checkout Button Test"
            />
          </div>
          <div>
            <Label>Hypothesis</Label>
            <Textarea 
              value={form.hypothesis} 
              onChange={e => setForm({ ...form, hypothesis: e.target.value })}
              placeholder="e.g., Showing trust badges will increase CVR by 5%"
            />
          </div>
          <div>
            <Label>Primary Metric</Label>
            <Select value={form.metric_primary} onValueChange={v => setForm({ ...form, metric_primary: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                <SelectItem value="revenue_per_visitor">Revenue per Visitor</SelectItem>
                <SelectItem value="average_order_value">Average Order Value</SelectItem>
                <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Variants (must total 100%)</Label>
            {form.variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input 
                  value={v.name} 
                  onChange={e => {
                    const newVariants = [...form.variants];
                    newVariants[i].name = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }}
                  placeholder="Variant name"
                  className="flex-1"
                />
                <Input 
                  type="number"
                  value={v.weight} 
                  onChange={e => {
                    const newVariants = [...form.variants];
                    newVariants[i].weight = parseInt(e.target.value) || 0;
                    setForm({ ...form, variants: newVariants });
                  }}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setForm({ 
                ...form, 
                variants: [...form.variants, { name: `variant_${String.fromCharCode(97 + form.variants.length)}`, weight: 0 }]
              })}
            >
              Add Variant
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

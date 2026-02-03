/**
 * ZIVO Compliance & Regulatory Readiness Dashboard
 * Comprehensive compliance tracking, SoT registrations, and quarterly reviews
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Globe, 
  CreditCard, 
  Lock, 
  Mail,
  Users,
  Database,
  Calendar,
  Plus,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  useComplianceCategories,
  useComplianceRequirements,
  useUpdateRequirementStatus,
  useSellerOfTravelRegistrations,
  useUpdateSoTRegistration,
  useComplianceReviews,
  useCreateComplianceReview,
  useDataRetentionPolicies,
  useComplianceMetrics,
  type ComplianceRequirement,
} from '@/hooks/useCompliancePlaybook';
import ComplianceStatusBadge from '@/components/compliance/ComplianceStatusBadge';
import SoTStatusBadge from '@/components/compliance/SoTStatusBadge';

const categoryIcons: Record<string, typeof Shield> = {
  'travel-ota': Globe,
  'seller-of-travel': FileText,
  'payment-financial': CreditCard,
  'tax-fees': FileText,
  'privacy-data': Lock,
  'email-comms': Mail,
  'customer-protection': Users,
  'record-keeping': Database,
};

export default function ComplianceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<ComplianceRequirement | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const { data: categories, isLoading: loadingCategories } = useComplianceCategories();
  const { data: requirements, isLoading: loadingRequirements } = useComplianceRequirements();
  const { data: sotRegistrations } = useSellerOfTravelRegistrations();
  const { data: reviews } = useComplianceReviews();
  const { data: retentionPolicies } = useDataRetentionPolicies();
  const metrics = useComplianceMetrics();

  const updateStatus = useUpdateRequirementStatus();
  const updateSoT = useUpdateSoTRegistration();
  const createReview = useCreateComplianceReview();

  const handleUpdateRequirement = () => {
    if (!editingRequirement || !newStatus) return;
    
    updateStatus.mutate({
      id: editingRequirement.id,
      status: newStatus as ComplianceRequirement['compliance_status'],
      evidenceNotes,
      evidenceUrl,
    }, {
      onSuccess: () => {
        setEditingRequirement(null);
        setNewStatus('');
        setEvidenceNotes('');
        setEvidenceUrl('');
      },
    });
  };

  const getRequirementsForCategory = (categoryId: string) => {
    return requirements?.filter(r => r.category_id === categoryId) || [];
  };

  const getCategoryProgress = (categoryId: string) => {
    const catReqs = getRequirementsForCategory(categoryId);
    if (catReqs.length === 0) return 0;
    const compliant = catReqs.filter(r => r.compliance_status === 'compliant' || r.compliance_status === 'not_applicable').length;
    return Math.round((compliant / catReqs.length) * 100);
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    return `Q${q} ${now.getFullYear()}`;
  };

  if (loadingCategories || loadingRequirements) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            Compliance & Regulatory Readiness
          </h1>
          <p className="text-muted-foreground">Track legal, payment, privacy, and travel compliance requirements</p>
        </div>
        <Button onClick={() => createReview.mutate(getCurrentQuarter())}>
          <Plus className="w-4 h-4 mr-2" />
          Start Quarterly Review
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{metrics.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Compliance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{metrics.compliant}</div>
            <p className="text-xs text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-sky-500">{metrics.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{metrics.nonCompliant}</div>
            <p className="text-xs text-muted-foreground">Non-Compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{metrics.sotActive}</div>
            <p className="text-xs text-muted-foreground">SoT Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
          <TabsTrigger value="seller-of-travel">Seller of Travel</TabsTrigger>
          <TabsTrigger value="reviews">Quarterly Reviews</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        {/* Compliance Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="grid gap-4">
            {categories?.map(category => {
              const Icon = categoryIcons[category.slug] || Shield;
              const catReqs = getRequirementsForCategory(category.id);
              const progress = getCategoryProgress(category.id);
              
              return (
                <Card key={category.id}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={category.id} className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-4 mr-4">
                            <div className="w-32">
                              <Progress value={progress} className="h-2" />
                            </div>
                            <span className="text-sm font-medium w-12">{progress}%</span>
                            <Badge variant="outline">{catReqs.length} items</Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-6 pb-4 space-y-2">
                          {catReqs.map(req => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <ComplianceStatusBadge status={req.compliance_status} showLabel={false} size="sm" />
                                <div>
                                  <p className="font-medium text-sm">{req.title}</p>
                                  {req.description && (
                                    <p className="text-xs text-muted-foreground">{req.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {req.last_reviewed_at && (
                                  <span className="text-xs text-muted-foreground">
                                    Last reviewed: {format(new Date(req.last_reviewed_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                                <Badge variant={req.requirement_type === 'required' ? 'default' : 'secondary'} className="text-xs">
                                  {req.requirement_type}
                                </Badge>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingRequirement(req);
                                        setNewStatus(req.compliance_status);
                                        setEvidenceNotes(req.evidence_notes || '');
                                        setEvidenceUrl(req.evidence_url || '');
                                      }}
                                    >
                                      Update
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Update Compliance Status</DialogTitle>
                                      <DialogDescription>{editingRequirement?.title}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={newStatus} onValueChange={setNewStatus}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="compliant">Compliant</SelectItem>
                                            <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                                            <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Evidence URL</label>
                                        <Input
                                          value={evidenceUrl}
                                          onChange={(e) => setEvidenceUrl(e.target.value)}
                                          placeholder="Link to documentation or evidence"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Notes</label>
                                        <Textarea
                                          value={evidenceNotes}
                                          onChange={(e) => setEvidenceNotes(e.target.value)}
                                          placeholder="Add notes about compliance status..."
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handleUpdateRequirement} disabled={updateStatus.isPending}>
                                        {updateStatus.isPending ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Seller of Travel */}
        <TabsContent value="seller-of-travel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Seller of Travel Registrations
              </CardTitle>
              <CardDescription>
                Track state-by-state Seller of Travel registration requirements and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sotRegistrations?.map(reg => (
                  <div
                    key={reg.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      reg.registration_status === 'active' && "border-emerald-500/30 bg-emerald-500/5",
                      reg.registration_status === 'pending' && "border-amber-500/30 bg-amber-500/5",
                      reg.registration_status === 'expired' && "border-red-500/30 bg-red-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-bold text-lg">
                        {reg.state_code}
                      </div>
                      <div>
                        <h4 className="font-semibold">{reg.state_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {reg.registration_required ? (
                            <span className="text-amber-600">Registration Required</span>
                          ) : (
                            <span>Not Required</span>
                          )}
                          {reg.registration_number && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{reg.registration_number}</span>
                            </>
                          )}
                        </div>
                        {reg.expiry_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {format(new Date(reg.expiry_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SoTStatusBadge status={reg.registration_status as any} />
                      {reg.legal_opinion_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={reg.legal_opinion_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarterly Reviews */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Quarterly Compliance Reviews
              </CardTitle>
              <CardDescription>
                Track internal compliance audits and action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div
                      key={review.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        review.status === 'completed' && "border-emerald-500/30 bg-emerald-500/5",
                        review.status === 'in_progress' && "border-sky-500/30 bg-sky-500/5",
                        review.status === 'pending' && "border-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{review.review_period}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{review.review_type} Review</p>
                        </div>
                        <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                          {review.status}
                        </Badge>
                      </div>
                      {review.summary && (
                        <p className="text-sm mt-2">{review.summary}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {review.started_at && (
                          <span>Started: {format(new Date(review.started_at), 'MMM d, yyyy')}</span>
                        )}
                        {review.completed_at && (
                          <span>Completed: {format(new Date(review.completed_at), 'MMM d, yyyy')}</span>
                        )}
                        {review.next_review_date && (
                          <span>Next: {format(new Date(review.next_review_date), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No quarterly reviews yet</p>
                  <Button className="mt-4" onClick={() => createReview.mutate(getCurrentQuarter())}>
                    Start {getCurrentQuarter()} Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Retention */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Retention Policies
              </CardTitle>
              <CardDescription>
                Record keeping requirements and retention periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {retentionPolicies?.map(policy => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-semibold capitalize">{policy.data_type.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                      {policy.legal_basis && (
                        <p className="text-xs text-muted-foreground mt-1">{policy.legal_basis}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {Math.round(policy.retention_period_days / 365)} years
                      </div>
                      <p className="text-xs text-muted-foreground">{policy.retention_period_days} days</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

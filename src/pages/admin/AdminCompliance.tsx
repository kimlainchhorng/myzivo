/**
 * Admin Compliance Checklist
 * Internal tool for verifying partner-readiness
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  Download,
  RefreshCw,
  Shield,
  FileText,
  Link as LinkIcon,
  Eye,
  Lock,
  ExternalLink,
  Home
} from "lucide-react";
import { format } from "date-fns";

interface ComplianceCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'pending';
  notes: string;
  lastChecked?: string;
}

const defaultChecks: Omit<ComplianceCheck, 'status' | 'notes' | 'lastChecked'>[] = [
  // Legal Pages
  { id: 'legal_terms', category: 'Legal Pages', name: 'Terms of Service', description: '/terms page exists and is accessible' },
  { id: 'legal_privacy', category: 'Legal Pages', name: 'Privacy Policy', description: '/privacy page exists with data handling info' },
  { id: 'legal_cookies', category: 'Legal Pages', name: 'Cookie Policy', description: '/cookies page exists with tracking disclosure' },
  { id: 'legal_partner', category: 'Legal Pages', name: 'Partner Disclosure', description: '/partner-disclosure explains affiliate relationships' },
  { id: 'legal_affiliate', category: 'Legal Pages', name: 'Affiliate Disclosure', description: '/affiliate-disclosure visible in footer' },
  
  // Disclosures
  { id: 'disc_footer', category: 'Disclosures', name: 'Footer Disclosure', description: 'MOR disclaimer in site footer on all pages' },
  { id: 'disc_results', category: 'Disclosures', name: 'Results Disclosure', description: 'Partner redirect notice on result cards' },
  { id: 'disc_checkout', category: 'Disclosures', name: 'Checkout Disclosure', description: '"Complete with travel partner" text before handoff' },
  { id: 'disc_price', category: 'Disclosures', name: 'Price Disclaimer', description: 'Indicative price alerts on results pages' },
  
  // Consent
  { id: 'consent_checkbox', category: 'Consent', name: 'Consent Checkbox', description: 'Required checkbox before partner redirect (when collecting email)' },
  { id: 'consent_modal', category: 'Consent', name: 'Consent Modal', description: 'Partner consent modal with disclosure text' },
  
  // No Payments
  { id: 'pay_no_stripe', category: 'No Payments', name: 'No Payment Forms', description: 'No Stripe/payment elements on travel pages' },
  { id: 'pay_no_checkout', category: 'No Payments', name: 'No Direct Checkout', description: 'No "Pay Now" or "Complete Booking" CTAs' },
  { id: 'pay_redirect', category: 'No Payments', name: 'Partner Redirect', description: 'All bookings redirect to partner sites' },
  
  // Tracking
  { id: 'track_utm', category: 'Tracking', name: 'UTM Parameters', description: 'utm_source=hizovo on all partner links' },
  { id: 'track_subid', category: 'Tracking', name: 'SubID Tracking', description: 'subid={sessionId} on all partner links' },
  { id: 'track_logs', category: 'Tracking', name: 'Redirect Logging', description: 'PartnerRedirectLog captures all handoffs' },
  { id: 'track_csv', category: 'Tracking', name: 'CSV Export', description: 'Admin can export redirect logs to CSV' },
  
  // Support
  { id: 'support_help', category: 'Support', name: 'Help Center', description: '/help page with FAQ sections' },
  { id: 'support_contact', category: 'Support', name: 'Contact Page', description: '/contact with support emails' },
  { id: 'support_boundaries', category: 'Support', name: 'Support Boundaries', description: 'Clear partner vs Hizovo responsibility docs' },
];

export default function AdminCompliance() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize checks
  useEffect(() => {
    loadChecks();
  }, []);

  const loadChecks = async () => {
    setIsLoading(true);
    try {
      // Try to load from localStorage (in production, use database)
      const saved = localStorage.getItem('compliance_checks');
      if (saved) {
        setChecks(JSON.parse(saved));
      } else {
        setChecks(defaultChecks.map(c => ({
          ...c,
          status: 'pending' as const,
          notes: '',
        })));
      }
    } catch (err) {
      console.error('Failed to load checks:', err);
      setChecks(defaultChecks.map(c => ({
        ...c,
        status: 'pending' as const,
        notes: '',
      })));
    }
    setIsLoading(false);
  };

  const updateCheck = (id: string, updates: Partial<ComplianceCheck>) => {
    setChecks(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, lastChecked: new Date().toISOString() } 
        : c
    ));
  };

  const saveChecks = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('compliance_checks', JSON.stringify(checks));
      toast.success("Compliance checklist saved");
    } catch (err) {
      toast.error("Failed to save");
    }
    setIsSaving(false);
  };

  const exportToCSV = () => {
    const headers = ['Category', 'Check', 'Status', 'Notes', 'Last Checked'];
    const rows = checks.map(c => [
      c.category,
      c.name,
      c.status,
      c.notes.replace(/"/g, '""'),
      c.lastChecked ? format(new Date(c.lastChecked), 'yyyy-MM-dd HH:mm') : '',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-checklist-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported");
  };

  const resetChecks = () => {
    if (confirm('Reset all checks to pending?')) {
      setChecks(defaultChecks.map(c => ({
        ...c,
        status: 'pending' as const,
        notes: '',
      })));
      localStorage.removeItem('compliance_checks');
      toast.success("Checklist reset");
    }
  };

  // Calculate progress
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const pendingCount = checks.filter(c => c.status === 'pending').length;
  const progress = checks.length > 0 ? (passCount / checks.length) * 100 : 0;

  // Group by category
  const categories = [...new Set(checks.map(c => c.category))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Legal Pages': return FileText;
      case 'Disclosures': return Eye;
      case 'Consent': return Shield;
      case 'No Payments': return Lock;
      case 'Tracking': return LinkIcon;
      case 'Support': return ExternalLink;
      default: return ClipboardCheck;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Compliance Checklist – Admin" description="Partner-readiness verification checklist" noIndex />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/admin" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-3 h-3" />
              Admin
            </Link>
            <span>/</span>
            <span className="text-foreground">Compliance</span>
          </div>
          
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
              Compliance Checklist
            </h1>
            <p className="text-muted-foreground">
              Partner-readiness verification for Duffel, CJ, Travelpayouts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetChecks}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" onClick={saveChecks} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{Math.round(progress)}% Complete</p>
                <p className="text-sm text-muted-foreground">
                  {passCount} passed, {failCount} failed, {pendingCount} pending
                </p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">{passCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-medium">{failCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">{pendingCount}</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Checklist by Category */}
        <div className="space-y-6">
          {categories.map(category => {
            const categoryChecks = checks.filter(c => c.category === category);
            const CategoryIcon = getCategoryIcon(category);
            const categoryPass = categoryChecks.filter(c => c.status === 'pass').length;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CategoryIcon className="w-5 h-5 text-primary" />
                    {category}
                    <Badge variant="outline" className="ml-auto">
                      {categoryPass}/{categoryChecks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryChecks.map(check => (
                    <div 
                      key={check.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        check.status === 'pass' ? 'bg-emerald-500/5 border-emerald-500/30' :
                        check.status === 'fail' ? 'bg-destructive/5 border-destructive/30' :
                        'bg-muted/30 border-border/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Buttons */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${check.status === 'pass' ? 'text-emerald-500 bg-emerald-500/10' : ''}`}
                            onClick={() => updateCheck(check.id, { status: 'pass' })}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${check.status === 'fail' ? 'text-destructive bg-destructive/10' : ''}`}
                            onClick={() => updateCheck(check.id, { status: 'fail' })}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{check.name}</p>
                            {check.lastChecked && (
                              <p className="text-xs text-muted-foreground">
                                Checked: {format(new Date(check.lastChecked), 'MMM d, HH:mm')}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          <Textarea
                            placeholder="Add notes..."
                            value={check.notes}
                            onChange={(e) => updateCheck(check.id, { notes: e.target.value })}
                            className="h-16 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  </main>
  <Footer />
</div>
  );
}

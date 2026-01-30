import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  BookOpen,
  CreditCard,
  Shield,
  Plane,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Plus,
  Trash2,
  Camera,
  Globe,
  Lock,
  Sparkles
} from "lucide-react";
import { format, addMonths, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  type: 'passport' | 'visa' | 'insurance' | 'vaccination' | 'license' | 'other';
  name: string;
  number?: string;
  issueCountry?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  fileUrl?: string;
}

interface TravelDocumentsProps {
  className?: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    type: 'passport',
    name: 'United States Passport',
    number: 'P12345678',
    issueCountry: 'United States',
    issueDate: new Date('2020-03-15'),
    expiryDate: new Date('2030-03-14'),
    status: 'valid'
  },
  {
    id: '2',
    type: 'visa',
    name: 'UK Tourist Visa',
    number: 'VIS-987654',
    issueCountry: 'United Kingdom',
    issueDate: new Date('2025-01-10'),
    expiryDate: addMonths(new Date(), 2),
    status: 'expiring'
  },
  {
    id: '3',
    type: 'insurance',
    name: 'World Nomads Travel Insurance',
    number: 'INS-2025-001',
    expiryDate: addMonths(new Date(), 6),
    status: 'valid'
  },
  {
    id: '4',
    type: 'vaccination',
    name: 'COVID-19 Vaccination Card',
    status: 'valid'
  },
];

const getDocTypeIcon = (type: string) => {
  switch (type) {
    case 'passport': return BookOpen;
    case 'visa': return Globe;
    case 'insurance': return Shield;
    case 'vaccination': return Plus;
    case 'license': return CreditCard;
    default: return FileText;
  }
};

const getDocTypeColor = (type: string) => {
  switch (type) {
    case 'passport': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'visa': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'insurance': return 'bg-violet-500/20 text-violet-400 border-violet-500/40';
    case 'vaccination': return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
    case 'license': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusBadge = (status: string, expiryDate?: Date) => {
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, new Date()) : null;
  
  switch (status) {
    case 'valid':
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    case 'expiring':
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          Expires in {daysUntilExpiry} days
        </Badge>
      );
    case 'expired':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
          <AlertCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/40">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </Badge>
      );
    default:
      return null;
  }
};

export const TravelDocuments = ({ className }: TravelDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const validCount = documents.filter(d => d.status === 'valid').length;
  const expiringCount = documents.filter(d => d.status === 'expiring').length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;

  const filteredDocs = documents.filter(doc => {
    if (activeTab === 'all') return true;
    return doc.type === activeTab;
  });

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success("Document uploaded successfully!");
    }, 1500);
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.success("Document removed");
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Travel Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Securely store your passports, visas, and travel essentials
              </p>
            </div>
          </div>

          <Button className="gap-2" onClick={handleUpload}>
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Stats Bar */}
        <div className="flex items-center gap-6 p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm">{validCount} Valid</span>
          </div>
          {expiringCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-amber-400">{expiringCount} Expiring Soon</span>
            </div>
          )}
          {expiredCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-red-400">{expiredCount} Expired</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Encrypted & Secure
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 px-4">
            <TabsList className="bg-transparent h-auto p-0">
              {[
                { value: 'all', label: 'All' },
                { value: 'passport', label: 'Passports' },
                { value: 'visa', label: 'Visas' },
                { value: 'insurance', label: 'Insurance' },
                { value: 'vaccination', label: 'Health' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-4">
            <div className="grid gap-4">
              {filteredDocs.map((doc, i) => {
                const Icon = getDocTypeIcon(doc.type);
                const isSelected = selectedDoc === doc.id;
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedDoc(isSelected ? null : doc.id)}
                    className={cn(
                      "rounded-xl border p-4 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border/50 hover:border-border bg-card/30"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0",
                        getDocTypeColor(doc.type)
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{doc.name}</h4>
                            {doc.number && (
                              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                                {doc.number}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(doc.status, doc.expiryDate)}
                        </div>

                        {/* Expiry Info */}
                        {doc.expiryDate && (
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Expires: {format(doc.expiryDate, 'MMM d, yyyy')}</span>
                            </div>
                            {doc.issueCountry && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="w-4 h-4" />
                                <span>{doc.issueCountry}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Validity Progress */}
                        {doc.issueDate && doc.expiryDate && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Issued: {format(doc.issueDate, 'MMM yyyy')}</span>
                              <span>Expires: {format(doc.expiryDate, 'MMM yyyy')}</span>
                            </div>
                            <Progress 
                              value={
                                (differenceInDays(new Date(), doc.issueDate) / 
                                differenceInDays(doc.expiryDate, doc.issueDate)) * 100
                              }
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add New Document */}
            <button
              onClick={handleUpload}
              className="w-full mt-4 p-6 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>
              <span className="font-medium">
                {uploading ? "Uploading..." : "Scan or Upload Document"}
              </span>
              <span className="text-xs">Supports PDF, JPG, PNG</span>
            </button>

            {/* Tips */}
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-400 mb-1">Document Tips</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Keep passports valid for 6+ months before travel</li>
                    <li>• Download copies for offline access</li>
                    <li>• Set expiry reminders for important documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TravelDocuments;

/**
 * Owner Document Upload Component
 * Handles document uploads for owner verification
 */

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import type { CarOwnerDocumentType, CarOwnerDocument } from "@/types/p2p";
import { toast } from "sonner";

interface DocumentConfig {
  type: CarOwnerDocumentType;
  label: string;
  description: string;
  accept: string;
}

const documentConfigs: DocumentConfig[] = [
  {
    type: "drivers_license",
    label: "Driver's License",
    description: "Front of your valid driver's license",
    accept: "image/*,.pdf",
  },
  {
    type: "id_card",
    label: "ID Card / Proof of Address",
    description: "Government ID or utility bill (last 3 months)",
    accept: "image/*,.pdf",
  },
  {
    type: "insurance",
    label: "Insurance Certificate",
    description: "Your vehicle insurance document (if using own insurance)",
    accept: "image/*,.pdf",
  },
];

interface OwnerDocumentUploadProps {
  existingDocuments: CarOwnerDocument[];
  onUpload: (type: CarOwnerDocumentType, file: File) => Promise<void>;
  uploading?: CarOwnerDocumentType | null;
  showInsurance?: boolean;
}

export default function OwnerDocumentUpload({ 
  existingDocuments, 
  onUpload,
  uploading,
  showInsurance = true,
}: OwnerDocumentUploadProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleFileSelect = useCallback(async (type: CarOwnerDocumentType, file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [type]: preview }));
    }

    await onUpload(type, file);
  }, [onUpload]);

  const getDocumentStatus = (type: CarOwnerDocumentType) => {
    const doc = existingDocuments.find(d => d.document_type === type);
    return doc?.status || null;
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const configs = showInsurance 
    ? documentConfigs 
    : documentConfigs.filter(c => c.type !== "insurance");

  return (
    <div className="space-y-4">
      {configs.map((config) => {
        const status = getDocumentStatus(config.type);
        const existingDoc = existingDocuments.find(d => d.document_type === config.type);
        const preview = previews[config.type] || (existingDoc?.file_url);
        const isUploading = uploading === config.type;

        return (
          <Card key={config.type} className={`transition-all ${status === "approved" ? "border-emerald-500/30" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview or Upload Area */}
                <div className="relative">
                  <label 
                    htmlFor={`file-${config.type}`}
                    className={`
                      w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center
                      cursor-pointer transition-colors overflow-hidden
                      ${status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"}
                    `}
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : preview ? (
                      preview.includes(".pdf") ? (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </div>
                    )}
                  </label>
                  <input
                    id={`file-${config.type}`}
                    type="file"
                    accept={config.accept}
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(config.type, file);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{config.label}</h4>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
                  
                  {existingDoc && (
                    <p className="text-xs text-muted-foreground truncate">
                      {existingDoc.file_name}
                    </p>
                  )}
                  
                  {status === "rejected" && (
                    <p className="text-xs text-destructive mt-1">
                      Please upload a new document
                    </p>
                  )}
                </div>

                {/* Status Indicator */}
                {status && (
                  <div className={`
                    text-xs px-2 py-1 rounded-full
                    ${status === "approved" ? "bg-emerald-500/10 text-emerald-600" : ""}
                    ${status === "pending" ? "bg-amber-500/10 text-amber-600" : ""}
                    ${status === "rejected" ? "bg-destructive/10 text-destructive" : ""}
                  `}>
                    {status === "approved" && "Approved"}
                    {status === "pending" && "Pending"}
                    {status === "rejected" && "Rejected"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

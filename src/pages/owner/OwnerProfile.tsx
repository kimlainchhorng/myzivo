/**
 * Owner Profile Page
 * Profile settings and document management for car owners
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile, useOwnerDocuments, useUploadOwnerDocument } from "@/hooks/useCarOwner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Shield, 
  FileText, Loader2, AlertCircle
} from "lucide-react";
import ZivoLogo from "@/components/ZivoLogo";
import OwnerStatusBadge from "@/components/owner/OwnerStatusBadge";
import OwnerDocumentUpload from "@/components/owner/OwnerDocumentUpload";
import type { CarOwnerDocumentType } from "@/types/p2p";
import { useState } from "react";

export default function OwnerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useCarOwnerProfile();
  const { data: documents = [] } = useOwnerDocuments(profile?.id);
  const uploadDocument = useUploadOwnerDocument();
  const [uploadingDoc, setUploadingDoc] = useState<CarOwnerDocumentType | null>(null);

  const handleDocumentUpload = async (type: CarOwnerDocumentType, file: File) => {
    if (!profile) return;
    
    setUploadingDoc(type);
    try {
      await uploadDocument.mutateAsync({
        ownerId: profile.id,
        documentType: type,
        file,
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>
              You need to complete the host application first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/owner/apply")}>
              Apply to Become a Host
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not provided";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const insuranceLabels = {
    platform: "ZIVO Platform Insurance",
    own: "Own Insurance",
    none: "No Insurance",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/owner/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <ZivoLogo size="sm" />
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Profile</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold mb-2">{profile.full_name}</h1>
            <OwnerStatusBadge status={profile.status} />
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{profile.email || user?.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{profile.phone || "Not provided"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Date of Birth</div>
                  <div className="font-medium">{formatDate(profile.date_of_birth)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">
                    {profile.address ? (
                      <>
                        {profile.address}<br />
                        {profile.city}, {profile.state} {profile.zip_code}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Insurance & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Insurance Option</div>
                <div className="font-medium">
                  {profile.insurance_option ? insuranceLabels[profile.insurance_option] : "Not selected"}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">SSN (Last 4)</div>
                <div className="font-medium">
                  {profile.ssn_last_four ? `••••${profile.ssn_last_four}` : "Not provided"}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Documents Status</div>
                <div className={`font-medium ${profile.documents_verified ? "text-emerald-600" : "text-amber-600"}`}>
                  {profile.documents_verified ? "Verified" : "Pending Verification"}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payout Status</div>
                <div className={`font-medium ${profile.payout_enabled ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {profile.payout_enabled ? "Enabled" : "Not Set Up"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Upload or update your verification documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OwnerDocumentUpload
              existingDocuments={documents}
              onUpload={handleDocumentUpload}
              uploading={uploadingDoc}
              showInsurance={profile.insurance_option === "own"}
            />
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{profile.total_trips || 0}</div>
                <div className="text-sm text-muted-foreground">Total Trips</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {profile.rating ? profile.rating.toFixed(1) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {profile.response_rate ? `${profile.response_rate}%` : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Response Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Since */}
        <div className="text-center text-sm text-muted-foreground pb-6">
          Member since {formatDate(profile.created_at || null)}
        </div>
      </main>
    </div>
  );
}

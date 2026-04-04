import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode, Share2, Copy, Download, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getPublicOrigin, getProfileShareUrl } from "@/lib/getPublicOrigin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function QRProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-code");
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; share_code: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, avatar_url, share_code").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user]);

  const profileUrl = profile?.share_code ? getProfileShareUrl(profile.share_code) : `${getPublicOrigin()}/profile`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.querySelector("#qr-code svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement("a");
      link.download = "my-qr-code.png";
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/more")}><ArrowLeft className="h-5 w-5" /></Button>
          <QrCode className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">QR Profile</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="my-code" className="flex-1 gap-1"><QrCode className="h-3 w-3" /> My Code</TabsTrigger>
          <TabsTrigger value="scan" className="flex-1 gap-1"><Camera className="h-3 w-3" /> Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="my-code" className="mt-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <Card className="p-8 mb-6" id="qr-code">
              <QRCodeSVG value={profileUrl} size={200} level="H"
                bgColor="transparent" fgColor="hsl(var(--foreground))"
                imageSettings={{ src: "", height: 0, width: 0, excavate: false }} />
            </Card>

            <p className="text-sm text-muted-foreground mb-4 text-center">Scan this code to view my profile</p>

            <div className="w-full space-y-3">
              <Card className="p-3 flex items-center gap-2">
                <Input value={profileUrl} readOnly className="text-xs flex-1" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </Card>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={downloadQR}>
                  <Download className="h-4 w-4" /> Save QR
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                  const name = profile?.full_name || user?.email?.split("@")[0] || "User";
                  if (navigator.share) navigator.share({ title: `${name} on ZIVO`, text: `Check out ${name}'s profile on ZIVO`, url: profileUrl });
                  else copyLink();
                }}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="scan" className="mt-6">
          <div className="flex flex-col items-center py-16">
            <div className="h-48 w-48 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center mb-4">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Camera access required to scan QR codes
            </p>
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" /> Enable Camera
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

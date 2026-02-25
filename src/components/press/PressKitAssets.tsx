/**
 * Press Kit Assets Component
 * Downloadable brand assets and company information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Palette,
  Image,
  FileText,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const brandColors = [
  { name: "Primary Teal", hex: "#38BDF8", hsl: "hsl(198, 93%, 59%)", usage: "Primary brand color" },
  { name: "Flights Blue", hex: "#0EA5E9", hsl: "hsl(199, 89%, 48%)", usage: "Flight-related elements" },
  { name: "Hotels Amber", hex: "#F59E0B", hsl: "hsl(38, 92%, 50%)", usage: "Hotel-related elements" },
  { name: "Cars Violet", hex: "#8B5CF6", hsl: "hsl(263, 70%, 58%)", usage: "Car rental elements" },
  { name: "Rides Rose", hex: "#EC4899", hsl: "hsl(340, 75%, 55%)", usage: "Ride services" },
  { name: "Eats Orange", hex: "#F97316", hsl: "hsl(25, 95%, 53%)", usage: "Food delivery" },
];

const boilerplates = {
  short: "ZIVO is a global travel search platform helping travelers compare flights, hotels, and car rentals from trusted partners worldwide.",
  medium: "ZIVO is a global travel search and comparison platform that helps travelers find and compare flights, hotels, car rentals, and travel services from trusted partners worldwide. Founded in 2024, ZIVO is building a unified travel and mobility ecosystem powered by AI.",
  long: "ZIVO is a global travel search and comparison platform that helps travelers find and compare flights, hotels, car rentals, and travel services from trusted partners worldwide. Founded in 2024 and headquartered in the United States, ZIVO is building a unified travel and mobility ecosystem that combines global travel (flights, hotels, cars) with local mobility services (rides, food delivery, logistics). The platform features AI-powered personalization, transparent pricing with no hidden fees, and a commission-based business model that ensures users always pay partner prices."
};

const PressKitAssets = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Logo Downloads */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Logo Downloads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-background border border-border/50 text-center">
              <div className="w-32 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="font-bold text-xl text-primary">ZIVO</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Primary Logo (Light BG)</p>
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
            <div className="p-6 rounded-xl bg-slate-900 border border-border/50 text-center">
              <div className="w-32 h-12 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="font-bold text-xl text-white">ZIVO</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">White Logo (Dark BG)</p>
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Logo usage guidelines: Maintain clear space equal to the height of the "Z". 
            Do not stretch, rotate, or alter colors.
          </p>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandColors.map((color) => (
              <div key={color.name} className="p-4 rounded-xl border border-border/50">
                <div 
                  className="w-full h-16 rounded-lg mb-3" 
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-medium text-sm">{color.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">{color.hex}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(color.hex, color.name)}
                  >
                    {copiedId === color.name ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{color.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Screenshots */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Product Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {["Homepage", "Flight Search", "Hotel Results", "Mobile App"].map((screen) => (
              <div key={screen} className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-2">{screen}</p>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Boilerplate */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Company Boilerplate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(boilerplates).map(([key, text]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="capitalize">{key} ({text.split(' ').length} words)</Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(text, key)}
                >
                  {copiedId === key ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                {text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Company Facts */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-medium">2024</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Headquarters</span>
              <span className="font-medium">United States</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium">Travel Technology</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Website</span>
              <span className="font-medium">hizivo.com</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Services</span>
              <span className="font-medium">6 Verticals</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Press Contact</span>
              <span className="font-medium">press@hizivo.com</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PressKitAssets;

/**
 * AiCreativeSuite — Merchant AI Video/Music Generator
 * Upload product image → Select mood → Generate suggested Reel
 */
import { useState, useRef } from "react";
import { ArrowLeft, Upload, Sparkles, Music, Film, Image, Wand2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Mood = "energetic" | "luxury" | "local";

const MOODS: { id: Mood; label: string; emoji: string; description: string; color: string }[] = [
  { id: "energetic", label: "Energetic", emoji: "⚡", description: "Upbeat, fast-paced, vibrant colors", color: "from-orange-500 to-red-500" },
  { id: "luxury", label: "Luxury", emoji: "✨", description: "Elegant, slow-motion, gold accents", color: "from-amber-500 to-yellow-600" },
  { id: "local", label: "Local", emoji: "🌿", description: "Warm, authentic, community feel", color: "from-emerald-500 to-teal-600" },
];

const MUSIC_SUGGESTIONS: Record<Mood, string[]> = {
  energetic: ["Upbeat Pop", "Electronic Dance", "Hip Hop Beat", "Tropical House"],
  luxury: ["Ambient Piano", "Jazz Lounge", "Classical Strings", "Cinematic"],
  local: ["Acoustic Guitar", "World Music", "Folk Melody", "Nature Sounds"],
};

const TEXT_OVERLAYS: Record<Mood, string[]> = {
  energetic: ["🔥 HOT DEALS", "LIMITED TIME", "DON'T MISS OUT!", "SHOP NOW →"],
  luxury: ["Premium Collection", "Exclusively Yours", "Crafted with Care", "Discover More"],
  local: ["Made with Love ❤️", "Support Local", "Fresh & Authentic", "From Our Family"],
};

export default function AiCreativeSuite() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setGeneratedPreview(false);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedMood) {
      toast.error("Please upload an image and select a mood");
      return;
    }
    setIsGenerating(true);
    // Simulate AI generation (in production, this would call the AI Creative edge function)
    await new Promise(r => setTimeout(r, 3000));
    setGeneratedPreview(true);
    setIsGenerating(false);
    toast.success("Reel preview generated!");
  };

  const mood = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Creative Suite
            </h1>
            <p className="text-xs text-muted-foreground">Generate professional Reels for your shop</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Step 1: Upload Image */}
        <Card className="rounded-2xl border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              Step 1: Upload Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={selectedImage} alt="Product" className="w-full h-48 object-cover" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-background/90 backdrop-blur text-xs font-medium border border-border/40"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tap to upload your product photo</p>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Mood */}
        <Card className="rounded-2xl border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Step 2: Select Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map(m => (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedMood(m.id); setGeneratedPreview(false); }}
                  className={`rounded-2xl p-3 text-center border-2 transition-all ${
                    selectedMood === m.id ? "border-primary bg-primary/5" : "border-border/40 bg-card"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <p className="text-xs font-bold mt-1">{m.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.description}</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!selectedImage || !selectedMood || isGenerating}
          className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-lg"
        >
          <Wand2 className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "AI is creating your Reel..." : "Generate Suggested Reel"}
        </Button>

        {/* Generated Preview */}
        <AnimatePresence>
          {generatedPreview && mood && selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="rounded-2xl border-2 border-primary/30 overflow-hidden">
                <div className="relative">
                  <img src={selectedImage!} alt="Preview" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Text Overlays */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs px-3 py-1 rounded-full text-white font-bold bg-gradient-to-r ${mood.color}`}>
                      {TEXT_OVERLAYS[selectedMood][0]}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-lg font-bold drop-shadow-lg">
                      {TEXT_OVERLAYS[selectedMood][2]}
                    </p>
                    <p className="text-white/80 text-xs mt-1">
                      {TEXT_OVERLAYS[selectedMood][3]}
                    </p>
                  </div>

                  {/* Music indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
                    <Music className="h-3 w-3 text-white" />
                    <span className="text-[10px] text-white font-medium">
                      {MUSIC_SUGGESTIONS[selectedMood][0]}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Suggested Reel Preview</p>
                      <p className="text-xs text-muted-foreground">{mood.label} mood · 15s · Auto-generated</p>
                    </div>
                    <Film className="h-5 w-5 text-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggested Music</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {MUSIC_SUGGESTIONS[selectedMood].map(track => (
                        <span key={track} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{track}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Text Overlays</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {TEXT_OVERLAYS[selectedMood].map(text => (
                        <span key={text} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{text}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 rounded-xl gap-1.5" onClick={() => toast.info("Download coming soon")}>
                      <Download className="h-4 w-4" /> Save Draft
                    </Button>
                    <Button className="flex-1 rounded-xl gap-1.5" onClick={() => { navigate("/create-post"); toast.success("Opening Reel editor..."); }}>
                      <Film className="h-4 w-4" /> Post as Reel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * CreatePostModal — Facebook-style "Create Post" modal
 * Extracted as a shared component for use in Feed and Profile pages
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X as XIcon, Globe, Users, Lock, FolderPlus, MapPin, Hash,
  ChevronDown, Image as ImageIcon, Play, Film, Radio, Plus, Search, Share2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostModalProps {
  userId: string;
  userProfile: { name: string; avatar: string | null } | null;
  onClose: () => void;
  onCreated: () => void;
  initialCaption?: string;
  sharedMediaUrl?: string;
  sharedMediaType?: "image" | "video";
  sharedPostId?: string;
  sharedPostAuthorId?: string;
  sharedPostAuthorName?: string;
}

export default function CreatePostModal({
  userId,
  userProfile,
  onClose,
  onCreated,
  initialCaption,
  sharedMediaUrl,
  sharedMediaType,
  sharedPostId,
  sharedPostAuthorId,
  sharedPostAuthorName,
}: CreatePostModalProps) {
  const [caption, setCaption] = useState(initialCaption || "");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(sharedMediaUrl ? [sharedMediaUrl] : []);
  const [mediaType, setMediaType] = useState<"image" | "video">(sharedMediaType || "image");
  const [selectedType, setSelectedType] = useState<"Photo" | "Video" | "Reel" | "Live" | null>(null);
  const [visibility, setVisibility] = useState<"everyone" | "friends" | "onlyme">("everyone");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [album, setAlbum] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [location, setLocation] = useState<string | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<{ id: string; name: string }[]>([]);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagResults, setTagResults] = useState<any[]>([]);
  const [tagSearching, setTagSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const tagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const FILTERS = [
    { name: "Original", css: "none" },
    { name: "Vivid", css: "saturate(1.75) contrast(1.08)" },
    { name: "Warm", css: "sepia(0.3) saturate(1.35) brightness(1.04)" },
    { name: "Cool", css: "saturate(0.85) hue-rotate(18deg) brightness(1.06)" },
    { name: "B&W", css: "grayscale(1) contrast(1.2)" },
    { name: "Vintage", css: "sepia(0.28) saturate(1.08) contrast(0.94) brightness(1.08)" },
    { name: "Dreamy", css: "brightness(1.15) saturate(0.72) contrast(0.84)" },
    { name: "Noir", css: "grayscale(0.9) contrast(1.35) brightness(0.88)" },
  ];

  const LOCATIONS = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Miami, FL",
    "San Francisco, CA", "Las Vegas, NV", "Seattle, WA", "Austin, TX",
    "Denver, CO", "Nashville, TN", "Portland, OR", "Boston, MA",
  ];
  const filteredLocations = locationQuery
    ? LOCATIONS.filter((l) => l.toLowerCase().includes(locationQuery.toLowerCase()))
    : LOCATIONS;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const newFiles = [...files, ...selected].slice(0, 10);
    setFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach((p) => { if (p.startsWith("blob:")) URL.revokeObjectURL(p); });
      return newPreviews;
    });
    if (selected[0].type.startsWith("video")) setMediaType("video");
  };

  const removeMedia = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (previews[index]?.startsWith("blob:")) URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (currentPreview >= newFiles.length) setCurrentPreview(Math.max(0, newFiles.length - 1));
  };

  const handleTagSearch = (q: string) => {
    setTagQuery(q);
    if (tagTimerRef.current) clearTimeout(tagTimerRef.current);
    if (!q.trim()) { setTagResults([]); return; }
    setTagSearching(true);
    tagTimerRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${q}%`)
        .limit(8);
      setTagResults(data || []);
      setTagSearching(false);
    }, 300);
  };

  const handleCaptionChange = (text: string) => {
    setCaption(text);
    const lastWord = text.split(/\s/).pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      handleTagSearch(lastWord.slice(1));
      setShowTagSearch(true);
    } else {
      setShowTagSearch(false);
    }
  };

  const insertMention = (user: any) => {
    const words = caption.split(/\s/);
    words[words.length - 1] = `@${user.full_name} `;
    setCaption(words.join(" "));
    setShowTagSearch(false);
    if (!taggedUsers.find((t) => t.id === user.id)) {
      setTaggedUsers((prev) => [...prev, { id: user.id, name: user.full_name }]);
    }
  };

  const hasSharedLink = !!initialCaption || !!sharedMediaUrl;

  const handlePost = async () => {
    if (files.length === 0 && !hasSharedLink && !caption.trim()) {
      toast.error("Please add a photo, video, or write something");
      return;
    }
    setUploading(true);
    try {
      let mediaUrl: string | null = null;
      let finalMediaType = mediaType;

      if (files.length > 0) {
        const file = files[0];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("user-posts")
          .upload(path, file, { contentType: file.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("user-posts").getPublicUrl(path);
        mediaUrl = urlData.publicUrl;
      } else if (sharedMediaUrl) {
        mediaUrl = sharedMediaUrl;
        finalMediaType = sharedMediaType || "image";
      } else {
        finalMediaType = "image";
      }

      const insertData: any = {
        user_id: userId,
        media_type: finalMediaType,
        media_url: mediaUrl,
        caption: caption.trim() || null,
        filter_css: FILTERS[activeFilter]?.css || null,
        is_published: true,
      };
      if (location) insertData.location = location;
      if (sharedPostId) insertData.shared_from_post_id = sharedPostId;
      if (sharedPostAuthorId) insertData.shared_from_user_id = sharedPostAuthorId;

      const { error: insertErr } = await (supabase as any).from("user_posts").insert(insertData);
      if (insertErr) throw insertErr;

      toast.success("Post shared! 🎉");
      onCreated();
    } catch (err: any) {
      console.error("[CreatePost]", err);
      toast.error(err.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-auto pb-20 z-[60]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <button onClick={onClose} className="text-muted-foreground">
            <XIcon className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-foreground">Create Post</h2>
          <button
            onClick={handlePost}
            disabled={(files.length === 0 && !hasSharedLink && !caption.trim()) || uploading}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
              (files.length > 0 || caption.trim() || hasSharedLink) && !uploading
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Share"}
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border/30">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-sm font-bold">
                {userProfile?.name?.[0] || "?"}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{userProfile?.name || "You"}</p>
            {location && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" /> {location}
              </p>
            )}
          </div>
        </div>

        {/* Privacy & extras row */}
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          {/* Visibility dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-xs font-medium text-foreground min-h-[36px]"
            >
              {visibility === "everyone" && <Globe className="h-3.5 w-3.5 text-primary" />}
              {visibility === "friends" && <Users className="h-3.5 w-3.5 text-primary" />}
              {visibility === "onlyme" && <Lock className="h-3.5 w-3.5 text-primary" />}
              <span>{visibility === "everyone" ? "Everyone" : visibility === "friends" ? "Friends" : "Only me"}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {showVisibilityMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-card border border-border/40 rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  {([
                    { value: "everyone" as const, label: "Everyone", icon: Globe },
                    { value: "friends" as const, label: "Friends", icon: Users },
                    { value: "onlyme" as const, label: "Only me", icon: Lock },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setVisibility(opt.value); setShowVisibilityMenu(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors",
                        visibility === opt.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                      {visibility === opt.value && <span className="ml-auto text-primary">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Album button */}
          <button
            onClick={() => {
              const name = prompt("Album name:");
              if (name?.trim()) setAlbum(name.trim());
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium min-h-[36px]",
              album
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/50"
            )}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            {album || "Album"}
          </button>

          {/* Location tag */}
          <button
            onClick={() => setShowLocationSearch(!showLocationSearch)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium min-h-[36px]",
              location
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/50"
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            {location || "Location"}
          </button>

          {/* Tag people */}
          <button
            onClick={() => { setShowTagSearch(true); setTagQuery(""); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium min-h-[36px]",
              taggedUsers.length > 0
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/50"
            )}
          >
            <Hash className="h-3.5 w-3.5" />
            {taggedUsers.length > 0 ? `${taggedUsers.length} tagged` : "Tag"}
          </button>
        </div>

        {/* Location search dropdown */}
        <AnimatePresence>
          {showLocationSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mx-4 mb-2"
            >
              <div className="bg-muted/30 rounded-xl border border-border/20 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                    autoFocus
                  />
                  {location && (
                    <button onClick={() => { setLocation(null); setShowLocationSearch(false); }} className="text-xs text-destructive">Clear</button>
                  )}
                </div>
                <div className="max-h-[120px] overflow-y-auto space-y-0.5">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocation(loc); setShowLocationSearch(false); setLocationQuery(""); }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors",
                        location === loc ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <MapPin className="h-3 w-3 inline mr-1.5 text-muted-foreground" />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagged users */}
        {taggedUsers.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {taggedUsers.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                @{t.name}
                <button onClick={() => setTaggedUsers((prev) => prev.filter((u) => u.id !== t.id))}>
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Caption with @mention autocomplete */}
        <div className="px-4 relative">
          <textarea
            placeholder="Write a caption... Use @ to tag people"
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            maxLength={2200}
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <AnimatePresence>
            {showTagSearch && tagResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 bottom-full mb-1 bg-card border border-border/40 rounded-xl shadow-lg z-20 max-h-[160px] overflow-y-auto"
              >
                {tagResults.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => insertMention(u)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-muted overflow-hidden">
                      {u.avatar_url ? <img src={u.avatar_url} className="h-full w-full object-cover" alt="" /> :
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">{(u.full_name || "?")[0]}</div>}
                    </div>
                    <span className="text-xs font-medium text-foreground">{u.full_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Media carousel preview */}
        {previews.length > 0 && (
          <div className="relative mx-4 mb-3 rounded-xl overflow-hidden bg-black aspect-square">
            {mediaType === "video" ? (
              <video
                src={previews[currentPreview]}
                className="h-full w-full object-cover"
                style={{ filter: FILTERS[activeFilter]?.css || "none" }}
                controls
                muted
              />
            ) : (
              <img
                src={previews[currentPreview]}
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: FILTERS[activeFilter]?.css || "none" }}
              />
            )}

            {previews.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {previews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPreview(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentPreview ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}

            {previews.length > 1 && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-[10px] font-bold text-white">
                {currentPreview + 1}/{previews.length}
              </div>
            )}

            {files.length > 0 && (
              <button
                onClick={() => removeMedia(currentPreview)}
                className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center"
              >
                <XIcon className="h-4 w-4 text-white" />
              </button>
            )}

            {sharedMediaUrl && files.length === 0 && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Share2 className="h-3 w-3" /> Shared
              </div>
            )}
          </div>
        )}

        {/* Filter strip */}
        {previews.length > 0 && mediaType === "image" && (
          <div className="px-4 pb-3">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Filter</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTERS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setActiveFilter(i)}
                  className="shrink-0 flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-lg overflow-hidden border-2 transition-all",
                      activeFilter === i ? "border-primary scale-105" : "border-transparent"
                    )}
                  >
                    <img
                      src={previews[0]}
                      alt={f.name}
                      className="h-full w-full object-cover"
                      style={{ filter: f.css }}
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium",
                    activeFilter === i ? "text-primary" : "text-muted-foreground"
                  )}>
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Media type selector — bottom toolbar */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-3">
          {[
            { label: "Photo", icon: ImageIcon, accept: "image/*" },
            { label: "Video", icon: Play, accept: "video/*" },
            { label: "Reel", icon: Film, accept: "video/*" },
            { label: "Live", icon: Radio, accept: "" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                if (opt.label === "Live") {
                  toast.info("Live is coming soon!");
                  return;
                }
                setSelectedType(opt.label as any);
                if (fileRef.current) {
                  fileRef.current.accept = opt.accept;
                  fileRef.current.multiple = opt.label === "Photo";
                  fileRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
            >
              <opt.icon className={cn(
                "h-5 w-5 transition-colors",
                selectedType === opt.label ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                selectedType === opt.label ? "text-primary" : "text-muted-foreground"
              )}>
                {opt.label}
              </span>
            </button>
          ))}

          {files.length > 0 && files.length < 10 && (
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "image/*";
                  fileRef.current.multiple = true;
                  fileRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center ml-auto"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium text-primary">Add</span>
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </motion.div>
    </motion.div>
  );
}

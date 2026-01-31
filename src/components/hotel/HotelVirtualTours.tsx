import { Play, Pause, Maximize2, Volume2, VolumeX, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tours = [
  {
    id: 1,
    hotel: "Grand Luxury Resort",
    location: "Maldives",
    thumbnail: "🏝️",
    duration: "3:45",
    views: "12.5K",
    features: ["Overwater Villa", "Private Pool", "Ocean View"],
  },
  {
    id: 2,
    hotel: "Alpine Chalet",
    location: "Swiss Alps",
    thumbnail: "🏔️",
    duration: "4:20",
    views: "8.2K",
    features: ["Mountain View", "Fireplace", "Ski Access"],
  },
  {
    id: 3,
    hotel: "Desert Oasis Palace",
    location: "Dubai",
    thumbnail: "🏜️",
    duration: "5:10",
    views: "15.8K",
    features: ["Royal Suite", "Butler Service", "Desert View"],
  },
  {
    id: 4,
    hotel: "Tropical Paradise",
    location: "Bali",
    thumbnail: "🌴",
    duration: "3:55",
    views: "10.3K",
    features: ["Infinity Pool", "Jungle View", "Spa Villa"],
  },
];

const HotelVirtualTours = () => {
  const [activeTour, setActiveTour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Virtual Experience
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
            360° <span className="text-primary">Virtual Tours</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore hotels before you book with immersive virtual walkthroughs
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 aspect-video">
                {/* Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[120px]">{tours[activeTour].thumbnail}</span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full w-12 h-12 bg-white/20 backdrop-blur hover:bg-white/30"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </Button>

                    {/* Progress Bar */}
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full" />
                    </div>

                    <span className="text-sm text-white/80">{tours[activeTour].duration}</span>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-white/80 hover:text-white"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-white/80 hover:text-white"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* VR Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  360° VR Tour
                </div>

                {/* Views */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {tours[activeTour].views} views
                </div>
              </div>

              {/* Tour Info */}
              <div className="mt-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{tours[activeTour].hotel}</h3>
                    <p className="text-muted-foreground">{tours[activeTour].location}</p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Book This Hotel
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {tours[activeTour].features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tour List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Available Tours
              </h3>
              {tours.map((tour, index) => (
                <button
                  key={tour.id}
                  onClick={() => setActiveTour(index)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                    activeTour === index
                      ? "bg-primary/10 border border-primary"
                      : "bg-card/50 border border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                    {tour.thumbnail}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium line-clamp-1">{tour.hotel}</h4>
                    <p className="text-sm text-muted-foreground">{tour.location}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{tour.duration}</span>
                      <span>•</span>
                      <span>{tour.views} views</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelVirtualTours;

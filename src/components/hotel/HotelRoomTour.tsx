import { useState } from "react";
import { Play, Pause, RotateCcw, Maximize2, Volume2, VolumeX, Eye, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roomTypes = [
  { id: "deluxe", name: "Deluxe Room", views: 1250, image: "🛏️" },
  { id: "suite", name: "Executive Suite", views: 890, image: "🛋️" },
  { id: "penthouse", name: "Penthouse", views: 567, image: "🏰" },
  { id: "ocean", name: "Ocean View", views: 1432, image: "🌊" },
];

const tourSpots = [
  { id: 1, label: "Bedroom", angle: 0 },
  { id: 2, label: "Bathroom", angle: 90 },
  { id: 3, label: "Living Area", angle: 180 },
  { id: 4, label: "Balcony", angle: 270 },
];

const HotelRoomTour = () => {
  const [selectedRoom, setSelectedRoom] = useState("deluxe");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentAngle, setCurrentAngle] = useState(0);

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-violet-500/20 text-violet-400 border-violet-500/30">
            <Camera className="w-3 h-3 mr-1" /> Virtual Tour
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Explore Rooms in 360°
          </h2>
          <p className="text-muted-foreground">Take a virtual walk through our stunning accommodations</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Room Selector */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Select Room Type
            </h3>
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                  selectedRoom === room.id
                    ? "bg-violet-500/10 border-violet-500/30"
                    : "bg-card/60 border-border/50 hover:bg-card/80"
                )}
              >
                <span className="text-2xl">{room.image}</span>
                <div className="flex-1">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {room.views.toLocaleString()} views
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Tour Viewer */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video bg-gradient-to-br from-violet-500/20 via-card to-purple-500/20 rounded-2xl border border-border/50 overflow-hidden">
              {/* Simulated 360 View */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="text-8xl transition-transform duration-500"
                  style={{ transform: `rotateY(${currentAngle}deg)` }}
                >
                  {roomTypes.find(r => r.id === selectedRoom)?.image}
                </div>
              </div>

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20">
                {/* Top Bar */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge className="bg-black/50 text-white border-0">
                    {roomTypes.find(r => r.id === selectedRoom)?.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-black/50 hover:bg-black/70"
                      onClick={() => setCurrentAngle(0)}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-black/50 hover:bg-black/70"
                      onClick={() => setCurrentAngle(prev => prev + 90)}
                    >
                      <RotateCcw className="w-5 h-5 scale-x-[-1]" />
                    </Button>
                  </div>

                  {/* Tour Spots */}
                  <div className="flex justify-center gap-2">
                    {tourSpots.map((spot) => (
                      <button
                        key={spot.id}
                        onClick={() => setCurrentAngle(spot.angle)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          currentAngle === spot.angle
                            ? "bg-white text-black"
                            : "bg-black/50 hover:bg-black/70"
                        )}
                      >
                        {spot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              {[
                { label: "Room Size", value: "45m²" },
                { label: "Max Guests", value: "2 Adults" },
                { label: "Bed Type", value: "King" },
                { label: "View", value: "City" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-card/60 rounded-xl border border-border/50">
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelRoomTour;

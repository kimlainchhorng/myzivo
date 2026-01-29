import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Clock, 
  Music, 
  Trophy, 
  Theater, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Flame,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Events = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Events", icon: Sparkles },
    { id: "music", label: "Music", icon: Music },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "theater", label: "Theater", icon: Theater },
  ];

  const featuredEvent = {
    id: 0,
    title: "Taylor Swift - The Eras Tour",
    category: "music",
    venue: "Madison Square Garden",
    city: "New York",
    date: "Mar 15, 2026",
    time: "7:00 PM",
    priceFrom: 199,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
    rating: 4.9,
    soldOut: false,
    hot: true,
    attendees: "45K+",
  };

  const sampleEvents = [
    {
      id: 1,
      title: "NBA Finals - Game 7",
      category: "sports",
      venue: "Crypto.com Arena",
      city: "Los Angeles",
      date: "Jun 20, 2026",
      time: "8:00 PM",
      priceFrom: 350,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
      rating: 4.8,
      soldOut: false,
      hot: true,
    },
    {
      id: 2,
      title: "Hamilton",
      category: "theater",
      venue: "Richard Rodgers Theatre",
      city: "New York",
      date: "Apr 5, 2026",
      time: "2:00 PM",
      priceFrom: 175,
      image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop",
      rating: 4.9,
      soldOut: false,
    },
    {
      id: 3,
      title: "Coldplay - Music of the Spheres",
      category: "music",
      venue: "Rose Bowl",
      city: "Pasadena",
      date: "May 10, 2026",
      time: "7:30 PM",
      priceFrom: 125,
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
      rating: 4.7,
      soldOut: false,
    },
    {
      id: 4,
      title: "Super Bowl LX",
      category: "sports",
      venue: "Levi's Stadium",
      city: "Santa Clara",
      date: "Feb 8, 2026",
      time: "6:30 PM",
      priceFrom: 2500,
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
      rating: 5.0,
      soldOut: true,
    },
    {
      id: 5,
      title: "The Phantom of the Opera",
      category: "theater",
      venue: "Her Majesty's Theatre",
      city: "London",
      date: "Mar 22, 2026",
      time: "7:30 PM",
      priceFrom: 85,
      image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop",
      rating: 4.6,
      soldOut: false,
    },
    {
      id: 6,
      title: "Ed Sheeran - Mathematics Tour",
      category: "music",
      venue: "Wembley Stadium",
      city: "London",
      date: "Jul 15, 2026",
      time: "6:00 PM",
      priceFrom: 95,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      rating: 4.8,
      soldOut: false,
    },
  ];

  const filteredEvents = category === "all" 
    ? sampleEvents 
    : sampleEvents.filter(e => e.category === category);

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />

      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/18 via-transparent to-transparent opacity-60" />
          <div className="absolute top-1/3 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-br from-pink-500/25 to-rose-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-gradient-to-tl from-purple-500/15 to-violet-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-500 border-pink-500/30 px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Live Events
              </Badge>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Unforgettable{" "}
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  Experiences
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get tickets to the hottest concerts, sports events, and theater shows.
              </p>
            </div>

            {/* Premium Search Card */}
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <Card className="p-4 sm:p-6 lg:p-8 border-0 bg-gradient-to-br from-card/95 to-card shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Search events..." 
                      className="pl-12 h-12 sm:h-14 rounded-xl text-base bg-muted/30 border-border/50 focus:border-pink-500/50" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                      <Input placeholder="Location" className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl bg-muted/30 border-border/50 focus:border-pink-500/50" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                      <Input type="date" className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl bg-muted/30 border-border/50 focus:border-pink-500/50" />
                    </div>
                  </div>
                  <Button className="h-12 sm:h-14 w-full text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:opacity-90 touch-manipulation active:scale-[0.98]">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Event */}
        <section className="py-8 sm:py-10">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl group cursor-pointer hover:shadow-pink-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-video lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-3 sm:top-5 left-3 sm:left-5 flex gap-2">
                    <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 px-2 sm:px-3 py-1 sm:py-1.5 font-semibold shadow-lg text-xs sm:text-sm">
                      <Zap className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-2 sm:px-3 py-1 sm:py-1.5 font-semibold shadow-lg text-xs sm:text-sm">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                </div>
                <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                    <Badge variant="outline" className="text-pink-500 border-pink-500/50 px-2 sm:px-3 py-1 sm:py-1.5 font-semibold bg-pink-500/10 text-xs sm:text-sm">
                      <Music className="w-3 h-3 mr-1" />
                      Concert
                    </Badge>
                    <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-xs sm:text-sm">{featuredEvent.rating}</span>
                    </div>
                  </div>
                  <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 group-hover:text-pink-500 transition-colors">
                    {featuredEvent.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-muted-foreground mb-4 sm:mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                    <span className="truncate">{featuredEvent.venue} • {featuredEvent.city}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-5 mb-5 sm:mb-8">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-muted/50 text-xs sm:text-sm font-medium">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" />
                      {featuredEvent.date}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-muted/50 text-xs sm:text-sm font-medium">
                      <Clock className="w-3.5 h-3.5 text-pink-500" />
                      {featuredEvent.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Tickets from</span>
                      <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        ${featuredEvent.priceFrom}
                      </p>
                    </div>
                    <Button size="lg" className="gap-2 h-11 sm:h-14 px-4 sm:px-8 text-sm sm:text-lg font-bold rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 touch-manipulation active:scale-[0.98]">
                      Get Tickets
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Category Tabs & Events Grid */}
        <section className="py-10 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Upcoming Events</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Don't miss out on these experiences</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                <Tabs value={category} onValueChange={setCategory}>
                  <TabsList className="bg-muted/50 p-1 sm:p-1.5 rounded-xl">
                    {categories.map((cat) => (
                      <TabsTrigger 
                        key={cat.id} 
                        value={cat.id} 
                        className="gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white touch-manipulation"
                      >
                        <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{cat.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl touch-manipulation flex-shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>

            {/* Events Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card shadow-xl group cursor-pointer hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-300 h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {event.hot && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg">
                            <Flame className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                        {event.soldOut && (
                          <Badge variant="destructive" className="shadow-lg">Sold Out</Badge>
                        )}
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 p-2.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-pink-500/80 transition-all group/heart"
                      >
                        <Heart className="h-4 w-4 text-white group-hover/heart:fill-white transition-all" />
                      </motion.button>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white text-lg line-clamp-1 drop-shadow-lg">{event.title}</h3>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold">{event.venue}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {event.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold">{event.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
                          <Calendar className="h-3.5 w-3.5 text-pink-500" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
                          <Clock className="h-3.5 w-3.5 text-pink-500" />
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground">From</span>
                          <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                            ${event.priceFrom}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            size="sm" 
                            disabled={event.soldOut} 
                            className={`rounded-xl h-10 px-5 font-bold ${
                              !event.soldOut 
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20" 
                                : ""
                            }`}
                          >
                            {event.soldOut ? "Sold Out" : "Get Tickets"}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg font-bold rounded-xl border-2">
                  View All Events
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;

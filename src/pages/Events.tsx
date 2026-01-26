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
  Users
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge className="mb-4 bg-pink-500/10 text-pink-500">New Service</Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Unforgettable <span className="text-pink-500">Experiences</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Get tickets to the hottest concerts, sports events, and theater shows. 
                Best seats, secure tickets, instant delivery.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search events, artists, or venues..." className="pl-11 h-12" />
                  </div>
                  <div className="relative w-full lg:w-48">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Location" className="pl-11 h-12" />
                  </div>
                  <div className="relative w-full lg:w-48">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="date" className="pl-11 h-12" />
                  </div>
                  <Button className="h-12 px-8 bg-pink-500 hover:bg-pink-600">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Featured Event */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden group cursor-pointer hover:border-pink-500/50 transition-colors">
                <div className="grid lg:grid-cols-2">
                  <div className="relative aspect-video lg:aspect-auto overflow-hidden">
                    <img
                      src={featuredEvent.image}
                      alt={featuredEvent.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-pink-500 text-white">🔥 Featured</Badge>
                      <Badge className="bg-eats text-white">Hot</Badge>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-pink-500 border-pink-500">
                        <Music className="w-3 h-3 mr-1" />
                        Concert
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{featuredEvent.rating}</span>
                      </div>
                    </div>
                    <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 group-hover:text-pink-500 transition-colors">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      {featuredEvent.venue} • {featuredEvent.city}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {featuredEvent.date}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {featuredEvent.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {featuredEvent.attendees} interested
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Tickets from</span>
                        <p className="text-4xl font-bold text-pink-500">${featuredEvent.priceFrom}</p>
                      </div>
                      <Button size="lg" className="gap-2 bg-pink-500 hover:bg-pink-600">
                        Get Tickets
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Category Tabs & Events Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
              <div>
                <h2 className="font-display text-2xl font-bold mb-1">Upcoming Events</h2>
                <p className="text-muted-foreground">Don't miss out on these experiences</p>
              </div>
              <div className="flex items-center gap-4">
                <Tabs value={category} onValueChange={setCategory}>
                  <TabsList>
                    {categories.map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                        <cat.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{cat.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </motion.div>

            {/* Events Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group cursor-pointer hover:border-pink-500/50 transition-colors h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {event.hot && (
                          <Badge className="bg-eats text-white">🔥 Hot</Badge>
                        )}
                        {event.soldOut && (
                          <Badge variant="destructive">Sold Out</Badge>
                        )}
                      </div>
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 transition-colors">
                        <Heart className="h-4 w-4 text-white" />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white text-lg line-clamp-1">{event.title}</h3>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium">{event.venue}</p>
                          <p className="text-xs text-muted-foreground">{event.city}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium">{event.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground">From</span>
                          <p className="text-xl font-bold text-pink-500">${event.priceFrom}</p>
                        </div>
                        <Button size="sm" disabled={event.soldOut} className={!event.soldOut ? "bg-pink-500 hover:bg-pink-600" : ""}>
                          {event.soldOut ? "Sold Out" : "Get Tickets"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="gap-2">
                View All Events
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;

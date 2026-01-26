import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket, Calendar, MapPin, Search, Filter, Heart, Star, Clock, Users, Music, Trophy, Theater, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Events = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Events", icon: Sparkles },
    { id: "music", label: "Music", icon: Music },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "theater", label: "Theater", icon: Theater },
  ];

  const sampleEvents = [
    {
      id: 1,
      title: "Taylor Swift - The Eras Tour",
      category: "music",
      venue: "Madison Square Garden",
      city: "New York",
      date: "Mar 15, 2026",
      time: "7:00 PM",
      priceFrom: 199,
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop",
      rating: 4.9,
      soldOut: false,
      hot: true,
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
  ];

  const filteredEvents = category === "all" 
    ? sampleEvents 
    : sampleEvents.filter(e => e.category === category);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Event Tickets</h1>
              <p className="text-sm text-muted-foreground">Concerts, sports & entertainment</p>
            </div>
          </div>
          <Badge className="ml-auto bg-pink-500/10 text-pink-500">New Service</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Unforgettable <span className="text-pink-500">Experiences</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get tickets to the hottest concerts, sports events, and theater shows.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events, artists, or venues..." className="pl-10" />
          </div>
          <div className="relative w-full md:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Location" className="pl-10" />
          </div>
          <div className="relative w-full md:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="date" className="pl-10" />
          </div>
          <Button variant="hero">Search</Button>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-6"
        >
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="overflow-hidden group cursor-pointer hover:border-pink-500 transition-colors">
                {/* Image */}
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
                    <Button size="sm" disabled={event.soldOut}>
                      {event.soldOut ? "Sold Out" : "Get Tickets"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Events;

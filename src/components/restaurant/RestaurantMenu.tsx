import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Sparkles, Star, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: 1, name: "Pizza Margherita", category: "Pizza", price: 18.99, available: true, featured: true, emoji: "🍕" },
    { id: 2, name: "Pasta Carbonara", category: "Pasta", price: 16.50, available: true, featured: false, emoji: "🍝" },
    { id: 3, name: "Tiramisu", category: "Desserts", price: 8.99, available: true, featured: true, emoji: "🍰" },
    { id: 4, name: "Caesar Salad", category: "Salads", price: 12.00, available: false, featured: false, emoji: "🥗" },
    { id: 5, name: "Bruschetta", category: "Appetizers", price: 9.50, available: true, featured: false, emoji: "🥖" },
    { id: 6, name: "Lasagna", category: "Pasta", price: 19.00, available: true, featured: false, emoji: "🍝" },
  ];

  const categories = [...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-eats" />
            Menu
          </h1>
          <p className="text-muted-foreground">Manage your menu items</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-eats to-red-500 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50"
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {categories.map((category, categoryIndex) => {
          const categoryItems = filteredItems.filter(menuItem => menuItem.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <motion.div key={category} variants={item}>
              <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>{categoryItems.length} items</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-muted/50">
                      {categoryItems.filter(i => i.available).length} available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {categoryItems.map((menuItem, index) => (
                      <motion.div 
                        key={menuItem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 group ${!menuItem.available ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {menuItem.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{menuItem.name}</span>
                              {menuItem.featured && (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 border gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Featured
                                </Badge>
                              )}
                              {!menuItem.available && (
                                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 border">
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                              <DollarSign className="h-3 w-3" />
                              {menuItem.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default RestaurantMenu;

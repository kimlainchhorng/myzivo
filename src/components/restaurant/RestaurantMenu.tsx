import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

const RestaurantMenu = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { id: 1, name: "Pizza Margherita", category: "Pizza", price: 18.99, available: true, featured: true },
    { id: 2, name: "Pasta Carbonara", category: "Pasta", price: 16.50, available: true, featured: false },
    { id: 3, name: "Tiramisu", category: "Desserts", price: 8.99, available: true, featured: true },
    { id: 4, name: "Caesar Salad", category: "Salads", price: 12.00, available: false, featured: false },
    { id: 5, name: "Bruschetta", category: "Appetizers", price: 9.50, available: true, featured: false },
    { id: 6, name: "Lasagna", category: "Pasta", price: 19.00, available: true, featured: false },
  ];

  const categories = [...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground">Manage your menu items</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {categories.map((category) => {
        const categoryItems = filteredItems.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{categoryItems.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.featured && <Badge variant="secondary">Featured</Badge>}
                          {!item.available && <Badge variant="destructive">Unavailable</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RestaurantMenu;

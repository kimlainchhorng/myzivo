import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const RestaurantSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Info</CardTitle>
            <CardDescription>Basic information about your restaurant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input id="name" defaultValue="Bella Italia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input id="cuisine" defaultValue="Italian" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue="Authentic Italian cuisine in the heart of the city" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="info@bellaitalia.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>Set your opening and closing times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Currently Open</p>
                <p className="text-sm text-muted-foreground">Toggle to set your restaurant status</p>
              </div>
              <Switch />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opening Time</Label>
                <Input type="time" defaultValue="10:00" />
              </div>
              <div className="space-y-2">
                <Label>Closing Time</Label>
                <Input type="time" defaultValue="22:00" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>Configure delivery options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Average Prep Time (minutes)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>Delivery Radius (km)</Label>
                <Input type="number" defaultValue="5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Accept Online Orders</p>
                <p className="text-sm text-muted-foreground">Allow customers to order online</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;

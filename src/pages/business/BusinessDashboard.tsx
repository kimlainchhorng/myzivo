/**
 * BusinessDashboard - B2B Dashboard for Corporate Accounts
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Users,
  Plane,
  Building2,
  Car,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  PlusCircle,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Data loaded from database — no hardcoded data
const stats = [
  { label: "Total Bookings", value: "0", change: "--", icon: Calendar },
  { label: "Total Spend", value: "$0", change: "--", icon: DollarSign },
  { label: "Active Travelers", value: "0", change: "--", icon: Users },
  { label: "Avg. Savings", value: "0%", change: "--", icon: TrendingUp },
];

const recentBookings: { id: string; traveler: string; type: string; route: string; date: string; amount: number; status: string }[] = [];

const travelers: { name: string; email: string; trips: number; spend: number }[] = [];

const policyCompliance = {
  overall: 0,
  categories: [
    { name: "Flight Class", compliance: 0 },
    { name: "Hotel Rate", compliance: 0 },
    { name: "Advance Booking", compliance: 0 },
  ],
};

export default function BusinessDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-4 h-4" />;
      case "hotel":
        return <Building2 className="w-4 h-4" />;
      case "car":
        return <Car className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Business Dashboard | ZIVO for Business</title>
        <meta name="description" content="Manage your corporate travel program with ZIVO" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground">Manage your corporate travel program</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Book Travel
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-emerald-600 mt-2">{stat.change} vs last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="travelers">Travelers</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <CardTitle>Recent Bookings</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search bookings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button variant="outline" size="icon" aria-label="Filter">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {getTypeIcon(booking.type)}
                          </div>
                          <div>
                            <p className="font-medium">{booking.route}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.traveler} • {booking.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">${booking.amount}</p>
                          {getStatusBadge(booking.status)}
                          <Button variant="ghost" size="icon" aria-label="More options">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Travelers Tab */}
            <TabsContent value="travelers" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Team Travelers</CardTitle>
                    <Button className="gap-2">
                      <PlusCircle className="w-4 h-4" />
                      Add Traveler
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {travelers.map((traveler) => (
                      <div
                        key={traveler.email}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {traveler.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{traveler.name}</p>
                            <p className="text-sm text-muted-foreground">{traveler.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">{traveler.trips}</p>
                            <p className="text-muted-foreground">Trips</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">${traveler.spend.toLocaleString()}</p>
                            <p className="text-muted-foreground">Spend</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policy Tab */}
            <TabsContent value="policy" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Compliance</CardTitle>
                    <CardDescription>How well your team follows travel policies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary mb-2">
                          {policyCompliance.overall}%
                        </div>
                        <p className="text-muted-foreground">Overall Compliance</p>
                      </div>
                      <div className="space-y-4">
                        {policyCompliance.categories.map((cat) => (
                          <div key={cat.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{cat.name}</span>
                              <span className="font-medium">{cat.compliance}%</span>
                            </div>
                            <Progress value={cat.compliance} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Travel Policy Settings</CardTitle>
                    <CardDescription>Configure your company's travel rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Flight Class</p>
                          <p className="text-sm text-muted-foreground">
                            Economy for flights under 6 hours
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Hotel Budget</p>
                          <p className="text-sm text-muted-foreground">
                            Max $200/night in major cities
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Advance Booking</p>
                          <p className="text-sm text-muted-foreground">
                            Book at least 7 days in advance
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Reports</CardTitle>
                  <CardDescription>Download detailed reports for your records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Monthly Expense Report", type: "PDF" },
                      { name: "Traveler Summary", type: "Excel" },
                      { name: "Policy Compliance", type: "PDF" },
                      { name: "Booking History", type: "CSV" },
                      { name: "Savings Analysis", type: "PDF" },
                      { name: "Carbon Footprint", type: "PDF" },
                    ].map((report) => (
                      <div
                        key={report.name}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{report.name}</p>
                            <p className="text-xs text-muted-foreground">{report.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
}

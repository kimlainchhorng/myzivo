/**
 * ZIVO Admin Global Dashboard
 * Multi-country management and analytics
 */

import { useState } from "react";
import { 
  Globe, 
  MapPin, 
  Languages, 
  DollarSign, 
  Users,
  TrendingUp,
  Plane,
  Building2,
  Car,
  Bike,
  UtensilsCrossed,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Plus,
  Settings,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCountriesWithServices,
  useSupportedLanguages,
  useGlobalOverview,
  useUpdateCountry,
  useUpdateCountryService,
  useToggleLanguage,
} from "@/hooks/useGlobalExpansion";
import { ServiceType } from "@/types/global";

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  flights: <Plane className="w-4 h-4" />,
  hotels: <Building2 className="w-4 h-4" />,
  cars: <Car className="w-4 h-4" />,
  rides: <Bike className="w-4 h-4" />,
  eats: <UtensilsCrossed className="w-4 h-4" />,
  move: <Package className="w-4 h-4" />,
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  flights: "bg-sky-500/10 text-sky-600",
  hotels: "bg-amber-500/10 text-amber-600",
  cars: "bg-violet-500/10 text-violet-600",
  rides: "bg-emerald-500/10 text-emerald-600",
  eats: "bg-orange-500/10 text-orange-600",
  move: "bg-blue-500/10 text-blue-600",
};

export default function GlobalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: countries, isLoading: countriesLoading } = useCountriesWithServices();
  const { data: languages, isLoading: languagesLoading } = useSupportedLanguages();
  const { data: overview, isLoading: overviewLoading } = useGlobalOverview();
  const updateCountry = useUpdateCountry();
  const updateService = useUpdateCountryService();
  const toggleLanguage = useToggleLanguage();

  const isLoading = countriesLoading || languagesLoading || overviewLoading;

  // Group countries by region
  const countryByRegion = countries?.reduce((acc, country) => {
    if (!acc[country.region]) acc[country.region] = [];
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, typeof countries>) || {};

  const handleToggleCountry = (countryId: string, isActive: boolean) => {
    updateCountry.mutate({
      id: countryId,
      is_active: isActive,
      ...(isActive ? { launched_at: new Date().toISOString() } : { disabled_at: new Date().toISOString() }),
    });
  };

  const handleToggleService = (serviceId: string, isEnabled: boolean) => {
    updateService.mutate({
      id: serviceId,
      is_enabled: isEnabled,
      ...(isEnabled ? { launched_at: new Date().toISOString() } : {}),
    });
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            Global Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage countries, languages, and services worldwide
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Country
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Countries</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.activeCountries || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {overview?.totalCountries || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Countries with live services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
            <Languages className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.activeLanguages || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {overview?.totalLanguages || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active language support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(overview?.totalUsers || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(overview?.revenueByRegion?.reduce((sum, r) => sum + r.totalRevenue, 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All regions combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="countries" className="gap-2">
            <MapPin className="w-4 h-4" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="languages" className="gap-2">
            <Languages className="w-4 h-4" />
            Languages
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Settings className="w-4 h-4" />
            Services
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue by Region */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
                <CardDescription>Last 30 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.revenueByRegion?.map((region) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-muted-foreground">
                            {region.activeCountries} / {region.countries} countries
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${region.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {region.totalUsers.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Expansion Checklist</CardTitle>
                <CardDescription>Steps for launching in a new country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Configure country settings", done: true },
                    { label: "Set up currency & tax rules", done: true },
                    { label: "Add localized legal pages", done: false },
                    { label: "Enable required services", done: false },
                    { label: "Test payment integration", done: false },
                    { label: "Review compliance requirements", done: false },
                    { label: "Launch country", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={step.done ? "text-muted-foreground line-through" : ""}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-6">
          {Object.entries(countryByRegion).map(([region, regionCountries]) => (
            <Card key={region}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {region}
                </CardTitle>
                <CardDescription>
                  {regionCountries.filter((c) => c.is_active).length} of {regionCountries.length} countries active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell className="text-2xl">{country.flag_emoji}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{country.name}</p>
                            <p className="text-sm text-muted-foreground">{country.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>{country.default_currency}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {country.services
                              .filter((s) => s.is_enabled)
                              .map((service) => (
                                <Badge
                                  key={service.id}
                                  variant="secondary"
                                  className={SERVICE_COLORS[service.service_type as ServiceType]}
                                >
                                  {SERVICE_ICONS[service.service_type as ServiceType]}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {country.is_active ? (
                            <Badge variant="default" className="bg-emerald-500">
                              Live
                            </Badge>
                          ) : country.is_beta ? (
                            <Badge variant="secondary">Beta</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={country.is_active}
                              onCheckedChange={(checked) =>
                                handleToggleCountry(country.id, checked)
                              }
                            />
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supported Languages</CardTitle>
                  <CardDescription>Enable languages for your platform</CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Language
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Native Name</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages?.map((lang) => (
                    <TableRow key={lang.id}>
                      <TableCell className="text-xl">{lang.flag_emoji}</TableCell>
                      <TableCell className="font-medium">{lang.name}</TableCell>
                      <TableCell>{lang.native_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {lang.direction === "rtl" ? "RTL" : "LTR"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lang.is_default ? (
                          <Badge>Default</Badge>
                        ) : lang.is_active ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={lang.is_active}
                          disabled={lang.is_default}
                          onCheckedChange={(checked) =>
                            toggleLanguage.mutate({ id: lang.id, is_active: checked })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Availability by Country</CardTitle>
              <CardDescription>Configure which services are available in each country</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Plane className="w-4 h-4" />
                          <span className="text-xs">Flights</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="text-xs">Hotels</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Car className="w-4 h-4" />
                          <span className="text-xs">Cars</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Bike className="w-4 h-4" />
                          <span className="text-xs">Rides</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <UtensilsCrossed className="w-4 h-4" />
                          <span className="text-xs">Eats</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span className="text-xs">Move</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countries?.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{country.flag_emoji}</span>
                            <span className="font-medium">{country.name}</span>
                          </div>
                        </TableCell>
                        {(["flights", "hotels", "cars", "rides", "eats", "move"] as ServiceType[]).map(
                          (serviceType) => {
                            const service = country.services.find(
                              (s) => s.service_type === serviceType
                            );
                            return (
                              <TableCell key={serviceType} className="text-center">
                                {service ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <Switch
                                      checked={service.is_enabled}
                                      onCheckedChange={(checked) =>
                                        handleToggleService(service.id, checked)
                                      }
                                    />
                                    {service.is_beta && (
                                      <Badge variant="outline" className="text-[10px]">
                                        Beta
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            );
                          }
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

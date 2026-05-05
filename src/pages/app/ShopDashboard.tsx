import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StoreOwnerLayout from "@/components/admin/StoreOwnerLayout";
import { resolveBusinessDashboardRoute } from "@/lib/business/dashboardRoute";

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("ar-dashboard");

  const { data: store, isLoading } = useQuery({
    queryKey: ["my-store", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_profiles")
        .select("id, name, logo_url, category")
        .eq("owner_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (isLoading || !store) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const resolvedDashboard = resolveBusinessDashboardRoute(store.category, store.id);
  if (!resolvedDashboard.fallback && resolvedDashboard.path !== "/shop-dashboard") {
    return <Navigate to={resolvedDashboard.path} replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "ar-dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shop Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border/40 bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Work Orders</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Pending Estimates</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Revenue This Month</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Active Customers</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        );
      case "ar-parts":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Part Shop</h2>
            <p className="text-muted-foreground">Manage your auto parts inventory</p>
            <button
              onClick={() => navigate("/shop-dashboard/products")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Go to Part Shop
            </button>
          </div>
        );
      case "ar-workorders":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Work Orders</h2>
            <p className="text-muted-foreground">Track and manage customer service work</p>
          </div>
        );
      case "ar-estimates":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Estimates</h2>
            <p className="text-muted-foreground">Create and manage service estimates</p>
          </div>
        );
      case "ar-invoices":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Invoices</h2>
            <p className="text-muted-foreground">Manage customer invoices and payments</p>
          </div>
        );
      case "employees":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Employees</h2>
            <p className="text-muted-foreground">Manage your technicians and staff</p>
            <button
              onClick={() => navigate("/shop-dashboard/employees")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Go to Employees
            </button>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-muted-foreground">This section is being prepared. Check back soon!</p>
          </div>
        );
    }
  };

  return (
    <StoreOwnerLayout
      title={`${store.name || "Shop"} Dashboard`}
      storeId={store.id}
      storeName={store.name}
      storeLogoUrl={store.logo_url}
      storeCategory={store.category}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </StoreOwnerLayout>
  );
};

export default ShopDashboard;

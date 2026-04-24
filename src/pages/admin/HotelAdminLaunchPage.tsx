import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Loader2, LogIn, PlusCircle } from "lucide-react";
import { useOwnerStoreProfile } from "@/hooks/useOwnerStoreProfile";

export default function HotelAdminLaunchPage() {
  const navigate = useNavigate();
  const { data: ownerStore, isLoading } = useOwnerStoreProfile();

  useEffect(() => {
    if (ownerStore?.isLodging) {
      navigate(`/admin/stores/${ownerStore.id}?tab=lodge-overview`, { replace: true });
    }
  }, [navigate, ownerStore]);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <Card className="w-full border-primary/20 bg-card shadow-sm">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Hotel className="h-7 w-7" />}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">Hotel / Resort Operations</Badge>
              <CardTitle className="text-xl">{isLoading ? "Finding your property…" : "No Hotel / Resort store connected yet"}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? "We are checking your owner account." : "Connect or create a lodging store to open rooms, rates, reservations, add-ons, and guest requests."}
              </p>
            </div>
          </CardHeader>
          {!isLoading && (
            <CardContent className="grid gap-2">
              <Button onClick={() => navigate("/store/setup")}><PlusCircle className="mr-2 h-4 w-4" /> Set up Hotel / Resort</Button>
              <Button variant="outline" onClick={() => navigate("/partner-login")}><LogIn className="mr-2 h-4 w-4" /> Go to Partner Login</Button>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}
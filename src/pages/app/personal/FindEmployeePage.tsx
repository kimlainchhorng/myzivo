/** Find Company — browse companies and apply to open roles */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Building2, Briefcase, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FindEmployeePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Find Company</h1>
      </header>

      <div className="space-y-5 p-4">
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold">Search companies</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Company name, industry, or location" className="pl-9" />
          </div>
          <Button className="w-full">Search Companies</Button>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Browse Top Companies</h2>
              <p className="text-xs text-muted-foreground">Discover employers actively hiring</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">View Companies</Button>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="space-y-2 p-4">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            <div className="text-sm font-semibold">Open Jobs</div>
            <p className="text-xs text-muted-foreground">0 available</p>
          </Card>
          <Card className="space-y-2 p-4">
            <Bookmark className="h-5 w-5 text-emerald-500" />
            <div className="text-sm font-semibold">Saved</div>
            <p className="text-xs text-muted-foreground">0 companies</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

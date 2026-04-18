/** Apply Job hub — choose Create CV or Find Employee (employer flow) */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplyJobHubPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Apply Job</h1>
      </header>

      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">Choose what you want to do</p>

        <button onClick={() => navigate("/personal/create-cv")} className="w-full text-left">
          <Card className="flex items-center gap-4 p-5 transition-colors hover:bg-accent">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <FileText className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Create CV</h2>
              <p className="text-sm text-muted-foreground">Build your resume and apply to jobs</p>
            </div>
          </Card>
        </button>

        <button onClick={() => navigate("/personal/find-employee")} className="w-full text-left">
          <Card className="flex items-center gap-4 p-5 transition-colors hover:bg-accent">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Search className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Find Employee</h2>
              <p className="text-sm text-muted-foreground">Post a job & search candidates for your company</p>
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
}

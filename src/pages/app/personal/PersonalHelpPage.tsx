import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";

export default function PersonalHelpPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Help & Support" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24">
        <div className="flex items-center gap-2.5 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px]">Help & Support</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
            <HelpCircle className="w-7 h-7 text-sky-500" />
          </div>
          <h2 className="font-semibold text-[15px] mb-1">FAQs & Contact</h2>
          <p className="text-[13px] text-muted-foreground max-w-[260px]">Find answers to common questions or reach out for support.</p>
        </div>
      </div>
    </AppLayout>
  );
}

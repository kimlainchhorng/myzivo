import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";

export default function ShopEmployeesPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title="Employees" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24">
        <div className="flex items-center gap-2.5 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="font-bold text-[17px]">Employees</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4"><Users className="w-7 h-7 text-blue-500" /></div>
          <h2 className="font-semibold text-[15px] mb-1">Staff Management</h2>
          <p className="text-[13px] text-muted-foreground max-w-[260px]">Add, remove, and manage your shop employees and their roles.</p>
        </div>
      </div>
    </AppLayout>
  );
}

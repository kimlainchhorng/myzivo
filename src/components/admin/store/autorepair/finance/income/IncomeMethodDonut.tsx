/**
 * Revenue by payment method — donut chart.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmtMoney, type MethodTotal } from "@/lib/admin/incomeCalculations";

interface Props { methods: MethodTotal[] }

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142 70% 45%)",
  "hsl(38 92% 50%)",
  "hsl(217 91% 60%)",
  "hsl(280 60% 60%)",
  "hsl(0 70% 60%)",
];

export default function IncomeMethodDonut({ methods }: Props) {
  const data = methods.map((m) => ({ name: m.method, value: m.amount / 100 }));
  const total = methods.reduce((s, m) => s + m.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Revenue by payment method
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">No payments yet.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v: number) => fmtMoney(Math.round((v as number) * 100))}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {total > 0 && (
          <div className="text-center text-[11px] text-muted-foreground mt-1">
            Total: <span className="font-semibold text-foreground">{fmtMoney(total)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

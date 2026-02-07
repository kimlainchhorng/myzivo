/**
 * QualityCharts Component
 * Rating distribution and trend charts
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { RatingDistribution } from "@/hooks/useQualityMetrics";

interface QualityChartsProps {
  distribution: RatingDistribution[] | undefined;
  isLoading: boolean;
}

const RATING_COLORS = [
  "hsl(var(--destructive))",
  "hsl(var(--warning, 38 92% 50%))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--chart-2, 173 58% 39%))",
  "hsl(var(--primary))",
];

const STAR_LABELS = ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"];

const QualityCharts = ({ distribution, isLoading }: QualityChartsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare pie chart data for drivers
  const driverPieData = (distribution || []).map((d, i) => ({
    name: STAR_LABELS[i],
    value: d.driverCount,
    rating: d.rating,
  })).filter(d => d.value > 0);

  // Prepare pie chart data for merchants
  const merchantPieData = (distribution || []).map((d, i) => ({
    name: STAR_LABELS[i],
    value: d.merchantCount,
    rating: d.rating,
  })).filter(d => d.value > 0);

  // Prepare bar chart data
  const barData = (distribution || []).map((d, i) => ({
    name: `${d.rating}★`,
    Drivers: d.driverCount,
    Merchants: d.merchantCount,
  }));

  const totalDriverRatings = driverPieData.reduce((sum, d) => sum + d.value, 0);
  const totalMerchantRatings = merchantPieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Driver Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Driver Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {totalDriverRatings === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No driver ratings yet
            </p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {driverPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RATING_COLORS[entry.rating - 1]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Ratings"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rating Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {totalDriverRatings === 0 && totalMerchantRatings === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No ratings yet
            </p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Drivers"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Merchants"
                    fill="hsl(var(--chart-2, 173 58% 39%))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityCharts;

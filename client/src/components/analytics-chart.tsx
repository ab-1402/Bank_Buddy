import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import type { Transaction } from "@shared/schema";

type AnalyticsChartProps = {
  data: Transaction[];
  type?: "transactions" | "customers";
};

export default function AnalyticsChart({ data, type = "transactions" }: AnalyticsChartProps) {
  const chartData = type === "transactions"
    ? processTransactionData(data)
    : processCustomerData(data);

  return (
    <div className="space-y-4">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, "Amount"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Button className="w-full" variant="outline">
        <BarChart className="h-4 w-4 mr-2" />
        Analyze Transactions
      </Button>
    </div>
  );
}

function processTransactionData(transactions: Transaction[] = []) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Generate demo data with some variations
  return last7Days.map((date, index) => {
    const baseAmount = 5000; // Base amount for variations
    const randomFactor = Math.random() * 0.4 + 0.8; // Random factor between 0.8 and 1.2
    let value = baseAmount * randomFactor;

    // Add a trend
    if (index > 3) {
      value *= 1.2; // Increase values in later days
    }

    return {
      date,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
    };
  });
}

function processCustomerData(customers: any[] = []) {
  // Mock growth data for demonstration
  return Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.max(5 + i * 2 + Math.floor(Math.random() * 3), 0),
  }));
}
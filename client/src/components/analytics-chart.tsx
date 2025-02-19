import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
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
  );
}

function processTransactionData(transactions: Transaction[] = []) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => ({
    date,
    value: transactions
      ?.filter(t => new Date(t.timestamp).toISOString().split('T')[0] === date)
      ?.reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        if (t.type === 'withdrawal') {
          return sum - amount;
        }
        return sum + amount;
      }, 0) || 0
  }));
}

function processCustomerData(customers: any[] = []) {
  // Mock growth data for demonstration
  return Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.max(5 + i * 2 + Math.floor(Math.random() * 3), 0),
  }));
}
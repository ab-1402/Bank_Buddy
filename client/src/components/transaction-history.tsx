import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import type { Transaction } from "@shared/schema";

type TransactionHistoryProps = {
  transactions: Transaction[];
};

const typeIcons = {
  deposit: ArrowDownRight,
  withdrawal: ArrowUpRight,
  transfer: ArrowRightLeft,
};

const typeColors = {
  deposit: "text-green-600 bg-green-50",
  withdrawal: "text-red-600 bg-red-50",
  transfer: "text-blue-600 bg-blue-50",
};

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {transactions?.map((transaction) => {
          const Icon = typeIcons[transaction.type];
          const colorClass = typeColors[transaction.type];

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-medium ${transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}>
                  {transaction.type === "withdrawal" ? "-" : "+"}₹
                  {Number(transaction.amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
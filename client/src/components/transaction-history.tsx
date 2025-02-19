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
  deposit: "text-green-600",
  withdrawal: "text-red-600",
  transfer: "text-blue-600",
};

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {transactions?.map((transaction) => {
          const Icon = typeIcons[transaction.type];
          const colorClass = typeColors[transaction.type];

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-medium ${colorClass}`}>
                {transaction.type === "withdrawal" ? "-" : "+"}$
                {Number(transaction.amount).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

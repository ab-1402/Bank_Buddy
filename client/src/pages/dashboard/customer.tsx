import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import TransactionHistory from "@/components/transaction-history";
import FraudAlert from "@/components/fraud-alert";
import Chatbot from "@/components/chatbot";
import AnalyticsChart from "@/components/analytics-chart";

export default function CustomerDashboard() {
  const { user, logoutMutation } = useAuth();

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: [`/api/transactions/${user?.id}`],
  });

  const { data: fraudAlerts, isLoading: loadingAlerts } = useQuery({
    queryKey: [`/api/fraud-alerts/${user?.id}`],
  });

  if (loadingTransactions || loadingAlerts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const balance = parseFloat(user?.balance || "0");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container">
          <h1 className="text-lg font-semibold">BankBuddy</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span>Welcome, {user?.fullName}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container py-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={transactions || []} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={transactions || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <FraudAlert alerts={fraudAlerts || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BankBuddy Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Chatbot />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
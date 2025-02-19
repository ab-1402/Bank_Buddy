import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  LogOut, 
  Wallet, 
  Activity,
  History,
  MessageSquare,
  Bell,
  X
} from "lucide-react";
import TransactionHistory from "@/components/transaction-history";
import FraudAlert from "@/components/fraud-alert";
import Chatbot from "@/components/chatbot";
import AnalyticsChart from "@/components/analytics-chart";

export default function CustomerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showChat, setShowChat] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Enhanced Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="flex h-16 items-center px-4 container">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-xl font-bold">BankBuddy</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="font-medium">Welcome, {user?.fullName}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => logoutMutation.mutate()}
              className="hover:bg-primary-foreground/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Balance Card with enhanced styling */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span>Account Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                ₹{balance.toLocaleString('en-IN', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Available Balance</p>
            </CardContent>
          </Card>

          {/* Transaction Analysis Card */}
          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-secondary" />
                <span>Transaction Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={transactions || []} />
            </CardContent>
          </Card>

          {/* Recent Transactions Card */}
          <Card className="md:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory transactions={transactions || []} />
            </CardContent>
          </Card>

          {/* Alert and Chatbot Section */}
          <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
            {/* Fraud Alerts Card */}
            <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-destructive" />
                  <span>Fraud Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FraudAlert alerts={fraudAlerts || []} />
              </CardContent>
            </Card>

            {/* BankBuddy Assistant Card - Only show when chat is open */}
            {showChat && (
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    <span>BankBuddy Assistant</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Chatbot />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      {!showChat && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowChat(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
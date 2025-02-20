import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  LogOut, 
  Wallet, 
  Activity,
  History,
  MessageSquare,
  Send,
  X
} from "lucide-react";
import TransactionHistory from "@/components/transaction-history";
import Chatbot from "@/components/chatbot";
import AnalyticsChart from "@/components/analytics-chart";
import { User, Account } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");

  // Ensure user data is refreshed
  const { data: userData, isLoading: loadingUser } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: [`/api/transactions/${user?.id}`],
  });

  const transferMutation = useMutation({
    mutationFn: async ({ amount, toUpiId }: { amount: number; toUpiId: string }) => {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, toUpiId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${user?.id}`] });
      setUpiId("");
      setAmount("");
      toast({
        title: "Transfer Successful",
        description: "Money has been transferred successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [showChat, setShowChat] = useState(false);

  if (loadingUser || loadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const balance = parseFloat(userData?.balance || "0");

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !amount) {
      toast({
        title: "Invalid Input",
        description: "Please enter both UPI ID and amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    await transferMutation.mutateAsync({
      amount: amountNum,
      toUpiId: upiId
    });
  };

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
            <span className="font-medium">Welcome, {userData?.fullName}</span>
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

          {/* Analytics Card */}
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

          {/* Recent Transactions */}
          <Card className="md:col-span-1 bg-card">
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

          {/* Transfer Money Section */}
          <Card className="md:col-span-1 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Transfer Money</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Enter Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={transferMutation.isPending}
                >
                  {transferMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer Money"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Chat Button and Chat Window */}
      {showChat ? (
        <div className="fixed bottom-6 right-6 w-96 bg-background border rounded-lg shadow-xl animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-semibold">BankBuddy Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Chatbot transactions={transactions?.slice(0,3) || []}/>
        </div>
      ) : (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg animate-bounce-slow"
          onClick={() => setShowChat(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
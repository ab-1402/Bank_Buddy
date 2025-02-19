import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Users } from "lucide-react";
import { DataTable } from "@/components/ui/table";
import FraudAlert from "@/components/fraud-alert";
import AnalyticsChart from "@/components/analytics-chart";

export default function ManagerDashboard() {
  const { user, logoutMutation } = useAuth();

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: allFraudAlerts } = useQuery({
    queryKey: ["/api/fraud-alerts"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container">
          <h1 className="text-lg font-semibold">BankBuddy Manager Portal</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span>Manager: {user?.fullName}</span>
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

      <main className="container py-6 grid gap-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{customers?.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={customers} type="customers" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Fraud Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <FraudAlert alerts={allFraudAlerts} isManager />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-right">Balance</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers?.map((customer) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-2">{customer.fullName}</td>
                      <td className="p-2">{customer.username}</td>
                      <td className="p-2 text-right">
                        ${Number(customer.balance).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

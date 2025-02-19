import { useAuth } from "@/hooks/use-auth";
import CustomerDashboard from "./customer";
import ManagerDashboard from "./manager";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  return <CustomerDashboard />;
}

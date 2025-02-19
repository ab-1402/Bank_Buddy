import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle } from "lucide-react";
import type { FraudAlert } from "@shared/schema";

type FraudAlertProps = {
  alerts: FraudAlert[];
  isManager?: boolean;
};

const severityColors = {
  low: "bg-yellow-100 text-yellow-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
};

export default function FraudAlert({ alerts, isManager }: FraudAlertProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {alerts?.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start space-x-4 p-4 rounded-lg border"
          >
            <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className={severityColors[alert.severity]}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p>{alert.description}</p>
              {isManager && !alert.resolved && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Eye, CheckCircle, XCircle } from "lucide-react";

const statusConfig = {
  unassigned: {
    icon: AlertTriangle,
    color: "bg-yellow-500/20 text-yellow-700",
  },
  in_progress: {
    icon: Eye,
    color: "bg-blue-500/20 text-blue-700",
  },
  resolved: {
    icon: CheckCircle,
    color: "bg-green-500/20 text-green-700",
  },
  escalated: {
    icon: XCircle,
    color: "bg-red-500/20 text-red-700",
  },
};

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status.replace("_", " ")}</span>
    </Badge>
  );
}

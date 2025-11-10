import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "in_progress" | "resolved";
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-status-pending text-status-pending-fg hover:bg-status-pending/90",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-status-in-progress text-status-in-progress-fg hover:bg-status-in-progress/90",
    },
    resolved: {
      label: "Resolved",
      className: "bg-status-resolved text-status-resolved-fg hover:bg-status-resolved/90",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

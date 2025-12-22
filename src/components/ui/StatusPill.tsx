import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle } from "lucide-react";

interface StatusPillProps {
  status: "pending" | "in_progress" | "resolved";
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "status-pill-pending",
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    className: "status-pill-in-progress",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    className: "status-pill-resolved",
  },
};

export const StatusPill = ({ status, animated = true, className }: StatusPillProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.span
      className={cn("status-pill", config.className, className)}
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Icon 
        className={cn(
          "w-3.5 h-3.5 mr-1.5",
          status === "in_progress" && "animate-spin"
        )} 
      />
      {config.label}
    </motion.span>
  );
};

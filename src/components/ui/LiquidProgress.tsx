import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidProgressProps {
  value: number;
  max?: number;
  color?: "primary" | "pending" | "in-progress" | "resolved";
  className?: string;
  showPercentage?: boolean;
}

const colorGradients = {
  primary: "from-primary to-secondary",
  pending: "from-status-pending to-orange-400",
  "in-progress": "from-status-in-progress to-blue-400",
  resolved: "from-status-resolved to-emerald-400",
};

export const LiquidProgress = ({ 
  value, 
  max = 100, 
  color = "primary",
  className,
  showPercentage = false
}: LiquidProgressProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("relative", className)}>
      <div className="liquid-progress h-2">
        <motion.div
          className={cn("liquid-progress-fill bg-gradient-to-r", colorGradients[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.span
          className="absolute -top-6 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, left: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transform: "translateX(-50%)" }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
};

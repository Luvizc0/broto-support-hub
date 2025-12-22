import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "primary" | "pending" | "in-progress" | "resolved";
  delay?: number;
}

const colorClasses = {
  primary: {
    icon: "text-primary",
    value: "text-primary text-glow",
    glow: "glow-primary",
  },
  pending: {
    icon: "text-status-pending",
    value: "text-status-pending",
    glow: "glow-pending",
  },
  "in-progress": {
    icon: "text-status-in-progress",
    value: "text-status-in-progress",
    glow: "glow-in-progress",
  },
  resolved: {
    icon: "text-status-resolved",
    value: "text-status-resolved",
    glow: "glow-resolved",
  },
};

// Animated counter component
const AnimatedCounter = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const displayValue = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    const timeout = setTimeout(() => {
      motionValue.set(value);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [value, delay, motionValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = v.toString();
      }
    });
    return unsubscribe;
  }, [displayValue]);

  return <span ref={ref}>0</span>;
};

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary",
  delay = 0 
}: MetricCardProps) => {
  const colors = colorClasses[color];
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="glass-card light-sweep p-6 cursor-default"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 10 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <motion.div
          className={cn("p-2 rounded-xl bg-muted/30", colors.glow)}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </motion.div>
      </div>
      <div className={cn("text-4xl font-bold tabular-nums", colors.value)}>
        <AnimatedCounter value={value} delay={delay * 0.1 + 0.3} />
      </div>
    </motion.div>
  );
};

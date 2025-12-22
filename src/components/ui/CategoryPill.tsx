import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
  category: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  infrastructure: "🏗️",
  academic: "📚",
  behavioral: "👥",
  technical: "💻",
  hostel: "🏠",
  food: "🍽️",
  placement: "💼",
  other: "📋",
};

export const CategoryPill = ({ 
  category, 
  active = false, 
  onClick,
  className 
}: CategoryPillProps) => {
  const icon = categoryIcons[category] || "📋";
  const label = category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ");

  return (
    <motion.button
      type="button"
      className={cn("category-pill", active && "active", className)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </motion.button>
  );
};

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant = "primary", size = "md", glow, children, disabled, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden font-medium rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2";
    
    const variantClasses = {
      primary: "liquid-button text-primary-foreground",
      secondary: cn(
        "bg-secondary/20 text-secondary-foreground border border-secondary/30",
        "hover:bg-secondary/30 hover:border-secondary/50",
        "hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)]"
      ),
      outline: cn(
        "bg-transparent border border-primary/30 text-foreground",
        "hover:bg-primary/10 hover:border-primary/60",
        "hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
      ),
      ghost: cn(
        "bg-transparent text-foreground",
        "hover:bg-primary/10"
      ),
    };
    
    const sizeClasses = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };
    
    const glowClass = glow ? "pulse-glow" : "";

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          glowClass,
          className
        )}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Ripple effect container */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        
        {/* Light sweep effect */}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

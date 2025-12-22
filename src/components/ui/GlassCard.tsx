import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "interactive";
  category?: "infrastructure" | "academic" | "behavioral" | "technical" | "hostel" | "food" | "placement" | "other";
  glow?: boolean;
  children: React.ReactNode;
}

const categoryColors: Record<string, string> = {
  infrastructure: "glass-card-infrastructure",
  academic: "glass-card-academic",
  behavioral: "glass-card-behavioral",
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", category, glow, children, ...props }, ref) => {
    const baseClasses = "glass-card";
    const variantClasses = {
      default: "",
      elevated: "liquid-hover",
      interactive: "liquid-hover light-sweep cursor-pointer",
    };
    const categoryClass = category ? categoryColors[category] || "" : "";
    const glowClass = glow ? "pulse-glow" : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          categoryClass,
          glowClass,
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={variant === "interactive" ? { scale: 1.02 } : undefined}
        whileTap={variant === "interactive" ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

export const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

export const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

export const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

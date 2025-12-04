import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_0_15px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_25px_hsl(var(--destructive)/0.5)] hover:scale-105",
        outline: "border border-primary/40 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--secondary)/0.5)] hover:scale-105",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        neon: "bg-transparent border-2 border-primary text-primary shadow-[0_0_20px_hsl(var(--primary)/0.4),inset_0_0_20px_hsl(var(--primary)/0.1)] hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]",
        cyber: "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_60px_hsl(var(--secondary)/0.3)] hover:scale-105",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "touch-manipulation transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/92 hover:shadow-lg",
        cta: "bg-fti-orange text-fti-orange-foreground shadow-lg shadow-fti-orange/25 hover:bg-fti-orange/90 hover:shadow-xl focus-visible:ring-fti-orange/40",
        ctaSecondary:
          "border-2 border-primary/25 bg-card text-primary shadow-sm hover:border-primary/45 hover:bg-sky-50",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90",
        outline:
          "border-2 border-input bg-background shadow-sm hover:border-primary/30 hover:bg-sky-50/80 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85",
        ghost: "font-medium hover:bg-accent/15 hover:text-accent-foreground",
        link: "font-semibold text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 min-h-10 rounded-lg px-4 text-sm",
        sm: "h-9 min-h-9 rounded-lg px-3 text-xs",
        lg: "h-11 min-h-11 rounded-xl px-6 text-sm",
        xl: "h-12 min-h-12 rounded-xl px-7 text-base",
        /** Tối thiểu ~48px — dễ bấm trên mobile. */
        touch: "min-h-12 h-12 rounded-xl px-5 text-base sm:min-h-11 sm:h-11 sm:px-6 sm:text-sm",
        icon: "h-11 min-h-11 w-11 rounded-xl",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

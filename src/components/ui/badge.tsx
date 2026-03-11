import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0D7377] text-white",
        tier1: "border-[#6EE7B7] bg-[rgba(5,150,105,0.2)] text-[#34D399]",
        tier2: "border-[#FCD34D] bg-[rgba(217,119,6,0.2)] text-[#FCD34D]",
        tier3: "border-[#CBD5E1] bg-[rgba(100,116,139,0.2)] text-[#94A3B8]",
        disqualified: "border-[#FCA5A5] bg-[rgba(220,38,38,0.2)] text-[#FCA5A5]",
        incomplete: "border-[#64748B] bg-[rgba(100,116,139,0.1)] text-[#94A3B8]",
        gold: "border-[rgba(242,169,0,0.4)] bg-[rgba(242,169,0,0.15)] text-[#F2A900]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

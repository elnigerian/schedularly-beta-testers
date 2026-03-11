import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#D1DCE9] bg-[#FAFBFC] px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-[#64748B] transition-all",
          "focus:outline-none focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

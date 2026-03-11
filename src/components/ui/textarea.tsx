import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[#D1DCE9] bg-[#FAFBFC] px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-[#64748B] transition-all resize-none",
        "focus:outline-none focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Tooltip8Props {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export function Tooltip8({ children, content, className }: Tooltip8Props) {
  // Use a light background for both content and arrow
  const tooltipClass = className || "bg-neutral-200 text-neutral-950 dark:bg-neutral-50";
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={tooltipClass}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
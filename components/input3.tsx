import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Input3Props = React.ComponentProps<"input"> & {
  helperText?: string
  helperTextClassName?: string
}

function Input3({ className, helperText, helperTextClassName, value, ...props }: Input3Props) {
  return (
    <div className="w-full space-y-2">
      <Input className={className} value={value ?? ""} {...props} />
      {helperText ? <p className={cn("text-muted-foreground text-xs", helperTextClassName)}>{helperText}</p> : null}
    </div>
  )
}

export { Input3 }

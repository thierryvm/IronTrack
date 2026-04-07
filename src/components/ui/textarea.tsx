import * as React from"react"

import { cn} from"@/lib/utils"

function Textarea({ className, ...props}: React.ComponentProps<"textarea">) {
 return (
 <textarea
 data-slot="textarea"
 className={cn(
"field-premium placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-xl border px-4 py-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
 className
 )}
 {...props}
 />
 )
}

export { Textarea}

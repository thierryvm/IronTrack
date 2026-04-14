import { cn} from'@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?:'default' |'secondary' |'destructive' |'outline'
 children: React.ReactNode
}

export function Badge({ 
 className, 
 variant ='default', 
 children, 
 ...props 
}: BadgeProps) {
 return (
 <div
 className={cn(
'inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    'border-transparent bg-tertiary text-white hover:bg-tertiary-hover': variant === 'default',
    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80': variant === 'destructive',
    'text-foreground border-border': variant === 'outline',
  },
 className
 )}
 {...props}
 >
 {children}
 </div>
 )
}

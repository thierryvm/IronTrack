// 🎯 EXPORTS CENTRALISÉS SHADCN/UI + IRONTRACK
// Point d'entrée unique pour tous les composants UI

// Composants shadcn/ui migré avec features IronTrack
export { Button, buttonVariants } from './button'
export { Button as IronButton } from './button' // Alias pour migration
export type { ButtonProps } from './button'

// Autres composants shadcn/ui
export { Badge } from './badge'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Input } from './input'
export { Textarea } from './textarea'
export { Label } from './label'
export { Switch } from './switch'
export { Checkbox } from './checkbox'
export { RadioGroup, RadioGroupItem } from './radio-group'
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select'
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
export { Alert, AlertTitle, AlertDescription } from './alert'
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog'
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './dropdown-menu'
export { Popover, PopoverContent, PopoverTrigger } from './popover'
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table'
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form'
export { Progress } from './progress'
export { Slider } from './slider'
export { Toggle } from './toggle'

// Composants IronTrack custom (à migrer progressivement)
export { Avatar } from './Avatar'
// Note: Button2025, Modal2025, etc. seront progressivement remplacés par les versions shadcn améliorées
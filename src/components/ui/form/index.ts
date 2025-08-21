/**
 * Export centralisé des composants de formulaire réutilisables
 * Migré vers shadcn/ui avec accessibilité WCAG AA
 */

// Composants shadcn/ui standards
export { Button } from '../button'
export { Input } from '../input'
export { Textarea } from '../textarea'
export { Label } from '../label'
export { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '../select'

// Composants de formulaire shadcn/ui
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../form'

// Composants custom locaux (si nécessaires)
export * from './FormField'
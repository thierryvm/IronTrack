import { cn} from'@/utils/cn'

describe('cn utility function', () => {
 it('should merge class names correctly', () => {
 const result = cn('px-2 py-1','text-white')
 expect(result).toBe('px-2 py-1 text-white')
})

 it('should handle conflicting Tailwind classes', () => {
 const result = cn('px-2 px-4','py-1 py-2')
 expect(result).toBe('px-4 py-2') // twMerge should resolve conflicts
})

 it('should handle conditional classes', () => {
 const isActive = true
 const result = cn('base-class', isActive &&'active-class')
 expect(result).toBe('base-class active-class')
})

 it('should handle false/null/undefined values', () => {
 const result = cn('base-class', false, null, undefined,'valid-class')
 expect(result).toBe('base-class valid-class')
})

 it('should handle empty input', () => {
 const result = cn()
 expect(result).toBe('')
})

 it('should handle array inputs', () => {
 const result = cn(['class1','class2'],'class3')
 expect(result).toBe('class1 class2 class3')
})

 it('should handle object inputs', () => {
 const result = cn({
'active': true,
'disabled': false,
'highlighted': true
})
 expect(result).toBe('active highlighted')
})
})
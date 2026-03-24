import React from'react'
import { Minus, Plus} from'lucide-react'

interface NumberInputProps {
 value: number
 onChange: (value: number) => void
 min?: number
 max?: number
 step?: number
 label?: string
 className?: string
}

export const NumberInput: React.FC<NumberInputProps> = ({
 value,
 onChange,
 min = 1,
 max = 30,
 step = 1,
 label,
 className =''
}) => {
 const handleDecrement = () => {
 const newValue = Math.max(min, value - step)
 onChange(newValue)
}

 const handleIncrement = () => {
 const newValue = Math.min(max, value + step)
 onChange(newValue)
}

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const newValue = parseInt(e.target.value, 10)
 if (!isNaN(newValue) && newValue >= min && newValue <= max) {
 onChange(newValue)
}
}

 return (
 <div className={`space-y-2 ${className}`}>
 {label && (
 <label className="block text-sm font-medium text-gray-700">
 {label}
 </label>
 )}
 <div className="flex items-center space-x-2">
 <button
 type="button"
 onClick={handleDecrement}
 disabled={value <= min}
 className="flex items-center justify-center w-10 h-10 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
 >
 <Minus className="w-4 h-4 text-muted-foreground" />
 </button>
 
 <div className="flex-1 max-w-[80px]">
 <input
 type="number"
 value={value}
 onChange={handleInputChange}
 min={min}
 max={max}
 className="w-full px-2 py-2 text-center text-lg font-semibold border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
 />
 </div>
 
 <button
 type="button"
 onClick={handleIncrement}
 disabled={value >= max}
 className="flex items-center justify-center w-10 h-10 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
 >
 <Plus className="w-4 h-4 text-muted-foreground" />
 </button>
 </div>
 
 <div className="text-xs text-muted-foreground text-center">
 {min} - {max} {label?.toLowerCase() ||''}
 </div>
 </div>
 )
}
import { cn } from '@/utils/cn'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
}

export function Slider({ 
  value, 
  onValueChange, 
  max = 100, 
  min = 0, 
  step = 1, 
  className, 
  ...props 
}: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    onValueChange([newValue])
  }

  return (
    <div className={cn('relative flex items-center select-none touch-none', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || min}
        onChange={handleChange}
        className="relative flex-1 cursor-pointer appearance-none bg-transparent focus:outline-none disabled:pointer-events-none disabled:opacity-50 h-5 w-full rounded-lg bg-gray-200 dark:bg-gray-700 slider-thumb"
        {...props}
      />
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
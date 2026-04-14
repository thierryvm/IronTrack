'use client'

import { useState, useEffect, useRef} from'react'
import { Check, X, Edit2} from'lucide-react'

interface InlineEditFieldProps {
 value: string | number | null | undefined
 onSave: (value: string | number) => Promise<void>
 type?:'text' |'number' |'select'
 options?: Array<{ value: string; label: string}>
 placeholder?: string
 label?: string
 unit?: string
 min?: number
 max?: number
 step?: number
 className?: string
 displayValue?: string | number
}

export function InlineEditField({
 value,
 onSave,
 type ='text',
 options = [],
 placeholder ='Non renseigné',
 label,
 unit,
 min,
 max,
 step,
 className ='',
 displayValue
}: InlineEditFieldProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [editValue, setEditValue] = useState('')
 const [loading, setSaving] = useState(false)
 const [error, setError] = useState('')
 const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

 useEffect(() => {
 if (isEditing && inputRef.current) {
 inputRef.current.focus()
}
}, [isEditing])

 const startEdit = () => {
 setEditValue(String(value ||''))
 setIsEditing(true)
 setError('')
}

 const cancelEdit = () => {
 setIsEditing(false)
 setEditValue('')
 setError('')
}

 const saveEdit = async () => {
 if (!editValue.trim() && type ==='text') {
 setError('La valeur ne peut pas être vide')
 return
}

 setSaving(true)
 setError('')

 try {
 let valueToSave: string | number = editValue.trim()
 
 if (type ==='number') {
 const numValue = parseFloat(editValue)
 if (isNaN(numValue)) {
 setError('Veuillez entrer un nombre valide')
 setSaving(false)
 return
}
 if (min !== undefined && numValue < min) {
 setError(`La valeur doit être supérieure à ${min}`)
 setSaving(false)
 return
}
 if (max !== undefined && numValue > max) {
 setError(`La valeur doit être inférieure à ${max}`)
 setSaving(false)
 return
}
 valueToSave = numValue
}

 await onSave(valueToSave)
 setIsEditing(false)
 setEditValue('')
} catch (err) {
 setError(err instanceof Error ? err.message :'Erreur lors de la sauvegarde')
} finally {
 setSaving(false)
}
}

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key ==='Enter') {
 saveEdit()
} else if (e.key ==='Escape') {
 cancelEdit()
}
}

 const displayCurrentValue = () => {
 const currentValue = displayValue !== undefined ? displayValue : value
 
 if (currentValue === null || currentValue === undefined || currentValue ==='' || currentValue === 0) {
 return <span className="italic text-muted-foreground text-sm">{placeholder}</span>
}
 
 return (
 <div className="flex flex-col">
 <span className="font-bold text-foreground text-lg">
 {currentValue}{unit && ` ${unit}`}
 </span>
 {unit && type ==='number' && (
 <span className="text-xs text-muted-foreground">Cliquer pour modifier</span>
 )}
 </div>
 )
}

 if (isEditing) {
 return (
 <div className={`space-y-2 relative z-50 ${className}`}>
 {label && (
 <label className="block text-sm font-medium text-gray-700">
 {label}
 </label>
 )}
 
 <div className="flex items-center gap-2">
 {type ==='select' ? (
 <select
 ref={inputRef as React.RefObject<HTMLSelectElement>}
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onKeyDown={handleKeyPress}
 className="flex-1 px-2 py-2 border border-tertiary/35 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary bg-card border border-border relative z-50"
 disabled={loading}
 >
 <option value="">Sélectionner...</option>
 {options.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 ) : (
 <div className="flex items-center flex-1">
 <input
 ref={inputRef as React.RefObject<HTMLInputElement>}
 type={type ==='number' ?'number' :'text'}
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onKeyDown={handleKeyPress}
 min={min}
 max={max}
 step={step}
 className="flex-1 px-2 py-2 border border-tertiary/35 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary bg-card border border-border relative z-50"
 disabled={loading}
 placeholder={placeholder}
 />
 {unit && (
 <span className="ml-2 text-muted-foreground font-medium text-sm">{unit}</span>
 )}
 </div>
 )}
 
 <button
 onClick={saveEdit}
 disabled={loading}
 className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 border border-green-200 relative z-50 shadow-lg bg-card border border-border"
 >
 <Check className="h-6 w-6" />
 </button>
 
 <button
 onClick={cancelEdit}
 disabled={loading}
 className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 border border-red-200 relative z-50 shadow-lg bg-card border border-border"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 
 {error && (
 <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 relative z-50">{error}</p>
 )}
 </div>
 )
}

 return (
 <div className={`group h-full ${className}`}>
 {label && (
 <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
 )}
 
 <div 
 className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-card transition-all duration-200 min-h-[2.5rem] group-hover:shadow-sm"
 onClick={startEdit}
 >
 <div className="flex-1">
 {displayCurrentValue()}
 </div>
 
 <Edit2 className="h-6 w-6 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
 </div>
 </div>
 )
}
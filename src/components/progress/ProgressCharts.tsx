'use client'

import { useState, useEffect} from'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from'recharts'

interface ProgressData {
 date: string
 weight: number
 reps: number
 sets: number
 exercise: string
}

interface MuscleGroupData {
 name: string
 value: number
 color: string
}

interface ProgressChartsProps {
 progressData?: ProgressData[]
 muscleGroupData?: MuscleGroupData[]
 chartType:'line' |'pie'
 selectedExercise?: string
}

const progressTextToneByName: Record<string, string> = {
 'Poids (kg)': 'text-orange-400',
 'Pectoraux': 'text-[#FF6B6B]',
 'Dos': 'text-[#4ECDC4]',
 'Épaules': 'text-[#45B7D1]',
 'Biceps': 'text-[#96CEB4]',
 'Triceps': 'text-[#FFEAA7]',
 'Jambes': 'text-[#DDA0DD]',
 'Abdominaux': 'text-[#98D8C8]',
 'Fessiers': 'text-[#F7DC6F]',
}

const progressBgToneByName: Record<string, string> = {
 'Pectoraux': 'bg-[#FF6B6B]',
 'Dos': 'bg-[#4ECDC4]',
 'Épaules': 'bg-[#45B7D1]',
 'Biceps': 'bg-[#96CEB4]',
 'Triceps': 'bg-[#FFEAA7]',
 'Jambes': 'bg-[#DDA0DD]',
 'Abdominaux': 'bg-[#98D8C8]',
 'Fessiers': 'bg-[#F7DC6F]',
}

// Composant tooltip personnalisé pour la lisibilité dark mode
const CustomTooltip = ({ active, payload, label, isDark}: {
 active?: boolean
 payload?: Array<{ value: number; name: string; color: string}>
 label?: string
 isDark: boolean
}) => {
 if (!active || !payload || payload.length === 0) return null

 return (
 <div
 className={`rounded-lg border px-3.5 py-2.5 text-[13px] shadow-lg ${
 isDark
 ? 'border-slate-700 bg-slate-800 text-slate-50'
 : 'border-slate-200 bg-white text-slate-900'
 }`}
 >
 {label && (
 <p className={`mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
 {label}
 </p>
 )}
 {payload.map((entry, index) => (
 <p key={index} className={`my-0.5 ${progressTextToneByName[entry.name] ?? (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
 {entry.name}: <strong>{entry.value}</strong>
 </p>
 ))}
 </div>
 )
}

// Tooltip pour le pie chart
const CustomPieTooltip = ({ active, payload, isDark}: {
 active?: boolean
 payload?: Array<{ name: string; value: number; payload: { color: string}}>
 isDark: boolean
}) => {
 if (!active || !payload || payload.length === 0) return null

 const entry = payload[0]
 return (
 <div
 className={`rounded-lg border px-3.5 py-2.5 text-[13px] shadow-lg ${
 isDark
 ? 'border-slate-700 bg-slate-800 text-slate-50'
 : 'border-slate-200 bg-white text-slate-900'
 }`}
 >
 <p className={`font-semibold ${progressTextToneByName[entry.name] ?? 'text-primary'}`}>
 {entry.name}
 </p>
 <p className={isDark ? 'text-slate-300' : 'text-slate-500'}>
 {entry.value} séance{entry.value > 1 ?'s' :''}
 </p>
 </div>
 )
}

// Légende personnalisée du pie chart
const CustomLegend = ({ data, isDark}: { data: MuscleGroupData[]; isDark: boolean}) => (
 <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 px-2">
 {data.map((entry, index) => (
 <div key={index} className="flex items-center gap-1">
 <div
 className={`w-3 h-3 rounded-full flex-shrink-0 ${progressBgToneByName[entry.name] ?? 'bg-primary'}`}
 />
 <span
 className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
 >
 {entry.name} ({entry.value})
 </span>
 </div>
 ))}
 </div>
)

export default function ProgressCharts({ 
 progressData = [], 
 muscleGroupData = [], 
 chartType, 
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 selectedExercise 
}: ProgressChartsProps) {
 const [isDark, setIsDark] = useState(false)

 useEffect(() => {
 const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
 checkDark()
 const observer = new MutationObserver(checkDark)
 observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class']})
 return () => observer.disconnect()
}, [])

 const axisColor = isDark ?'#9ca3af' :'#6b7280'
 const gridColor = isDark ?'#374151' :'#e5e7eb'
 
 if (chartType ==='line') {
 if (progressData.length === 0) {
 return (
 <div className="text-center py-12 text-gray-600">
 <div className="text-6xl mb-4">📈</div>
 <p className="text-lg font-medium mb-2">Pas encore de données de progression</p>
 <span className="block">Ajoute plus de séances pour voir ta progression !</span>
 </div>
 )
}

 return (
 <div className="border border-border rounded-lg p-4 bg-card">
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={progressData}>
 <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} />
 <XAxis 
 dataKey="date" 
 fontSize={12}
 tick={{ fill: axisColor}}
 />
 <YAxis 
 fontSize={12}
 tick={{ fill: axisColor}}
 />
 <Tooltip
 content={(props) => (
 <CustomTooltip
 active={props.active}
 payload={props.payload as unknown as Array<{ value: number; name: string; color: string}>}
 label={props.label as string}
 isDark={isDark}
 />
 )}
 labelFormatter={(label) => `Date: ${label}`}
 formatter={(value) => [`${value} kg`,'Poids']}
 />
 <Line 
 type="monotone" 
 dataKey="weight" 
 stroke="#f97316" 
 strokeWidth={3}
 dot={{ fill:'#f97316', strokeWidth: 2, r: 4}}
 name="Poids (kg)"
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 )
}

 if (chartType ==='pie') {
 if (muscleGroupData.length === 0) {
 return (
 <div className="text-center py-12 text-gray-600">
 <div className="text-6xl mb-4">💪</div>
 <p className="text-lg font-medium mb-2">Aucune donnée de groupe musculaire</p>
 <span className="block">Commence à t&apos;entraîner pour voir la répartition !</span>
 </div>
 )
}

 return (
 <div className="border border-border rounded-lg p-4 bg-card">
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie
 data={muscleGroupData}
 cx="50%"
 cy="50%"
 outerRadius={100}
 dataKey="value"
 stroke="none"
 label={({ name, percent}: { name?: string; percent?: number}) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
 labelLine={{ stroke: axisColor}}
 >
 {muscleGroupData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 content={(props) => (
 <CustomPieTooltip
 active={props.active}
 payload={props.payload as unknown as Array<{ name: string; value: number; payload: { color: string}}>}
 isDark={isDark}
 />
 )}
 />
 </PieChart>
 </ResponsiveContainer>
 <CustomLegend data={muscleGroupData} isDark={isDark} />
 </div>
 )
}

 return null
}


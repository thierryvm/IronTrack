'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface MacroData {
  name: string
  value: number
  color: string
}

interface WeeklyData {
  day: string
  calories: number
  protein: number
}

interface NutritionChartsProps {
  macroData: MacroData[]
  weeklyData: WeeklyData[]
  showWeekly: boolean
}

export default function NutritionCharts({ macroData, weeklyData, showWeekly }: NutritionChartsProps) {
  if (showWeekly) {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              fontSize={12}
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="calories" fill="#F97316" name="Calories" radius={[2, 2, 0, 0]} />
            <Bar dataKey="protein" fill="#3B82F6" name="Protéines (g)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (macroData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée nutritionnelle à afficher
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-64 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={macroData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              stroke="none"
              strokeWidth={0}
            >
              {macroData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${Math.round(Number(value) * 10) / 10}g`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="ml-6 space-y-3">
        {macroData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {item.name}: {Math.round(item.value * 10) / 10}g
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
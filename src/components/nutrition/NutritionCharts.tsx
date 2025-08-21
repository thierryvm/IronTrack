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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-300 dark:stroke-gray-600"
              opacity={0.5}
            />
            <XAxis 
              dataKey="day" 
              fontSize={12}
              tick={{ fill: '#6B7280' }}
              className="fill-gray-600 dark:fill-gray-400"
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#6B7280' }}
              className="fill-gray-600 dark:fill-gray-400"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--foreground)'
              }}
            />
            <Legend />
            <Bar dataKey="calories" fill="#F97316" name="Calories" radius={[2, 2, 0, 0]} />
            <Bar dataKey="protein" fill="#3B82F6" name="Protéines (g)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (macroData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
        Aucune donnée nutritionnelle à afficher
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
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
            <Tooltip 
              formatter={(value, name) => [`${Math.round(Number(value) * 10) / 10}g`, name]}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--foreground)'
              }}
            />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-6 space-y-3">
          {macroData.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}: {Math.round(item.value * 10) / 10}g
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
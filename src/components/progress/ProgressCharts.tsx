'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  chartType: 'line' | 'pie'
  selectedExercise?: string
}

export default function ProgressCharts({ 
  progressData = [], 
  muscleGroupData = [], 
  chartType, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedExercise 
}: ProgressChartsProps) {
  
  if (chartType === 'line') {
    if (progressData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-600 dark:text-safe-muted">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-lg font-medium mb-2">Pas encore de données de progression</p>
          <span className="block">Ajoute plus de séances pour voir ta progression !</span>
        </div>
      )
    }

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-300 dark:stroke-gray-600"
            opacity={0.5}
          />
          <XAxis 
            dataKey="date" 
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
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => [`${value} kg`, 'Poids']}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: 'var(--foreground)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#f97316" 
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'pie') {
    if (muscleGroupData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-600 dark:text-safe-muted">
          <div className="text-6xl mb-4">💪</div>
          <p className="text-lg font-medium mb-2">Aucune donnée de groupe musculaire</p>
          <span className="block">Commence à t'entraîner pour voir la répartition !</span>
        </div>
      )
    }

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
          <Pie
            data={muscleGroupData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            {muscleGroupData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} séances`, name]}
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
    )
  }

  return null
}
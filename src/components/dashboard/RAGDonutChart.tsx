import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface RAGCount {
  green: number
  amber: number
  red: number
}

interface RAGDonutChartProps {
  ragCounts: RAGCount
  onFilterChange?: (filter: 'all' | 'green' | 'amber' | 'red') => void
}

export default function RAGDonutChart({ ragCounts, onFilterChange }: RAGDonutChartProps) {
  const total = ragCounts.green + ragCounts.amber + ragCounts.red

  const data = [
    { name: 'Green', value: ragCounts.green, color: '#00703c' },
    { name: 'Amber', value: ragCounts.amber, color: '#f47738' },
    { name: 'Red', value: ragCounts.red, color: '#d4351c' },
  ].filter(item => item.value > 0) // Only show segments with values

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    if (percent < 0.05) return null // Hide labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const handleClick = (entry: any) => {
    if (onFilterChange) {
      onFilterChange(entry.name.toLowerCase() as 'green' | 'amber' | 'red')
    }
  }

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        RAG Distribution
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              'Count',
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const count = entry.payload.value
              const percentage = ((count / total) * 100).toFixed(0)
              return `${value}: ${count} (${percentage}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-text-secondary">
        Click on a segment to filter
      </div>
    </div>
  )
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Assessment {
  rag_rating: 'green' | 'amber' | 'red' | 'pending'
  assessment_criteria: {
    dimension: string
  }
}

interface DimensionBarChartProps {
  assessments: Assessment[]
  onDimensionClick?: (dimension: string) => void
}

export default function DimensionBarChart({
  assessments,
  onDimensionClick,
}: DimensionBarChartProps) {
  // Calculate statistics by dimension
  const dimensionStats: {
    [key: string]: { green: number; amber: number; red: number; total: number }
  } = {}

  assessments.forEach((a) => {
    const dim = a.assessment_criteria.dimension
    if (!dimensionStats[dim]) {
      dimensionStats[dim] = { green: 0, amber: 0, red: 0, total: 0 }
    }
    dimensionStats[dim].total++
    if (a.rag_rating === 'green') dimensionStats[dim].green++
    else if (a.rag_rating === 'amber') dimensionStats[dim].amber++
    else if (a.rag_rating === 'red') dimensionStats[dim].red++
  })

  // Convert to array format for recharts
  const data = Object.entries(dimensionStats).map(([dimension, counts]) => ({
    dimension:
      dimension.length > 12 ? dimension.substring(0, 12) + '...' : dimension,
    fullDimension: dimension,
    Green: counts.green,
    Amber: counts.amber,
    Red: counts.red,
    total: counts.total,
  }))

  // Sort by total count descending
  data.sort((a, b) => b.total - a.total)

  const handleBarClick = (data: any) => {
    if (onDimensionClick && data) {
      onDimensionClick(data.fullDimension)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-text-primary mb-2">
            {data.fullDimension}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rag-green"></div>
              <span>Green: {data.Green}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rag-amber"></div>
              <span>Amber: {data.Amber}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rag-red"></div>
              <span>Red: {data.Red}</span>
            </div>
            <div className="pt-1 mt-1 border-t border-gray-200 font-semibold">
              Total: {data.total}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Assessment by Dimension
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis
            dataKey="dimension"
            type="category"
            stroke="#6b7280"
            width={75}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
          <Bar
            dataKey="Green"
            stackId="a"
            fill="#00703c"
            onClick={handleBarClick}
            className="cursor-pointer hover:opacity-80"
          />
          <Bar
            dataKey="Amber"
            stackId="a"
            fill="#f47738"
            onClick={handleBarClick}
            className="cursor-pointer hover:opacity-80"
          />
          <Bar
            dataKey="Red"
            stackId="a"
            fill="#d4351c"
            onClick={handleBarClick}
            className="cursor-pointer hover:opacity-80"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-text-secondary">
        Click on a bar to filter by dimension
      </div>
    </div>
  )
}

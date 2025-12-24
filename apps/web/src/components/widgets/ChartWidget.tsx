import { Card } from '../ui/Card'
import { TrendingUp } from 'lucide-react'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface ChartWidgetProps {
  title: string
  data: ChartDataPoint[]
  type?: 'bar' | 'line'
}

export function ChartWidget({ title, data }: ChartWidgetProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  const getDefaultColor = (index: number) => {
    const colors = [
      'bg-primary-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
    ]
    return colors[index % colors.length]
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+12%</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700">{item.label}</span>
              <span className="font-semibold text-neutral-900">{item.value}</span>
            </div>
            <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  item.color || getDefaultColor(index)
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '../ui/Card'

interface StatsWidgetProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'red'
}

export function StatsWidget({ title, value, change, icon, color = 'primary' }: StatsWidgetProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          iconBg: 'bg-green-500',
        }
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          iconBg: 'bg-blue-500',
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          iconBg: 'bg-yellow-500',
        }
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          iconBg: 'bg-red-500',
        }
      default:
        return {
          bg: 'bg-primary-100',
          text: 'text-primary-600',
          iconBg: 'bg-primary-500',
        }
    }
  }

  const colors = getColorClasses(color)

  const getTrendIcon = () => {
    if (change === undefined || change === null) return null
    if (change > 0)
      return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0)
      return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-neutral-400" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === null) return ''
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-neutral-400'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-neutral-900 mb-2">{value}</h3>
          {change !== undefined && change !== null && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-neutral-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center`}>
          <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  )
}

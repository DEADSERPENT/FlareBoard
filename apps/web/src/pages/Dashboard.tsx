import { Card } from '@/components/ui/Card'
import { LayoutDashboard } from 'lucide-react'

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Customize your dashboard view</p>
      </div>

      <Card className="text-center py-16">
        <LayoutDashboard className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Dashboard Customization
        </h3>
        <p className="text-neutral-600 max-w-md mx-auto">
          The drag-and-drop widget system is coming soon. You'll be able to customize your
          dashboard with charts, KPIs, and custom widgets.
        </p>
      </Card>
    </div>
  )
}

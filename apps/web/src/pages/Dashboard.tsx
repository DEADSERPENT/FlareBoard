import { useState, useEffect } from 'react'
import { FolderKanban, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { StatsWidget } from '../components/widgets/StatsWidget'
import { ChartWidget } from '../components/widgets/ChartWidget'
import { ActivityWidget } from '../components/widgets/ActivityWidget'
import { TaskListWidget } from '../components/widgets/TaskListWidget'
import { useAuth } from '../contexts/AuthContext'

interface Stats {
  totalProjects: number
  activeTasks: number
  completedTasks: number
  completionRate: number
}

export const DashboardPage = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  })
  const [tasks, setTasks] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsRes = await fetch('http://localhost:3000/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const projectsData = await projectsRes.json()
      const projects = projectsData.success ? projectsData.data : []

      // Fetch tasks
      const tasksRes = await fetch('http://localhost:3000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const tasksData = await tasksRes.json()
      const allTasks = tasksData.success ? tasksData.data : []

      // Calculate stats
      const activeTasks = allTasks.filter((t: any) => t.status !== 'Done').length
      const completedTasks = allTasks.filter((t: any) => t.status === 'Done').length
      const completionRate =
        allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0

      setStats({
        totalProjects: projects.length,
        activeTasks,
        completedTasks,
        completionRate,
      })

      // Set tasks for task list widget
      setTasks(allTasks.filter((t: any) => t.status !== 'Done').slice(0, 5))

      // Prepare chart data - tasks by status
      const tasksByStatus = [
        { label: 'To Do', value: allTasks.filter((t: any) => t.status === 'Todo').length },
        {
          label: 'In Progress',
          value: allTasks.filter((t: any) => t.status === 'In Progress').length,
        },
        { label: 'Done', value: completedTasks },
      ]
      setChartData(tasksByStatus)

      // Generate mock activities (replace with real activity log later)
      const mockActivities = [
        {
          id: '1',
          type: 'task_completed' as const,
          message: 'completed a task',
          user: 'You',
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          type: 'task_created' as const,
          message: 'created a new task',
          user: 'You',
          timestamp: '4 hours ago',
        },
        {
          id: '3',
          type: 'project_created' as const,
          message: 'created a new project',
          user: 'You',
          timestamp: '1 day ago',
        },
      ]
      setActivities(mockActivities)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Overview of your projects and tasks</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="Total Projects"
          value={stats.totalProjects}
          change={12}
          icon={<FolderKanban className="w-5 h-5" />}
          color="primary"
        />
        <StatsWidget
          title="Active Tasks"
          value={stats.activeTasks}
          change={5}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatsWidget
          title="Completed Tasks"
          value={stats.completedTasks}
          change={8}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatsWidget
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          change={3}
          icon={<TrendingUp className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="Tasks by Status" data={chartData} />
        <ActivityWidget title="Recent Activity" activities={activities} />
      </div>

      {/* Task List */}
      <TaskListWidget title="Active Tasks" tasks={tasks} maxItems={8} />
    </div>
  )
}

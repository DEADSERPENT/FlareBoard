import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { useUsers } from '@/hooks/useUsers'
import { useTasks } from '@/hooks/useTasks'
import { Users, CheckCircle2, Clock, Circle } from 'lucide-react'

export const TeamPage = () => {
  const { data: users = [], isLoading } = useUsers()
  const { data: tasks = [] } = useTasks()

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-amber-100 text-amber-700'
      case 'Member':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-neutral-100 text-neutral-600'
    }
  }

  const memberStats = useMemo(() => {
    return users.map((user) => {
      const assigned = tasks.filter((t: any) => t.assignedTo === user.id)
      const completed = assigned.filter((t: any) => t.status === 'Done').length
      const active = assigned.filter((t: any) => t.status !== 'Done').length
      return { ...user, assigned: assigned.length, completed, active }
    })
  }, [users, tasks])

  const totalStats = useMemo(() => ({
    total: users.length,
    totalAssigned: tasks.length,
    totalCompleted: tasks.filter((t: any) => t.status === 'Done').length,
  }), [users, tasks])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Team</h1>
        <p className="text-neutral-600 mt-1">Your team members and their current workload</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Team Size</p>
              <p className="text-2xl font-bold text-neutral-900">{totalStats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Circle className="w-5 h-5 text-green-600 fill-green-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Active Tasks</p>
              <p className="text-2xl font-bold text-neutral-900">
                {totalStats.totalAssigned - totalStats.totalCompleted}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total Tasks</p>
              <p className="text-2xl font-bold text-neutral-900">{totalStats.totalAssigned}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Completed</p>
              <p className="text-2xl font-bold text-neutral-900">{totalStats.totalCompleted}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberStats.map((member) => {
          const completionRate =
            member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0

          return (
            <Card key={member.id} className="card-hover">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-orange flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials(member.fullName)}
                    </div>
                  )}
                  {/* Presence dot */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-neutral-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-neutral-900 truncate">{member.fullName}</h3>
                      <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getRoleBadge(
                        member.role?.name
                      )}`}
                    >
                      {member.role?.name ?? 'Member'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-neutral-900">{member.assigned}</p>
                      <p className="text-xs text-neutral-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{member.active}</p>
                      <p className="text-xs text-neutral-500">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{member.completed}</p>
                      <p className="text-xs text-neutral-500">Done</p>
                    </div>
                  </div>

                  {member.assigned > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span>{completionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-orange rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                <span>{member.email}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {users.length === 0 && (
        <Card className="text-center py-16">
          <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No team members yet</h3>
          <p className="text-neutral-600">Invite your team to start collaborating</p>
        </Card>
      )}
    </div>
  )
}

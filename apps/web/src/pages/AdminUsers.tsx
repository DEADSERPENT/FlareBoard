import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Trash2, Users, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'

const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-amber-100 text-amber-700',
  Member: 'bg-blue-100 text-blue-700',
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.adminGetAllUsers()
      return res.data ?? []
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      api.adminUpdateUserRole(userId, roleName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.adminDeleteUser(userId),
    onSuccess: () => {
      setConfirmDelete(null)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const handleRoleChange = (userId: string, roleName: string) => {
    roleMutation.mutate({ userId, roleName })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading users...</p>
        </div>
      </div>
    )
  }

  const adminCount = users.filter((u: any) => u.role?.name === 'Admin').length
  const memberCount = users.filter((u: any) => u.role?.name === 'Member').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <h1 className="text-3xl font-bold text-neutral-900">Users Management</h1>
        </div>
        <p className="text-neutral-600">Manage user accounts and roles across FlareBoard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total Users</p>
              <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Admins</p>
              <p className="text-2xl font-bold text-neutral-900">{adminCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Members</p>
              <p className="text-2xl font-bold text-neutral-900">{memberCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Tasks</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Joined</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-orange flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(user.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-900">{user.fullName}</p>
                          {isSelf && <p className="text-xs text-primary-500">you</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                    <td className="py-3 px-4">
                      {isSelf ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[user.role?.name] ?? 'bg-neutral-100 text-neutral-600'}`}>
                          {user.role?.name ?? 'Member'}
                        </span>
                      ) : (
                        <div className="relative inline-block">
                          <select
                            value={user.role?.name ?? 'Member'}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            disabled={roleMutation.isPending}
                            className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300 ${ROLE_BADGE[user.role?.name] ?? 'bg-neutral-100 text-neutral-600'}`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {user._count?.assignedTasks ?? 0}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isSelf && (
                        <>
                          {confirmDelete === user.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => deleteMutation.mutate(user.id)}
                                disabled={deleteMutation.isPending}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

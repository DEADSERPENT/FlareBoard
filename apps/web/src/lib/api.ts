import type { ApiResponse, Project, Task, Notification, User } from '@flareboard/types'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_URL = API_BASE

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const data = await response.json()
    return data
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, fullName: string) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    })
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me')
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/projects')
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`)
  }

  async createProject(data: Partial<Project>) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Tasks
  async getTasks(projectId?: string) {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.request<Task[]>(`/tasks${query}`)
  }

  async getTask(id: string) {
    return this.request<Task>(`/tasks/${id}`)
  }

  async createTask(data: Partial<Task>) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  async getDeletedTasks(projectId?: string) {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.request<Task[]>(`/tasks/deleted${query}`)
  }

  async restoreTask(id: string) {
    return this.request<Task>(`/tasks/${id}/restore`, {
      method: 'POST',
    })
  }

  // Notifications
  async getNotifications(params?: { unreadOnly?: boolean; category?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams()
    if (params?.unreadOnly) query.append('unreadOnly', 'true')
    if (params?.category) query.append('category', params.category)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    const queryString = query.toString()
    return this.request<{ notifications: Notification[]; total: number; unreadCount: number }>(
      `/notifications${queryString ? `?${queryString}` : ''}`
    )
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count')
  }

  async markNotificationAsRead(id: string) {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead() {
    return this.request<{ count: number }>('/notifications/mark-all-read', {
      method: 'POST',
    })
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  async clearReadNotifications() {
    return this.request<{ count: number }>('/notifications/clear-read', {
      method: 'DELETE',
    })
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users')
  }

  async getActivity(entityType?: string, limit = 50) {
    const query = new URLSearchParams()
    if (entityType && entityType !== 'all') query.append('entityType', entityType)
    query.append('limit', limit.toString())
    return this.request<any>(`/activity?${query.toString()}`)
  }

  // Admin
  async adminGetAllUsers() {
    return this.request<any[]>('/users/admin/all')
  }

  async adminUpdateUserRole(userId: string, roleName: string) {
    return this.request<any>(`/users/admin/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ roleName }),
    })
  }

  async adminDeleteUser(userId: string) {
    return this.request<any>(`/users/admin/${userId}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()

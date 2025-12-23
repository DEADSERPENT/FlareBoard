import type { ApiResponse, Project, Task, Notification, User } from '@nebula/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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

  // Notifications
  async getNotifications() {
    return this.request<Notification[]>('/notifications')
  }

  async markAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'POST',
    })
  }
}

export const api = new ApiClient()

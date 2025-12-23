// ============================================
// USERS & AUTH
// ============================================

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  roleId: string
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id: string
  name: 'Admin' | 'Manager' | 'Viewer'
  permissions: Record<string, boolean>
}

export interface AuthTokenPayload {
  userId: string
  roleId: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

// ============================================
// PROJECTS & TASKS
// ============================================

export type ProjectStatus = 'Active' | 'Archived' | 'Planning'
export type TaskStatus = 'Todo' | 'InProgress' | 'Done' | 'Blocked'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  dueDate?: Date
  position: number // for Kanban column ordering
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    fullName: string
    avatarUrl?: string
  }
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: string
  createdAt: Date
  uploader?: {
    id: string
    fullName: string
  }
}

export interface CreateTaskRequest {
  projectId: string
  title: string
  description?: string
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: Date
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: Date
  position?: number
}

// ============================================
// DASHBOARDS & WIDGETS
// ============================================

export type WidgetType = 'KPI' | 'LineChart' | 'BarChart' | 'PieChart' | 'Feed' | 'Table'

export interface LayoutConfig {
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export interface Dashboard {
  id: string
  userId: string
  name: string
  isDefault: boolean
  layoutConfig: Record<string, LayoutConfig> // widgetId -> position
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  dashboardId: string
  type: WidgetType
  title: string
  settings: Record<string, any> // flexible config per widget type
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface WidgetSettings {
  // KPI Widget
  kpi?: {
    value: number
    label: string
    trend?: number
    format?: 'number' | 'currency' | 'percentage'
  }
  // Chart Widgets
  chart?: {
    dataSource: string
    xAxis: string
    yAxis: string
    colors?: string[]
  }
  // Feed Widget
  feed?: {
    source: 'activity' | 'notifications'
    limit: number
  }
}

// ============================================
// NOTIFICATIONS & ACTIVITY
// ============================================

export type ActivityAction =
  | 'project.created'
  | 'project.updated'
  | 'project.archived'
  | 'task.created'
  | 'task.moved'
  | 'task.completed'
  | 'task.assigned'
  | 'user.invited'
  | 'user.joined'

export interface ActivityLog {
  id: string
  userId: string
  action: ActivityAction
  entityType: 'project' | 'task' | 'user' | 'dashboard'
  entityId: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title?: string
  message?: string
  content: string
  isRead: boolean
  actionUrl?: string
  createdAt: Date
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================
// WEBSOCKET EVENTS
// ============================================

export type SocketEvent =
  | { type: 'task.updated'; payload: Task }
  | { type: 'task.created'; payload: Task }
  | { type: 'task.deleted'; payload: { id: string; projectId: string } }
  | { type: 'notification.new'; payload: Notification }
  | { type: 'dashboard.refresh'; payload: { dashboardId: string } }
  | { type: 'user.online'; payload: { userId: string } }
  | { type: 'user.offline'; payload: { userId: string } }

export interface SocketEventMap {
  'task.updated': Task
  'task.created': Task
  'task.deleted': { id: string; projectId: string }
  'notification.new': Notification
  'dashboard.refresh': { dashboardId: string }
  'user.online': { userId: string }
  'user.offline': { userId: string }
}

// ============================================
// SETTINGS & PREFERENCES
// ============================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'quantum'
  defaultDashboard?: string
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  timezone: string
}

// ============================================
// ANALYTICS
// ============================================

export interface AnalyticsData {
  metric: string
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface KPIData {
  label: string
  value: number
  previousValue?: number
  trend?: number
  format: 'number' | 'currency' | 'percentage'
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

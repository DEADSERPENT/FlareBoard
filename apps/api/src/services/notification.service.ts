import { prisma } from '../lib/prisma'
import type { Notification, NotificationType, NotificationPriority, NotificationCategory } from '@flareboard/types'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  actionUrl?: string
  actionText?: string
  priority?: NotificationPriority
  category?: NotificationCategory
  metadata?: Record<string, any>
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        icon: input.icon,
        actionUrl: input.actionUrl,
        actionText: input.actionText,
        priority: input.priority || 'normal',
        category: input.category || 'general',
        metadata: input.metadata || null,
      },
    })

    return notification as Notification
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      category?: NotificationCategory
    }
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const where: any = { userId }

    if (options?.unreadOnly) {
      where.isRead = false
    }

    if (options?.category) {
      where.category = options.category
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      notifications: notifications as Notification[],
      total,
      unreadCount,
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return updated as Notification
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { count: result.count }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  /**
   * Delete all read notifications for a user
   */
  async clearReadNotifications(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    })

    return { count: result.count }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  /**
   * Helper: Create task assignment notification
   */
  async notifyTaskAssignment(taskId: string, assigneeId: string, assignedBy: string): Promise<void> {
    const [task, assigner] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      }),
      prisma.user.findUnique({ where: { id: assignedBy } }),
    ])

    if (!task || !assigner) return

    await this.createNotification({
      userId: assigneeId,
      type: 'task',
      title: 'New Task Assigned',
      message: `${assigner.fullName} assigned you to "${task.title}"`,
      icon: 'CheckCircle',
      actionUrl: `/kanban?task=${taskId}`,
      actionText: 'View Task',
      priority: task.priority === 'High' || task.priority === 'Urgent' ? 'high' : 'normal',
      category: 'task',
      metadata: {
        taskId: task.id,
        projectId: task.projectId,
        assignerId: assignedBy,
      },
    })
  }

  /**
   * Helper: Create task mention notification
   */
  async notifyMention(
    mentionedUserId: string,
    mentionedBy: string,
    context: {
      taskId?: string
      projectId?: string
      commentId?: string
      message: string
    }
  ): Promise<void> {
    const mentioner = await prisma.user.findUnique({ where: { id: mentionedBy } })
    if (!mentioner) return

    await this.createNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentioner.fullName} mentioned you: "${context.message.substring(0, 100)}..."`,
      icon: 'AtSign',
      actionUrl: context.taskId ? `/kanban?task=${context.taskId}` : `/projects/${context.projectId}`,
      actionText: 'View',
      priority: 'normal',
      category: 'mention',
      metadata: context,
    })
  }

  /**
   * Helper: Create task due date reminder
   */
  async notifyTaskDueSoon(taskId: string, userId: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    })

    if (!task || !task.dueDate) return

    const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    await this.createNotification({
      userId,
      type: 'warning',
      title: 'Task Due Soon',
      message: `"${task.title}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
      icon: 'Clock',
      actionUrl: `/kanban?task=${taskId}`,
      actionText: 'View Task',
      priority: daysUntilDue <= 1 ? 'urgent' : 'high',
      category: 'task',
      metadata: {
        taskId: task.id,
        projectId: task.projectId,
        dueDate: task.dueDate,
      },
    })
  }

  /**
   * Helper: Create project update notification
   */
  async notifyProjectUpdate(
    projectId: string,
    userIds: string[],
    updatedBy: string,
    updateType: string
  ): Promise<void> {
    const [project, updater] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.user.findUnique({ where: { id: updatedBy } }),
    ])

    if (!project || !updater) return

    const notifications = userIds.map((userId) =>
      this.createNotification({
        userId,
        type: 'project',
        title: 'Project Updated',
        message: `${updater.fullName} ${updateType} project "${project.name}"`,
        icon: 'FolderEdit',
        actionUrl: `/projects/${projectId}`,
        actionText: 'View Project',
        priority: 'normal',
        category: 'project',
        metadata: {
          projectId: project.id,
          updateType,
          updatedBy,
        },
      })
    )

    await Promise.all(notifications)
  }
}

export const notificationService = new NotificationService()

import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { notificationService } from '../services/notification.service.js'
import type { ApiResponse, Notification } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class NotificationsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
      const unreadOnly = req.query.unreadOnly === 'true'
      const category = req.query.category as any

      const result = await notificationService.getNotifications(req.user.userId, {
        limit,
        offset,
        unreadOnly,
        category,
      })

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const count = await prisma.notification.count({
        where: {
          userId: req.user.userId,
          isRead: false,
        },
      })

      const response: ApiResponse<{ count: number }> = {
        success: true,
        data: { count },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const notification = await notificationService.markAsRead(id, req.user.userId)

      const response: ApiResponse<Notification> = {
        success: true,
        data: notification,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const result = await notificationService.markAllAsRead(req.user.userId)

      const response: ApiResponse<{ count: number }> = {
        success: true,
        data: result,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { userId, type, title, message } = req.body

      if (!userId || !type || !title || !message) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Missing required fields')
      }

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          content: message || title || '',
          isRead: false,
        },
      })

      const response: ApiResponse<Notification> = {
        success: true,
        data: notification as Notification,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      const notification = await prisma.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        throw new AppError(404, 'NOT_FOUND', 'Notification not found')
      }

      if (notification.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this notification')
      }

      await prisma.notification.delete({
        where: { id },
      })

      const response: ApiResponse = {
        success: true,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async deleteAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      await prisma.notification.deleteMany({
        where: {
          userId: req.user.userId,
          isRead: true, // Only delete read notifications
        },
      })

      const response: ApiResponse = {
        success: true,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const notificationsController = new NotificationsController()

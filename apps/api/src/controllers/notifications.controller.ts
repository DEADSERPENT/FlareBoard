import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Notification } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class NotificationsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { unreadOnly } = req.query

      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.user.userId,
          ...(unreadOnly === 'true' && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to recent 50 notifications
      })

      const response: ApiResponse<Notification[]> = {
        success: true,
        data: notifications as Notification[],
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

      const notification = await prisma.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        throw new AppError(404, 'NOT_FOUND', 'Notification not found')
      }

      if (notification.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this notification')
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      })

      const response: ApiResponse = {
        success: true,
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

      await prisma.notification.updateMany({
        where: {
          userId: req.user.userId,
          isRead: false,
        },
        data: { isRead: true },
      })

      const response: ApiResponse = {
        success: true,
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

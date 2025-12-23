import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import type { ApiResponse, Notification } from '@nebula/types'

class NotificationsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement get all notifications for user
      const response: ApiResponse<Notification[]> = {
        success: true,
        data: [],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement mark notification as read
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
      // TODO: Implement mark all notifications as read
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

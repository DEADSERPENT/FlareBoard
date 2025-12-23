import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, ActivityLog } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class ActivityController {
  // Get activity logs for current user
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { limit = '50', offset = '0', entityType } = req.query

      const where = entityType
        ? {
            userId: req.user.userId,
            entityType: entityType as string,
          }
        : { userId: req.user.userId }

      const activityLogs = await prisma.activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      })

      const total = await prisma.activityLog.count({ where })

      const response: ApiResponse<{ logs: ActivityLog[]; total: number }> = {
        success: true,
        data: {
          logs: activityLogs as unknown as ActivityLog[],
          total,
        },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Get recent activity (last 20)
  async getRecent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const activityLogs = await prisma.activityLog.findMany({
        where: { userId: req.user.userId },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      })

      const response: ApiResponse<ActivityLog[]> = {
        success: true,
        data: activityLogs as unknown as ActivityLog[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const activityController = new ActivityController()

import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Dashboard } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class DashboardsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const dashboards = await prisma.dashboard.findMany({
        where: { userId: req.user.userId },
        include: {
          widgets: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const response: ApiResponse<Dashboard[]> = {
        success: true,
        data: dashboards as unknown as unknown as Dashboard[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      const dashboard = await prisma.dashboard.findUnique({
        where: { id },
        include: {
          widgets: {
            orderBy: { position: 'asc' },
          },
        },
      })

      if (!dashboard) {
        throw new AppError(404, 'NOT_FOUND', 'Dashboard not found')
      }

      if (dashboard.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this dashboard')
      }

      const response: ApiResponse<Dashboard> = {
        success: true,
        data: dashboard as unknown as Dashboard,
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

      const { name, layoutConfig, isDefault } = req.body

      if (!name) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Dashboard name is required')
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        await prisma.dashboard.updateMany({
          where: { userId: req.user.userId, isDefault: true },
          data: { isDefault: false },
        })
      }

      const dashboard = await prisma.dashboard.create({
        data: {
          name,
          userId: req.user.userId,
          layoutConfig: layoutConfig || {},
          isDefault: isDefault || false,
        },
        include: {
          widgets: true,
        },
      })

      const response: ApiResponse<Dashboard> = {
        success: true,
        data: dashboard as unknown as Dashboard,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const { name, layoutConfig, isDefault } = req.body

      const existingDashboard = await prisma.dashboard.findUnique({
        where: { id },
      })

      if (!existingDashboard) {
        throw new AppError(404, 'NOT_FOUND', 'Dashboard not found')
      }

      if (existingDashboard.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this dashboard')
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        await prisma.dashboard.updateMany({
          where: { userId: req.user.userId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        })
      }

      const dashboard = await prisma.dashboard.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(layoutConfig !== undefined && { layoutConfig }),
          ...(isDefault !== undefined && { isDefault }),
        },
        include: {
          widgets: true,
        },
      })

      const response: ApiResponse<Dashboard> = {
        success: true,
        data: dashboard as unknown as Dashboard,
      }
      res.json(response)
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

      const existingDashboard = await prisma.dashboard.findUnique({
        where: { id },
      })

      if (!existingDashboard) {
        throw new AppError(404, 'NOT_FOUND', 'Dashboard not found')
      }

      if (existingDashboard.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this dashboard')
      }

      await prisma.dashboard.delete({
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

  async getDefaultDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      let dashboard = await prisma.dashboard.findFirst({
        where: { userId: req.user.userId, isDefault: true },
        include: {
          widgets: {
            orderBy: { position: 'asc' },
          },
        },
      })

      // If no default dashboard, get the first one
      if (!dashboard) {
        dashboard = await prisma.dashboard.findFirst({
          where: { userId: req.user.userId },
          include: {
            widgets: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        })
      }

      const response: ApiResponse<Dashboard | null> = {
        success: true,
        data: dashboard as unknown as Dashboard | null,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const dashboardsController = new DashboardsController()

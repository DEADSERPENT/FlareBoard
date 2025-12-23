import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import type { ApiResponse, Dashboard } from '@nebula/types'

class DashboardsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement get all dashboards for user
      const response: ApiResponse<Dashboard[]> = {
        success: true,
        data: [],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement get dashboard by id
      const response: ApiResponse<Dashboard> = {
        success: true,
        data: {} as Dashboard,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement create dashboard
      const response: ApiResponse<Dashboard> = {
        success: true,
        data: {} as Dashboard,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement update dashboard (including layout changes)
      const response: ApiResponse<Dashboard> = {
        success: true,
        data: {} as Dashboard,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // TODO: Implement delete dashboard
      const response: ApiResponse = {
        success: true,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const dashboardsController = new DashboardsController()

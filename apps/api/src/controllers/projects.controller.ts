import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Project } from '@nebula/types'
import { AppError } from '../middlewares/errorHandler.js'

class ProjectsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      })

      const response: ApiResponse<Project[]> = {
        success: true,
        data: projects as Project[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: true,
        },
      })

      if (!project) {
        throw new AppError(404, 'NOT_FOUND', 'Project not found')
      }

      const response: ApiResponse<Project> = {
        success: true,
        data: project as unknown as Project,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, status } = req.body

      if (!name) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Project name is required')
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          status: status || 'Active',
          ownerId: req.user!.userId,
        },
      })

      const response: ApiResponse<Project> = {
        success: true,
        data: project as Project,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { name, description, status } = req.body

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
        },
      })

      const response: ApiResponse<Project> = {
        success: true,
        data: project as Project,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.project.delete({
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
}

export const projectsController = new ProjectsController()

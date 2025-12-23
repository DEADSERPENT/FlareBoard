import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Project } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class ProjectsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      // Get user's role
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
      }

      // Admins can see all projects, others only see their own
      const projects = await prisma.project.findMany({
        where: user.role.name === 'Admin' ? {} : { ownerId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
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
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: [{ status: 'asc' }, { position: 'asc' }],
          },
        },
      })

      if (!project) {
        throw new AppError(404, 'NOT_FOUND', 'Project not found')
      }

      // Check if user has permission to view this project
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this project')
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
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const { name, description, status } = req.body

      // Check if project exists and user has permission
      const existingProject = await prisma.project.findUnique({
        where: { id },
      })

      if (!existingProject) {
        throw new AppError(404, 'NOT_FOUND', 'Project not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && existingProject.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this project')
      }

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
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      // Check if project exists and user has permission
      const existingProject = await prisma.project.findUnique({
        where: { id },
      })

      if (!existingProject) {
        throw new AppError(404, 'NOT_FOUND', 'Project not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && existingProject.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this project')
      }

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

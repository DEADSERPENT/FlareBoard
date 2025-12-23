import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Task } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class TasksController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { projectId } = req.query

      // Get user's role
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
      }

      // Build where clause based on permissions
      let where: any = {
        ...(projectId && { projectId: projectId as string }),
      }

      // Non-admins can only see tasks from their own projects
      if (user.role.name !== 'Admin') {
        where.project = {
          ownerId: req.user.userId,
        }
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: [{ status: 'asc' }, { position: 'asc' }],
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      })

      const response: ApiResponse<Task[]> = {
        success: true,
        data: tasks as Task[],
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

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: true,
          assignee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      })

      if (!task) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      // Check permission
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && task.project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this task')
      }

      const response: ApiResponse<Task> = {
        success: true,
        data: task as unknown as Task,
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

      const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body

      if (!projectId || !title) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Project ID and title are required')
      }

      // Check if project exists and user has permission
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        throw new AppError(404, 'NOT_FOUND', 'Project not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to create tasks in this project')
      }

      // Get the next position for this project
      const maxPosition = await prisma.task.aggregate({
        where: { projectId },
        _max: { position: true },
      })

      const task = await prisma.task.create({
        data: {
          projectId,
          title,
          description,
          status: status || 'Todo',
          priority: priority || 'Medium',
          position: (maxPosition._max.position || 0) + 1,
          ...(assignedTo && { assignedTo }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      })

      const response: ApiResponse<Task> = {
        success: true,
        data: task as Task,
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
      const { title, description, status, priority, assignedTo, dueDate, position } = req.body

      // Check if task exists and user has permission
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: { project: true },
      })

      if (!existingTask) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && existingTask.project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this task')
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
          ...(priority && { priority }),
          ...(assignedTo !== undefined && { assignedTo }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(position !== undefined && { position }),
        },
      })

      const response: ApiResponse<Task> = {
        success: true,
        data: task as Task,
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

      // Check if task exists and user has permission
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: { project: true },
      })

      if (!existingTask) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && existingTask.project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this task')
      }

      await prisma.task.delete({
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

  async updatePosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const { position, status } = req.body

      // Check if task exists and user has permission
      const existingTask = await prisma.task.findUnique({
        where: { id },
        include: { project: true },
      })

      if (!existingTask) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      })

      if (user?.role.name !== 'Admin' && existingTask.project.ownerId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to reorder this task')
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(position !== undefined && { position }),
          ...(status && { status }),
        },
      })

      const response: ApiResponse<Task> = {
        success: true,
        data: task as Task,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const tasksController = new TasksController()

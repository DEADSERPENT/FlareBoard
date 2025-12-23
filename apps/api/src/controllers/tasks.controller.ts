import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Task } from '@nebula/types'
import { AppError } from '../middlewares/errorHandler.js'

class TasksController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query

      const tasks = await prisma.task.findMany({
        where: {
          ...(projectId && { projectId: projectId as string }),
        },
        orderBy: [{ status: 'asc' }, { position: 'asc' }],
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
      const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body

      if (!projectId || !title) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Project ID and title are required')
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
      const { id } = req.params
      const { title, description, status, priority, assignedTo, dueDate, position } = req.body

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
      const { id } = req.params

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
}

export const tasksController = new TasksController()

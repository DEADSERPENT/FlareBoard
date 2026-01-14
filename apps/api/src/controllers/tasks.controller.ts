import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import type { ApiResponse, Task } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'
import { taskService } from '../services/task.service.js'

class TasksController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { projectId } = req.query
      const tasks = await taskService.getAllTasks(req.user.userId, projectId as string | undefined)

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
      const task = await taskService.getTaskById(req.user.userId, id)

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

      const task = await taskService.createTask(req.user.userId, {
        projectId,
        title,
        description,
        status: status || 'Todo',
        priority: priority || 'Medium',
        ...(assignedTo && { assignedTo }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      })

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
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

      const task = await taskService.updateTask(req.user.userId, id, {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(position !== undefined && { position }),
      })

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
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
      await taskService.deleteTask(req.user.userId, id)

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

      const task = await taskService.updateTaskPosition(req.user.userId, id, position, status)

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getDeleted(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { projectId } = req.query
      const tasks = await taskService.getDeletedTasks(req.user.userId, projectId as string | undefined)

      const response: ApiResponse<Task[]> = {
        success: true,
        data: tasks as Task[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const task = await taskService.restoreTask(req.user.userId, id)

      const response: ApiResponse<Task> = {
        success: true,
        data: task,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const tasksController = new TasksController()

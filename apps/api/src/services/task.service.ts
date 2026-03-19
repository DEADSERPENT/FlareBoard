import { prisma } from '../lib/prisma.js'
import { AppError } from '../middlewares/errorHandler.js'
import { permissionsService } from './permissions.service.js'
import { richTextService } from './richtext.service.js'
import type { Task, TaskStatus, TaskPriority } from '@flareboard/types'

export interface CreateTaskDTO {
  projectId: string
  title: string
  description?: string
  descriptionHtml?: string
  descriptionJson?: any
  status?: string
  priority?: string
  assignedTo?: string
  dueDate?: Date | string
  parentId?: string
}

export interface UpdateTaskDTO {
  title?: string
  description?: string
  descriptionHtml?: string
  descriptionJson?: any
  status?: string
  priority?: string
  assignedTo?: string | null
  dueDate?: Date | string | null
  position?: number
}

export class TaskService {
  /**
   * Get all tasks with permission filtering (excluding soft-deleted)
   */
  async getAllTasks(userId: string, projectId?: string) {
    const baseWhere = await permissionsService.buildResourceWhereClause(
      userId,
      'task',
      projectId ? { projectId } : undefined
    )

    const where = {
      ...baseWhere,
      deletedAt: null, // Exclude soft-deleted tasks
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
        subtasks: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
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
        },
      },
    })

    return tasks
  }

  /**
   * Get a single task by ID with permission check (excluding soft-deleted)
   */
  async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null, // Exclude soft-deleted tasks
      },
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
        subtasks: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
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
        },
      },
    })

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found')
    }

    // Check permission
    await permissionsService.assertCanAccessResource(userId, 'task', taskId, 'read')

    return task
  }

  /**
   * Create a new task
   */
  async createTask(
    userId: string,
    data: {
      projectId: string
      title: string
      description?: string
      descriptionHtml?: string
      descriptionJson?: any
      status?: string
      priority?: string
      assignedTo?: string
      dueDate?: Date
      parentId?: string
    }
  ): Promise<Task> {
    // Validate required fields
    if (!data.projectId || !data.title) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Project ID and title are required')
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    })

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found')
    }

    // If parentId is provided, validate the parent task
    if (data.parentId) {
      const parentTask = await prisma.task.findFirst({
        where: {
          id: data.parentId,
          deletedAt: null,
        },
      })

      if (!parentTask) {
        throw new AppError(404, 'NOT_FOUND', 'Parent task not found')
      }

      if (parentTask.projectId !== data.projectId) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Subtask must belong to the same project as its parent'
        )
      }
    }

    // Check permission
    await permissionsService.assertCanCreateTaskInProject(userId, data.projectId)

    // Sanitize HTML if provided
    let descriptionHtml = data.descriptionHtml
    if (descriptionHtml) {
      descriptionHtml = richTextService.sanitizeHtml(descriptionHtml)
    }

    // Get the next position for this project
    const maxPosition = await prisma.task.aggregate({
      where: { projectId: data.projectId },
      _max: { position: true },
    })

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        descriptionHtml,
        descriptionJson: data.descriptionJson,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
        parentId: data.parentId,
        position: (maxPosition._max.position || 0) + 1,
      },
    })

    return task as Task
  }

  async updateTask(
    userId: string,
    taskId: string,
    data: {
      title?: string
      description?: string
      descriptionHtml?: string
      descriptionJson?: any
      status?: string
      priority?: string
      assignedTo?: string | null
      dueDate?: Date | null
      position?: number
    }
  ): Promise<Task> {
    // Check if task exists and is not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found')
    }

    // Check permission
    await permissionsService.assertCanAccessResource(userId, 'task', taskId, 'write')

    // Sanitize HTML if provided
    const updateData = { ...data }
    if (updateData.descriptionHtml) {
      updateData.descriptionHtml = richTextService.sanitizeHtml(updateData.descriptionHtml)
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    })

    return task as Task
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    // Check if task exists and is not already deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found')
    }

    // Check permission
    await permissionsService.assertCanAccessResource(userId, 'task', taskId, 'delete')

    // Soft delete: set deletedAt timestamp instead of hard delete
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Update task position (for drag-and-drop reordering)
   */
  async updateTaskPosition(
    userId: string,
    taskId: string,
    position?: number,
    status?: string
  ): Promise<Task> {
    // Check if task exists and is not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    })

    if (!existingTask) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found')
    }

    // Check permission
    await permissionsService.assertCanAccessResource(userId, 'task', taskId, 'write')

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(position !== undefined && { position }),
        ...(status && { status }),
      },
    })

    return task as Task
  }

  /**
   * Get deleted tasks (trash)
   */
  async getDeletedTasks(userId: string, projectId?: string) {
    const baseWhere = await permissionsService.buildResourceWhereClause(
      userId,
      'task',
      projectId ? { projectId } : undefined
    )

    const where = {
      ...baseWhere,
      NOT: { deletedAt: null }, // Only fetch deleted tasks
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { deletedAt: 'desc' }, // Most recently deleted first
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return tasks
  }

  /**
   * Restore a deleted task
   */
  async restoreTask(userId: string, taskId: string): Promise<Task> {
    // Find the deleted task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        NOT: { deletedAt: null }, // Only find deleted tasks
      },
      include: { project: true },
    })

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found in trash')
    }

    // Check permission
    await permissionsService.assertCanAccessResource(userId, 'task', taskId, 'write')

    // Restore the task by setting deletedAt to null
    const restoredTask = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: null },
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

    return restoredTask as Task
  }
}

export const taskService = new TaskService()

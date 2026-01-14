import { prisma } from '../lib/prisma.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthTokenPayload } from '@flareboard/types'

export class PermissionsService {
  /**
   * Check if a user has permission to access a resource based on role and ownership
   */
  async canAccessResource(
    userId: string,
    resourceType: 'project' | 'task',
    resourceId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<boolean> {
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      return false
    }

    // Admins have access to everything
    if (user.role.name === 'Admin') {
      return true
    }

    // Check resource ownership
    if (resourceType === 'project') {
      const project = await prisma.project.findUnique({
        where: { id: resourceId },
      })
      return project?.ownerId === userId
    }

    if (resourceType === 'task') {
      const task = await prisma.task.findUnique({
        where: { id: resourceId },
        include: { project: true },
      })
      return task?.project.ownerId === userId
    }

    return false
  }

  /**
   * Assert that a user has permission to access a resource, throw error if not
   */
  async assertCanAccessResource(
    userId: string,
    resourceType: 'project' | 'task',
    resourceId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<void> {
    const hasPermission = await this.canAccessResource(
      userId,
      resourceType,
      resourceId,
      action
    )

    if (!hasPermission) {
      throw new AppError(
        403,
        'FORBIDDEN',
        `You do not have permission to ${action} this ${resourceType}`
      )
    }
  }

  /**
   * Check if user can create a task in a project
   */
  async canCreateTaskInProject(userId: string, projectId: string): Promise<boolean> {
    return this.canAccessResource(userId, 'project', projectId, 'write')
  }

  /**
   * Assert that user can create a task in a project
   */
  async assertCanCreateTaskInProject(userId: string, projectId: string): Promise<void> {
    const hasPermission = await this.canCreateTaskInProject(userId, projectId)

    if (!hasPermission) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'You do not have permission to create tasks in this project'
      )
    }
  }

  /**
   * Get user with role information
   */
  async getUserWithRole(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
    }

    return user
  }

  /**
   * Check if user is an admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getUserWithRole(userId)
    return user.role.name === 'Admin'
  }

  /**
   * Build a where clause for filtering resources based on user permissions
   * This is useful for list/getAll endpoints
   */
  async buildResourceWhereClause(
    userId: string,
    resourceType: 'project' | 'task',
    additionalFilters?: any
  ): Promise<any> {
    const user = await this.getUserWithRole(userId)

    // Admins can see everything
    if (user.role.name === 'Admin') {
      return additionalFilters || {}
    }

    // Non-admins can only see resources from their own projects
    if (resourceType === 'project') {
      return {
        ownerId: userId,
        ...additionalFilters,
      }
    }

    if (resourceType === 'task') {
      return {
        project: {
          ownerId: userId,
        },
        ...additionalFilters,
      }
    }

    return additionalFilters || {}
  }
}

export const permissionsService = new PermissionsService()

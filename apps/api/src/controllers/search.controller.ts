import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

interface SearchResults {
  projects: any[]
  tasks: any[]
  total: number
}

class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { q, type } = req.query
      const query = (q as string) || ''

      if (!query || query.length < 2) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Search query must be at least 2 characters')
      }

      const searchTypes = type ? [type] : ['projects', 'tasks']
      const results: SearchResults = {
        projects: [],
        tasks: [],
        total: 0,
      }

      // Search projects
      if (searchTypes.includes('projects')) {
        const projects = await prisma.project.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        })
        results.projects = projects
        results.total += projects.length
      }

      // Search tasks
      if (searchTypes.includes('tasks')) {
        const tasks = await prisma.task.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            assignee: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          take: 20,
        })
        results.tasks = tasks
        results.total += tasks.length
      }

      const response: ApiResponse<SearchResults> = {
        success: true,
        data: results,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const searchController = new SearchController()

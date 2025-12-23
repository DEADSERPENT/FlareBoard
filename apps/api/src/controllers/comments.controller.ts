import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Comment } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class CommentsController {
  // Get all comments for a task
  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { taskId } = req.params

      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const response: ApiResponse<Comment[]> = {
        success: true,
        data: comments as unknown as Comment[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Create a comment
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { taskId, content } = req.body

      if (!taskId || !content) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Task ID and content are required')
      }

      // Verify task exists
      const task = await prisma.task.findUnique({ where: { id: taskId } })
      if (!task) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      const comment = await prisma.comment.create({
        data: {
          taskId,
          userId: req.user.userId,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      })

      const response: ApiResponse<Comment> = {
        success: true,
        data: comment as unknown as Comment,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Update a comment
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params
      const { content } = req.body

      const existingComment = await prisma.comment.findUnique({ where: { id } })

      if (!existingComment) {
        throw new AppError(404, 'NOT_FOUND', 'Comment not found')
      }

      if (existingComment.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only edit your own comments')
      }

      const comment = await prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      })

      const response: ApiResponse<Comment> = {
        success: true,
        data: comment as unknown as Comment,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Delete a comment
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      const existingComment = await prisma.comment.findUnique({ where: { id } })

      if (!existingComment) {
        throw new AppError(404, 'NOT_FOUND', 'Comment not found')
      }

      if (existingComment.userId !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only delete your own comments')
      }

      await prisma.comment.delete({ where: { id } })

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Comment deleted successfully' },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const commentsController = new CommentsController()

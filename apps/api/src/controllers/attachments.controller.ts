import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, Attachment } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'

class AttachmentsController {
  // Get all attachments for a task
  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { taskId } = req.params

      const attachments = await prisma.attachment.findMany({
        where: { taskId },
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const response: ApiResponse<Attachment[]> = {
        success: true,
        data: attachments as unknown as Attachment[],
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Create an attachment (file upload)
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { taskId, fileName, fileUrl, fileSize, fileType } = req.body

      if (!taskId || !fileName || !fileUrl) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Task ID, file name, and file URL are required')
      }

      // Verify task exists
      const task = await prisma.task.findUnique({ where: { id: taskId } })
      if (!task) {
        throw new AppError(404, 'NOT_FOUND', 'Task not found')
      }

      const attachment = await prisma.attachment.create({
        data: {
          taskId,
          fileName,
          fileUrl,
          fileSize: fileSize || 0,
          fileType: fileType || 'application/octet-stream',
          uploadedBy: req.user.userId,
        },
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      })

      const response: ApiResponse<Attachment> = {
        success: true,
        data: attachment as unknown as Attachment,
      }
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  // Delete an attachment
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { id } = req.params

      const existingAttachment = await prisma.attachment.findUnique({ where: { id } })

      if (!existingAttachment) {
        throw new AppError(404, 'NOT_FOUND', 'Attachment not found')
      }

      if (existingAttachment.uploadedBy !== req.user.userId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only delete your own attachments')
      }

      await prisma.attachment.delete({ where: { id } })

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Attachment deleted successfully' },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const attachmentsController = new AttachmentsController()

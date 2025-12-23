import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.js'
import { prisma } from '../lib/prisma.js'
import type { ApiResponse, User } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'
import bcrypt from 'bcryptjs'

class UsersController {
  // Get current user profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          preferences: true,
        },
      })

      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'User not found')
      }

      const response: ApiResponse<any> = {
        success: true,
        data: user,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { fullName, avatarUrl } = req.body

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          fullName: fullName || undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      const response: ApiResponse<User> = {
        success: true,
        data: user as unknown as User,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Change password
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Current and new passwords are required')
      }

      if (newPassword.length < 6) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      })

      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'User not found')
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      if (!isValidPassword) {
        throw new AppError(401, 'INVALID_PASSWORD', 'Current password is incorrect')
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedPassword },
      })

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Password changed successfully' },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  // Update user preferences
  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const { theme, defaultDashboard, notifications, timezone } = req.body

      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.user.userId },
        update: {
          theme: theme || undefined,
          defaultDashboard: defaultDashboard !== undefined ? defaultDashboard : undefined,
          notifications: notifications || undefined,
          timezone: timezone || undefined,
        },
        create: {
          userId: req.user.userId,
          theme: theme || 'dark',
          defaultDashboard: defaultDashboard || null,
          notifications: notifications || { email: true, push: true, inApp: true },
          timezone: timezone || 'UTC',
        },
      })

      const response: ApiResponse<any> = {
        success: true,
        data: preferences,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const usersController = new UsersController()

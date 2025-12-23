import { Request, Response, NextFunction } from 'express'
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from '@flareboard/types'
import { AppError } from '../middlewares/errorHandler.js'
import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middlewares/auth.js'

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterRequest = req.body

      // 1. Validate input
      if (!data.email || !data.password || !data.fullName) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email, password, and full name are required')
      }

      if (data.password.length < 6) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid email format')
      }

      // 2. Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        throw new AppError(409, 'USER_EXISTS', 'User with this email already exists')
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // 4. Get default viewer role
      const viewerRole = await prisma.role.findFirst({
        where: { name: 'Viewer' },
      })

      if (!viewerRole) {
        throw new AppError(500, 'SERVER_ERROR', 'Default role not found')
      }

      // 5. Create user in database
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
          roleId: viewerRole.id,
        },
      })

      // 6. Generate JWT token
      const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
      // @ts-expect-error - jwt types issue with expiresIn string
      const token = jwt.sign(
        { userId: user.id, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET!,
        { expiresIn }
      )

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            avatarUrl: user.avatarUrl || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      }

      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginRequest = req.body

      // 1. Validate input
      if (!data.email || !data.password) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email and password are required')
      }

      // 2. Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (!user) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
      }

      // 3. Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password)

      if (!isValidPassword) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
      }

      // 4. Generate JWT token
      const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
      // @ts-expect-error - jwt types issue with expiresIn string
      const token = jwt.sign(
        { userId: user.id, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET!,
        { expiresIn }
      )

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            avatarUrl: user.avatarUrl || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      // Generate new token with same payload
      const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'
      // @ts-expect-error - jwt types issue with expiresIn string
      const token = jwt.sign(
        { userId: req.user.userId, email: req.user.email, roleId: req.user.roleId },
        process.env.JWT_SECRET!,
        { expiresIn }
      )

      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token },
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: true,
        },
      })

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found')
      }

      const response: ApiResponse<{
        id: string
        email: string
        fullName: string
        roleId: string
        avatarUrl: string | null
        createdAt: Date
        updatedAt: Date
      }> = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthTokenPayload } from '@nebula/types'
import { AppError } from './errorHandler.js'

export interface AuthRequest extends Request {
  user?: AuthTokenPayload
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    // In development, allow requests without token
    if (!token && process.env.NODE_ENV === 'development') {
      req.user = {
        userId: 'dev-user',
        roleId: 'admin',
        email: 'dev@flareboard.com',
      }
      return next()
    }

    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'))
    } else {
      next(error)
    }
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required')
    }

    if (!roles.includes(req.user.roleId)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions')
    }

    next()
  }
}

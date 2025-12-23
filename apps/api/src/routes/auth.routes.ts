import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/refresh', authController.refreshToken)
authRouter.get('/me', authController.getCurrentUser)

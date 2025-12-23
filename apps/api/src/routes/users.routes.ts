import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get current user profile
router.get('/profile', usersController.getProfile.bind(usersController))

// Update user profile
router.patch('/profile', usersController.updateProfile.bind(usersController))

// Change password
router.post('/change-password', usersController.changePassword.bind(usersController))

// Update preferences
router.patch('/preferences', usersController.updatePreferences.bind(usersController))

export default router

import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { authenticate, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.use(authenticate)

// Member-accessible routes
router.get('/', usersController.getAllUsers.bind(usersController))
router.get('/profile', usersController.getProfile.bind(usersController))
router.patch('/profile', usersController.updateProfile.bind(usersController))
router.post('/change-password', usersController.changePassword.bind(usersController))
router.patch('/preferences', usersController.updatePreferences.bind(usersController))

// Admin-only routes
router.get('/admin/all', isAdmin, usersController.adminGetAllUsers.bind(usersController))
router.patch('/admin/:id/role', isAdmin, usersController.adminUpdateUserRole.bind(usersController))
router.delete('/admin/:id', isAdmin, usersController.adminDeleteUser.bind(usersController))

export default router

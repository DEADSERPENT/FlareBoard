import { Router } from 'express'
import { activityController } from '../controllers/activity.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get all activity logs
router.get('/', activityController.getAll.bind(activityController))

// Get recent activity
router.get('/recent', activityController.getRecent.bind(activityController))

export default router

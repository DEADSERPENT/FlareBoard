import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { notificationsController } from '../controllers/notifications.controller.js'

export const notificationsRouter = Router()

notificationsRouter.use(authenticate)

notificationsRouter.get('/', notificationsController.getAll)
notificationsRouter.patch('/:id/read', notificationsController.markAsRead)
notificationsRouter.post('/mark-all-read', notificationsController.markAllAsRead)

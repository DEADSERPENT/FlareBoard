import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { notificationsController } from '../controllers/notifications.controller.js'

export const notificationsRouter = Router()

notificationsRouter.use(authenticate)

notificationsRouter.get('/', notificationsController.getAll)
notificationsRouter.get('/unread-count', notificationsController.getUnreadCount)
notificationsRouter.post('/', notificationsController.create)
notificationsRouter.patch('/:id/read', notificationsController.markAsRead)
notificationsRouter.post('/mark-all-read', notificationsController.markAllAsRead)
notificationsRouter.delete('/clear-read', notificationsController.deleteAll)
notificationsRouter.delete('/:id', notificationsController.delete)

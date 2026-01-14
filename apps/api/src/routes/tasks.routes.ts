import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { tasksController } from '../controllers/tasks.controller.js'

export const tasksRouter = Router()

tasksRouter.use(authenticate)

tasksRouter.get('/', tasksController.getAll)
tasksRouter.get('/deleted', tasksController.getDeleted)
tasksRouter.get('/:id', tasksController.getById)
tasksRouter.post('/', tasksController.create)
tasksRouter.post('/:id/restore', tasksController.restore)
tasksRouter.patch('/:id', tasksController.update)
tasksRouter.patch('/:id/position', tasksController.updatePosition)
tasksRouter.delete('/:id', tasksController.delete)

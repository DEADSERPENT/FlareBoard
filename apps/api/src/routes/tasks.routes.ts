import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { tasksController } from '../controllers/tasks.controller.js'

export const tasksRouter = Router()

tasksRouter.use(authenticate)

tasksRouter.get('/', tasksController.getAll)
tasksRouter.get('/:id', tasksController.getById)
tasksRouter.post('/', tasksController.create)
tasksRouter.patch('/:id', tasksController.update)
tasksRouter.patch('/:id/position', tasksController.updatePosition)
tasksRouter.delete('/:id', tasksController.delete)

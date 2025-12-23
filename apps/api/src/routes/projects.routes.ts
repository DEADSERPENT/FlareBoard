import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { projectsController } from '../controllers/projects.controller.js'

export const projectsRouter = Router()

projectsRouter.use(authenticate)

projectsRouter.get('/', projectsController.getAll)
projectsRouter.get('/:id', projectsController.getById)
projectsRouter.post('/', projectsController.create)
projectsRouter.patch('/:id', projectsController.update)
projectsRouter.delete('/:id', projectsController.delete)

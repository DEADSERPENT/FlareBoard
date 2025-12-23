import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { dashboardsController } from '../controllers/dashboards.controller.js'

export const dashboardsRouter = Router()

dashboardsRouter.use(authenticate)

dashboardsRouter.get('/', dashboardsController.getAll)
dashboardsRouter.get('/default', dashboardsController.getDefaultDashboard)
dashboardsRouter.get('/:id', dashboardsController.getById)
dashboardsRouter.post('/', dashboardsController.create)
dashboardsRouter.patch('/:id', dashboardsController.update)
dashboardsRouter.delete('/:id', dashboardsController.delete)

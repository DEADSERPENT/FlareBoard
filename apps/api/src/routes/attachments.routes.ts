import { Router } from 'express'
import { attachmentsController } from '../controllers/attachments.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get attachments for a task
router.get('/task/:taskId', attachmentsController.getByTask.bind(attachmentsController))

// Create an attachment
router.post('/', attachmentsController.create.bind(attachmentsController))

// Delete an attachment
router.delete('/:id', attachmentsController.delete.bind(attachmentsController))

export default router

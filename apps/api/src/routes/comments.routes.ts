import { Router } from 'express'
import { commentsController } from '../controllers/comments.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get comments for a task
router.get('/task/:taskId', commentsController.getByTask.bind(commentsController))

// Create a comment
router.post('/', commentsController.create.bind(commentsController))

// Update a comment
router.patch('/:id', commentsController.update.bind(commentsController))

// Delete a comment
router.delete('/:id', commentsController.delete.bind(commentsController))

export default router

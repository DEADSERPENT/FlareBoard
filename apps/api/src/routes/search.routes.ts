import { Router } from 'express'
import { searchController } from '../controllers/search.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Global search
router.get('/', searchController.search.bind(searchController))

export default router

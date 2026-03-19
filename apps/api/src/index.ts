import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import { errorHandler } from './middlewares/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { projectsRouter } from './routes/projects.routes.js'
import { tasksRouter } from './routes/tasks.routes.js'
import { dashboardsRouter } from './routes/dashboards.routes.js'
import { notificationsRouter } from './routes/notifications.routes.js'
import commentsRouter from './routes/comments.routes.js'
import attachmentsRouter from './routes/attachments.routes.js'
import searchRouter from './routes/search.routes.js'
import usersRouter from './routes/users.routes.js'
import activityRouter from './routes/activity.routes.js'
import { socketService } from './services/socket.service.js'
import { prisma } from './lib/prisma.js'

dotenv.config()

// Ensure default roles exist (idempotent — safe to run on every boot)
async function bootstrapRoles() {
  const roles = [
    { name: 'Admin', permissions: { canManageUsers: true, canManageProjects: true, canManageSettings: true, canViewAnalytics: true } },
    { name: 'Member', permissions: { canManageUsers: false, canManageProjects: true, canManageSettings: false, canViewAnalytics: true } },
  ]
  for (const role of roles) {
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: role })
  }
}

const app = express()
const httpServer = createServer(app)

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/dashboards', dashboardsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/attachments', attachmentsRouter)
app.use('/api/search', searchRouter)
app.use('/api/users', usersRouter)
app.use('/api/activity', activityRouter)

// Error handling
app.use(errorHandler)

// Initialize Socket.IO
socketService.initialize(httpServer)

// Start server
const PORT = process.env.PORT || 3000
bootstrapRoles()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🔥 FlareBoard API running on port ${PORT}`)
      console.log(`🔌 WebSocket server ready`)
      console.log(`📊 Environment: ${process.env.NODE_ENV}`)
    })
  })
  .catch((err) => {
    console.error('❌ Failed to bootstrap roles:', err)
    process.exit(1)
  })

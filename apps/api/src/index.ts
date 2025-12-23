import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import dotenv from 'dotenv'
import { errorHandler } from './middlewares/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { projectsRouter } from './routes/projects.routes.js'
import { tasksRouter } from './routes/tasks.routes.js'
import { dashboardsRouter } from './routes/dashboards.routes.js'
import { notificationsRouter } from './routes/notifications.routes.js'
import { initializeSocketHandlers } from './sockets/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true,
  },
})

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
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

// Error handling
app.use(errorHandler)

// Initialize WebSocket handlers
initializeSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`🔥 FlareBoard API running on port ${PORT}`)
  console.log(`🔌 WebSocket server ready`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
})

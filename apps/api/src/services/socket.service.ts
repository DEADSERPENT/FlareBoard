import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import type { AuthTokenPayload } from '@flareboard/types'

interface AuthenticatedSocket extends Socket {
  user?: AuthTokenPayload
}

class SocketService {
  private io: Server | null = null
  private userSockets: Map<string, Set<string>> = new Map() // userId -> Set of socketIds

  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
      },
    })

    this.io.use(this.authenticateSocket)
    this.io.on('connection', this.handleConnection)

    console.log('✅ Socket.IO initialized')
  }

  private authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  }

  private handleConnection = (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId

    if (!userId) {
      socket.disconnect()
      return
    }

    console.log(`🔌 User connected: ${userId} (${socket.id})`)

    // Track user's socket connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socket.id)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Handle task updates
    socket.on('task:update', (data) => {
      this.broadcastTaskUpdate(data)
    })

    // Handle project updates
    socket.on('project:update', (data) => {
      this.broadcastProjectUpdate(data)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId} (${socket.id})`)

      const userSocketSet = this.userSockets.get(userId)
      if (userSocketSet) {
        userSocketSet.delete(socket.id)
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId)
        }
      }
    })
  }

  // Emit notification to specific user
  emitNotification(userId: string, notification: any) {
    if (!this.io) return

    this.io.to(`user:${userId}`).emit('notification:new', notification)
    console.log(`📬 Notification sent to user: ${userId}`)
  }

  // Broadcast task update to all connected clients
  broadcastTaskUpdate(task: any) {
    if (!this.io) return

    this.io.emit('task:updated', task)
    console.log(`📝 Task update broadcast: ${task.id}`)
  }

  // Broadcast project update to all connected clients
  broadcastProjectUpdate(project: any) {
    if (!this.io) return

    this.io.emit('project:updated', project)
    console.log(`📁 Project update broadcast: ${project.id}`)
  }

  // Send notification to user and create database record
  async sendNotification(userId: string, notification: {
    type: string
    title: string
    message: string
  }) {
    // Import prisma dynamically to avoid circular dependencies
    const { prisma } = await import('../lib/prisma.js')

    try {
      // Create notification in database
      const dbNotification = await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          content: notification.message || notification.title || '',
          isRead: false,
        },
      })

      // Emit to connected clients
      this.emitNotification(userId, dbNotification)

      return dbNotification
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  // Get number of connected users
  getConnectedUsersCount(): number {
    return this.userSockets.size
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const userSocketSet = this.userSockets.get(userId)
    return userSocketSet ? userSocketSet.size > 0 : false
  }
}

export const socketService = new SocketService()

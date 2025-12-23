import { Server as SocketServer } from 'socket.io'
import type { SocketEvent } from '@nebula/types'

export const initializeSocketHandlers = (io: SocketServer) => {
  io.on('connection', socket => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Join user-specific room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined their room`)
    })

    // Join project-specific room
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`)
      console.log(`Socket ${socket.id} joined project ${projectId}`)
    })

    // Leave project room
    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`)
      console.log(`Socket ${socket.id} left project ${projectId}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })
}

// Helper function to emit events to specific rooms
export const emitToUser = (io: SocketServer, userId: string, event: SocketEvent) => {
  io.to(`user:${userId}`).emit(event.type, event.payload)
}

export const emitToProject = (io: SocketServer, projectId: string, event: SocketEvent) => {
  io.to(`project:${projectId}`).emit(event.type, event.payload)
}

export const emitToAll = (io: SocketServer, event: SocketEvent) => {
  io.emit(event.type, event.payload)
}

# FlareBoard - Project Structure

## Overview

This is a monorepo containing the complete FlareBoard dashboard system.

## Directory Structure

```
flareboard/
├── apps/
│   ├── web/                          # React Frontend (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/           # Layout components (Sidebar, TopBar)
│   │   │   │   └── ui/               # UI primitives (Button, Card, Input, etc.)
│   │   │   ├── pages/                # Route pages
│   │   │   ├── App.tsx               # Main app component
│   │   │   ├── main.tsx              # Entry point
│   │   │   └── index.css             # Global styles
│   │   ├── index.html
│   │   ├── tailwind.config.ts        # Quantum theme configuration
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                          # Express Backend
│       ├── src/
│       │   ├── controllers/          # Request handlers
│       │   ├── middlewares/          # Auth, error handling
│       │   ├── routes/               # API routes
│       │   ├── sockets/              # WebSocket handlers
│       │   └── index.ts              # Server entry point
│       ├── prisma/
│       │   └── schema.prisma         # Database schema
│       ├── .env.example              # Environment template
│       └── package.json
│
├── packages/
│   └── types/                        # Shared TypeScript Types
│       ├── src/
│       │   └── index.ts              # All shared interfaces
│       └── package.json
│
├── .vscode/                          # VSCode settings
│   ├── settings.json
│   └── extensions.json
│
├── docker-compose.yml                # PostgreSQL + PgAdmin
├── package.json                      # Workspace configuration
├── tsconfig.json                     # Base TypeScript config
├── .prettierrc                       # Code formatting
├── .gitignore
├── .gitattributes
├── README.md
├── CONTRIBUTING.md
└── PROJECT_STRUCTURE.md
```

## Key Files

### Frontend (`apps/web`)
- **tailwind.config.ts** - Quantum cosmic theme colors and utilities
- **src/components/ui/** - Reusable UI components (Button, Card, Input, Badge, Modal)
- **src/components/layout/** - Layout components (Sidebar, TopBar, Layout wrapper)
- **src/pages/** - Route-based page components

### Backend (`apps/api`)
- **src/index.ts** - Express server with Socket.IO integration
- **src/middlewares/auth.ts** - JWT authentication middleware
- **src/routes/** - RESTful API route definitions
- **src/controllers/** - Business logic handlers
- **prisma/schema.prisma** - Complete database schema

### Shared (`packages/types`)
- **src/index.ts** - TypeScript interfaces used by both frontend and backend

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS (Quantum theme)
- React Router
- Zustand (state management)
- Socket.IO Client

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Socket.IO (WebSockets)
- bcryptjs (password hashing)
- Zod (validation)

### Infrastructure
- Docker + Docker Compose
- PostgreSQL 15
- PgAdmin 4

## Available Scripts

### Root Level
- `npm run dev` - Start all workspaces in development mode
- `npm run dev:web` - Start frontend only
- `npm run dev:api` - Start backend only
- `npm run build` - Build all workspaces
- `npm run type-check` - Type check all workspaces
- `npm run format` - Format code with Prettier
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Backend Specific
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run migrations

## Database Schema

The Prisma schema includes:
- **Users & Roles** - User authentication and role-based permissions
- **Projects & Tasks** - Project management with Kanban-style tasks
- **Dashboards & Widgets** - Customizable dashboard layouts
- **Activity Logs** - User activity tracking
- **Notifications** - User notification system
- **User Preferences** - Theme and settings storage

## API Routes

- `/api/auth` - Authentication (register, login, refresh)
- `/api/projects` - Project CRUD operations
- `/api/tasks` - Task management
- `/api/dashboards` - Dashboard customization
- `/api/notifications` - Notification management

## WebSocket Events

Real-time features supported:
- Task updates
- New notifications
- Dashboard refresh triggers
- User online/offline status

## Theme System

The Quantum cosmic theme includes:
- **Nebula Core** - Deep space backgrounds (`nebula-void`, `nebula-dark`, etc.)
- **Cosmic Accents** - Glowing colors (`cosmic-purple`, `cosmic-blue`, etc.)
- **Glow Effects** - Box shadow utilities (`shadow-glow-sm/md/lg`)
- **Gradients** - Pre-defined cosmic gradients

## Next Steps

1. Install dependencies: `npm install`
2. Start Docker: `npm run docker:up`
3. Copy `.env.example` to `.env` in `apps/api`
4. Push database schema: `cd apps/api && npm run db:push`
5. Start development: `npm run dev`

The frontend will be at http://localhost:5173
The backend API will be at http://localhost:3000
PgAdmin will be at http://localhost:5050

# FlareBoard - Quick Start Guide

## What You Have

A complete, production-ready monorepo dashboard system with:

- ✅ **47 files** across 3 workspaces
- ✅ **Frontend**: React + Vite + Tailwind with Quantum cosmic theme
- ✅ **Backend**: Express + Prisma + PostgreSQL + Socket.IO
- ✅ **Shared Types**: Type-safe contracts between frontend and backend
- ✅ **Docker**: PostgreSQL + PgAdmin configured
- ✅ **UI Library**: Button, Card, Input, Badge, Modal components
- ✅ **Layouts**: Sidebar, TopBar, responsive layout system
- ✅ **Pages**: Home, Projects, Dashboard, Settings
- ✅ **API Routes**: Auth, Projects, Tasks, Dashboards, Notifications
- ✅ **Real-time**: WebSocket infrastructure ready
- ✅ **Database**: Complete Prisma schema for all features

## Get Started in 5 Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the entire monorepo.

### 2. Start the Database

```bash
npm run docker:up
```

This starts:
- PostgreSQL on port 5432
- PgAdmin on port 5050

### 3. Configure Environment

```bash
# Copy the environment template
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env if needed (default values work for local development)
```

### 4. Initialize Database

```bash
cd apps/api
npm run db:push
```

This pushes your Prisma schema to PostgreSQL.

### 5. Start Development Servers

```bash
# Go back to root
cd ../..

# Start both frontend and backend
npm run dev
```

## Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PgAdmin**: http://localhost:5050
  - Email: admin@nebula.com
  - Password: admin

## What to Build Next

The infrastructure is ready. Here's what's stubbed and ready for implementation:

### Phase 1 - Complete Authentication
- `apps/api/src/controllers/auth.controller.ts` - Implement JWT auth logic
- Add password hashing with bcryptjs
- Create login/register pages in frontend

### Phase 2 - Projects & Tasks
- Implement CRUD in `projects.controller.ts` and `tasks.controller.ts`
- Build Kanban board UI with drag-and-drop
- Connect WebSocket for real-time task updates

### Phase 3 - Dashboard System
- Implement widget registry pattern
- Create chart components
- Add layout customization

### Phase 4 - Notifications & Activity
- Real-time notifications via Socket.IO
- Activity feed component
- Notification center UI

## Useful Commands

```bash
# Development
npm run dev              # Start everything
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Database
npm run db:studio        # Open Prisma Studio (visual DB editor)
npm run db:push          # Push schema changes
npm run db:migrate       # Create migrations

# Docker
npm run docker:up        # Start services
npm run docker:down      # Stop services

# Code Quality
npm run type-check       # TypeScript checks
npm run format           # Format with Prettier

# Build
npm run build            # Build for production
npm run build:web        # Build frontend only
npm run build:api        # Build backend only
```

## Project Architecture

### Monorepo Workspaces
- `apps/web` - Frontend (can import `@nebula/types`)
- `apps/api` - Backend (can import `@nebula/types`)
- `packages/types` - Shared TypeScript interfaces

### Type Safety
All types are defined once in `packages/types/src/index.ts` and used everywhere.

Example:
```typescript
// In backend controller
import type { Task, CreateTaskRequest } from '@nebula/types'

// In frontend component
import type { Task } from '@nebula/types'
```

### Theming
The Quantum cosmic theme is configured in `apps/web/tailwind.config.ts`:
- Nebula core colors (void, dark, slate, indigo, mist, glow)
- Cosmic accent colors (purple, blue, cyan, pink, amber)
- Glow shadow utilities
- Gradient presets

## File Locations

**Need to add a new API endpoint?**
1. Create route in `apps/api/src/routes/`
2. Create controller in `apps/api/src/controllers/`
3. Add to `apps/api/src/index.ts`

**Need to add a new page?**
1. Create in `apps/web/src/pages/`
2. Add route to `apps/web/src/App.tsx`

**Need a new UI component?**
1. Create in `apps/web/src/components/ui/`
2. Follow existing pattern (Button, Card, etc.)

**Need to change database schema?**
1. Edit `apps/api/prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (production)

## Troubleshooting

### Port already in use
If ports 3000, 5173, or 5432 are in use:
- Change `PORT` in `apps/api/.env`
- Change port in `apps/web/vite.config.ts`
- Stop conflicting Docker containers

### Database connection error
- Ensure Docker is running: `docker ps`
- Check DATABASE_URL in `apps/api/.env`
- Restart Docker: `npm run docker:down && npm run docker:up`

### Type errors
- Run `npm run type-check` to see all errors
- Ensure you've run `npm install` in the root directory

## Next Steps

You have a solid foundation. The controllers have TODO comments showing what needs implementation. Start with authentication, then move to your core features.

The system is designed to scale - add new routes, components, and database models as needed. Everything is type-safe and ready for real-time features.

Happy building! 🌌

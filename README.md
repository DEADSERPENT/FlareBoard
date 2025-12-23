# 🔥 FlareBoard

**The Ultimate Multi-Module Dashboard System**

A modular, lightweight, highly customizable dashboard for teams, developers, and product managers. Built with pure engineering principles—no AI, just excellent UX and solid architecture.

## ✨ Features

- 🎨 Cosmic-inspired design with quantum theme system
- 📊 Multi-module dashboard with drag-and-drop widgets
- 🔄 Real-time updates via WebSockets
- 👥 Complete user and team management
- 📈 Advanced analytics and reporting
- 🎯 Kanban project boards with timelines
- 🔔 Smart notification center
- ⚙️ Extensive settings and admin panel

## 🏗️ Tech Stack

### Frontend
- **React** with **Vite** for blazing-fast development
- **Tailwind CSS** with custom Quantum theme
- **TypeScript** for type safety
- **Socket.IO Client** for real-time features

### Backend
- **Node.js** with **Express**
- **PostgreSQL** database
- **Prisma ORM** for type-safe database access
- **JWT** authentication
- **Socket.IO** for WebSocket connections

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd flareboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the database**
```bash
npm run docker:up
```

4. **Set up environment variables**
```bash
# Create .env file in apps/api
cp apps/api/.env.example apps/api/.env
```

5. **Run database migrations**
```bash
cd apps/api
npm run db:push
```

6. **Start development servers**
```bash
# In root directory
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PgAdmin: http://localhost:5050

## 📁 Project Structure

```
flareboard/
├── apps/
│   ├── web/              # React frontend
│   └── api/              # Express backend
├── packages/
│   └── types/            # Shared TypeScript types
├── docker-compose.yml    # Docker infrastructure
└── package.json          # Workspace configuration
```

## 🛠️ Development

```bash
# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:web

# Run only backend
npm run dev:api

# Type checking
npm run type-check

# Format code
npm run format

# Build for production
npm run build
```

## 🐳 Docker Commands

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View database in Prisma Studio
npm run db:studio
```

## 📦 Workspaces

This is a monorepo using npm workspaces:
- `apps/web` - Frontend application
- `apps/api` - Backend API server
- `packages/types` - Shared TypeScript interfaces

## 🎨 Theme System

FlareBoard uses a clean white and orange theme with:
- **Primary Orange**: Vibrant orange accents (#f97316)
- **Neutral Whites**: Clean white backgrounds
- **Professional Icons**: Lucide React icon system

## 📄 License

MIT

## 🤝 Contributing

This is a personal project. Contributions are welcome!

---

Built with 🔥 by the FlareBoard team

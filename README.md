# 🔥 FlareBoard

**The Ultimate Multi-Module Dashboard System**

[![CI](https://github.com/DEADSERPENT/FlareBoard/actions/workflows/ci.yml/badge.svg)](https://github.com/DEADSERPENT/FlareBoard/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/tests-63%20passing-success.svg)](https://github.com/DEADSERPENT/FlareBoard)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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
- ⌨️ Command Palette with Cmd/Ctrl+K for power users
- ✅ Comprehensive test coverage (63 passing tests)

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

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 🧪 Testing

FlareBoard uses **Vitest** and **React Testing Library** for comprehensive testing.

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Verify all CI checks locally (lint + type-check + test)
npm run verify
```

**Test Coverage:**
- AuthContext: Authentication flow, localStorage persistence
- UI Components: Button, Modal, Input with all variants
- TaskModal: Create/edit modes, validation, async operations
- CommandPalette: Navigation, search, keyboard shortcuts

**Current Stats:** 63 passing tests across 4 test suites

## 🔄 CI/CD

FlareBoard uses **GitHub Actions** for continuous integration. On every push and pull request:

- ✅ ESLint & Prettier checks
- ✅ TypeScript type checking
- ✅ Automated test suite (63 tests)
- ✅ Build verification
- ✅ Code coverage reporting

**Before pushing:**
```bash
npm run verify
```

See [`.github/CI_CD.md`](.github/CI_CD.md) for full documentation.

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

# Contributing to FlareBoard

Thank you for your interest in contributing to FlareBoard!

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp apps/api/.env.example apps/api/.env
```

3. Start Docker services:
```bash
npm run docker:up
```

4. Push database schema:
```bash
cd apps/api
npm run db:push
```

5. Start development servers:
```bash
npm run dev
```

## Project Structure

- `apps/web` - React frontend with Vite and Tailwind
- `apps/api` - Express backend with Prisma ORM
- `packages/types` - Shared TypeScript types

## Code Style

- We use Prettier for code formatting
- ESLint for linting
- Format on save is enabled in VSCode

## Commit Messages

Follow conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## Questions?

Feel free to open an issue for any questions or concerns.

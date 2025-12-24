import { vi } from 'vitest'

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'A test project',
  ownerId: '1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'A test task',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  projectId: '1',
  assigneeId: null,
  createdById: '1',
  dueDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const createMockFetch = (response: unknown) => {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    } as Response)
  )
}

export const createMockSocketIO = () => {
  return {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
}

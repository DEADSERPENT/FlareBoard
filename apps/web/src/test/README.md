# Testing Infrastructure

This directory contains the testing infrastructure for the FlareBoard web application.

## Overview

We use **Vitest** as our testing framework, integrated with **React Testing Library** for component testing.

## Files

- `setup.ts` - Global test setup and configuration
- `test-utils.tsx` - Custom render function with all necessary providers
- `mocks.ts` - Reusable mock data and helper functions

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

From the root directory:
```bash
npm run test:web        # Run web tests
npm run test:ui         # Open Vitest UI
npm run test:coverage   # Generate coverage report
```

## Writing Tests

### Component Tests

Use the custom `render` function from `test-utils.tsx` which wraps components with necessary providers:

```tsx
import { render, screen } from '@/test/test-utils'
import { MyComponent } from './MyComponent'

it('should render correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Hook Tests

For testing hooks, wrap them with the necessary providers:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

it('should handle auth', async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
  })

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### Using Mock Data

Import mock data from `mocks.ts`:

```tsx
import { mockUser, mockProject, mockTask } from '@/test/mocks'

it('should display user info', () => {
  render(<UserProfile user={mockUser} />)
  expect(screen.getByText(mockUser.name)).toBeInTheDocument()
})
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use semantic queries** - Prefer `getByRole` and `getByLabelText` over `getByTestId`
3. **Clean up after tests** - Use `beforeEach` and `afterEach` to reset state
4. **Mock external dependencies** - Mock API calls, localStorage, and external services
5. **Test edge cases** - Test loading states, error states, and empty states

## Coverage Goals

- Aim for >80% code coverage on critical paths
- 100% coverage on utility functions and shared logic
- Focus coverage on business logic and user interactions

## Examples

See existing tests for reference:
- `src/contexts/AuthContext.test.tsx` - Context/Hook testing
- `src/components/ui/Button.test.tsx` - Component testing

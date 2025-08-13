# Testing Commands for CP9 Frontend

## Running Tests

### Basic Test Commands
```bash
npm run test           # Run all tests once
npm run test:watch     # Run in watch mode
npm run test:coverage  # Generate coverage report
npm run test:ui        # Open Vitest UI
```

### Test Specific Files
```bash
npm run test -- MyComponent.test.tsx
npm run test -- src/features/auth
npm run test -- --grep "should render"
```

## Writing Tests

### Component Test Template
```typescript
// src/features/[feature]/components/__tests__/Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with props', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test Template
```typescript
// src/features/[feature]/hooks/__tests__/useMyHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial value', () => {
    const { result } = renderHook(() => useMyHook('initial'));
    expect(result.current.value).toBe('initial');
  });

  it('updates value', () => {
    const { result } = renderHook(() => useMyHook('initial'));
    
    act(() => {
      result.current.setValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });
});
```

### API Route Test Template
```typescript
// src/app/api/[endpoint]/__tests__/route.test.ts
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('API Route', () => {
  it('handles GET request', async () => {
    const request = new NextRequest('http://localhost:3000/api/test');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('result');
  });

  it('handles POST request', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Mock Patterns

### Mock Supabase
```typescript
vi.mock('@/shared/lib/supabase-config', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));
```

### Mock Zustand Store
```typescript
import { useStore } from '@/store/searchStore';

vi.mock('@/store/searchStore', () => ({
  useStore: vi.fn(),
}));

// In test
(useStore as any).mockReturnValue({
  searches: [],
  addSearch: vi.fn(),
  clearSearches: vi.fn(),
});
```

## Coverage Requirements
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Coverage report available at: `coverage/index.html`
# Component Creation Commands

## Create Feature Component
When creating a new feature component:

1. **Create in feature folder**:
```typescript
// src/features/[feature]/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  // Define props
}

export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

2. **Export from index**:
```typescript
// src/features/[feature]/components/index.ts
export { MyComponent } from './MyComponent';
```

## Create UI Component
For shared UI components:

```typescript
// src/shared/ui/MyButton.tsx
import { cn } from '@/shared/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded',
          variant === 'primary' && 'bg-blue-500 text-white',
          variant === 'secondary' && 'bg-gray-200 text-gray-800',
          className
        )}
        {...props}
      />
    );
  }
);

MyButton.displayName = 'MyButton';
```

## Create Hook
For custom hooks:

```typescript
// src/features/[feature]/hooks/useMyHook.ts
import { useState, useEffect } from 'react';

export const useMyHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Hook logic
  }, [value]);
  
  return { value, setValue };
};
```

## Create API Route
For API routes:

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API logic
    return NextResponse.json({ data: 'result' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle POST
  return NextResponse.json({ success: true });
}
```

## Testing Components
Create test alongside component:

```typescript
// src/features/[feature]/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```
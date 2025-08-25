# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Commands
```bash
# Install dependencies
pnpm install

# Development
pnpm dev                 # Start development server (http://localhost:3000)
pnpm build              # Build production app
pnpm start              # Run production build

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage report
pnpm test:ui            # Run tests with UI

# Code Quality
pnpm lint               # Run ESLint
pnpm type-check         # Run TypeScript type checking (tsc --noEmit)
```

### Type Safety Verification
```bash
# Essential pre-commit checks
pnpm type-check         # Must pass - no any types allowed
pnpm lint               # Must pass - code style
pnpm build              # Must succeed before deployment

# Find any types (should return nothing)
grep -r ": any" src/
grep -r "any\[\]" src/
```

## Architecture Overview

### Project Structure
```
src/
├── shared/             # Global shared resources
│   ├── components/     # Complex shared components (navbar, etc.)
│   │   ├── advanced-ui/  # Animation & interactive components
│   │   └── custom-ui/    # Basic UI components (button, card, input, label)
│   ├── ui/            # Base UI components (re-export from custom-ui)
│   ├── hooks/         # Global hooks
│   ├── lib/           # Utility functions
│   └── types/         # Common type definitions
├── features/          # Feature-based modules
│   ├── auth/          # Authentication system
│   ├── product/       # Product search & management
│   ├── workflow/      # AI workflow system
│   └── research/      # Research & analytics
├── infrastructure/    # Infrastructure layer
│   ├── api/          # API clients (Coupang, Supabase)
│   ├── cache/        # Cache management
│   ├── scraping/     # Web scraping utilities
│   └── utils/        # Low-level utilities
├── app/              # Next.js App Router pages
└── store/            # Global state management
```

### Key Architecture Principles

1. **Feature-Based Architecture**: Each feature has its own folder with components, hooks, types, and utils
2. **Component Organization**:
   - `shared/ui/`: Basic UI components (buttons, cards, inputs)
   - `shared/components/advanced-ui/`: Advanced UI with animations
   - `shared/components/`: Complex shared components
   - `features/{feature}/components/`: Feature-specific components
3. **Import Pattern**: Always use absolute imports with `@/` prefix
4. **Type Safety**: NO `any` types - all variables and functions must have explicit types

### Import Guidelines
```typescript
// Correct imports
import { Button, Card } from '@/shared/ui'
import { FadeInSection, Carousel } from '@/shared/components/advanced-ui'
import { Navbar } from '@/shared/components'
import { useAuth } from '@/features/auth/hooks'

// Never use relative imports for shared resources
```

## Type System Requirements

### Core Rules
- **NO `any` types**: Every variable, parameter, and return value must be explicitly typed
- **Interface First**: Use interfaces for object shapes (not type aliases)
- **Generics**: Use generics for reusable components and hooks
- **Type Guards**: Implement runtime type checking for external data

### Type Definition Locations
- **Common Types**: `src/shared/types/` - Global types used across features
- **Feature Types**: `src/features/{feature}/types/` - Feature-specific types
- **Infrastructure Types**: `src/infrastructure/types/` - API responses, cache types

### Example Type Patterns
```typescript
// Component Props
interface ProductItemProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
  isSelected: boolean;
  loading?: boolean;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Type Guards
function isProductItem(item: unknown): item is ProductItem {
  return typeof item === 'object' && 
         item !== null && 
         'productId' in item;
}
```

## Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (no shadcn/ui)
- **State Management**: React Context + Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Workflow**: LangGraph
- **Testing**: Vitest + Testing Library
- **Web Scraping**: Playwright, Scrapfly SDK

## API Integration

### Coupang Partners API
- Location: `src/infrastructure/api/coupang.ts`
- HMAC signature: `src/infrastructure/utils/coupang-hmac.ts`
- Product search, category listings, deep link conversion

### Supabase
- Location: `src/infrastructure/api/supabase.ts`
- Authentication, database operations, real-time subscriptions

### AI Workflow (LangGraph)
- Location: `src/app/api/langgraph/`
- SEO content generation, product analysis

## Environment Variables

Required environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Coupang Partners
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
COUPANG_PARTNER_ID=

# OpenAI (for LangGraph)
OPENAI_API_KEY=

# Perplexity (optional)
PERPLEXITY_API_KEY=
```

## Component Development Pattern

```typescript
'use client'

import { Button, Card } from '@/shared/ui'
import { FadeInSection } from '@/shared/components/advanced-ui'
import { useAuth } from '@/features/auth/hooks'

interface MyComponentProps {
  title: string
  onAction: () => void
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const { user, isLoading } = useAuth()

  return (
    <FadeInSection>
      <Card>
        <h2>{title}</h2>
        <Button onClick={onAction} disabled={isLoading}>
          Action
        </Button>
      </Card>
    </FadeInSection>
  )
}
```

## Recent Architectural Changes

### UI Component Reorganization (2024-08-16)
- Removed shadcn/ui dependency - all UI components are now custom
- `shared/ui/`: Custom basic UI components
- `shared/components/advanced-ui/`: Animation and interactive components
- All imports updated to new structure

### Feature-Based Architecture (2024-08-14)
- Migrated from `src/components` to feature-based structure
- Each feature now contains its own components, hooks, types, and utils
- Shared components moved to `src/shared/components/`

## Testing Strategy

- Unit tests for utilities and hooks
- Component testing with Testing Library
- E2E testing considerations with Playwright
- Test files co-located with source files in `__tests__` folders
- Coverage thresholds: 80% for all metrics

## Performance Considerations

- Image optimization with Next.js Image component
- API route caching strategies
- Client-side state management with Zustand
- Server components by default, client components when needed
- Lazy loading for heavy components

## Security Guidelines

- Environment variables validation on startup
- Input sanitization in API routes
- CORS configuration in Next.js config
- Supabase Row Level Security (RLS) policies
- No sensitive data in client-side code

## Deployment

- Production builds must pass all type checks
- Vercel deployment recommended (automatic with push to main)
- Docker support available (see Dockerfile if present)
- Environment variables must be set in deployment platform
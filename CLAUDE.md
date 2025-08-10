# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Overview

CP9 is a **Coupang Partners Auto-Blog SaaS** that automates the entire process from product search to blog post publishing using AI workflow automation. The system performs product research, generates SEO-optimized content, and publishes WordPress drafts in one click.

**Key Technologies:**
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Zustand, shadcn/ui
- **Backend**: Supabase Edge Functions, LangGraph workflow automation  
- **AI/ML**: Perplexity API, OpenAI GPT for content generation
- **External APIs**: Coupang Open API, WordPress REST API

## 📋 Development Commands

### Frontend (in `frontend/` directory)
```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run Vitest tests
npm run test:watch      # Run tests in watch mode  
npm run test:coverage   # Run tests with coverage report
npm run test:ui         # Run tests with UI interface

# Quick development start (from project root)
cd frontend && npm run dev
```

### Backend (Supabase Edge Functions)
```bash
# Using Supabase CLI (install: npm install -g supabase)
supabase init           # Initialize local development
supabase start          # Start local Supabase services  
supabase stop           # Stop local Supabase services
supabase status         # Check service status

# Deploy functions
supabase functions deploy item-research     # Deploy research function
supabase functions deploy write            # Deploy SEO writing function
supabase functions deploy --no-verify-jwt  # Deploy without JWT verification

# Check function logs
supabase functions logs item-research --tail
supabase functions logs write --tail
```

### Testing Key Workflows
```bash
# Test AI workflow endpoints
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{"action":"execute","keyword":"무선 이어폰","config":{"maxProducts":3}}'

# Test research API
curl -X POST http://localhost:3000/api/item-research \
  -H "Content-Type: application/json" \
  -d '{"itemName":"샘플 상품","itemId":"test_001"}'

# Test pages for manual verification:
# - http://localhost:3000/simple-test (LangGraph node testing)
# - http://localhost:3000/test (integrated workflow testing)
# - http://localhost:3000/research (research data management)
# - http://localhost:3000/product (product search interface)
```

## 🏢 Architecture & Project Structure

This project follows a **hybrid monorepo architecture** with clear separation between frontend UI and backend workflow automation:

### High-Level Architecture
```
┌─ Frontend (Next.js) ─────────────────────┐    ┌─ Backend (Supabase) ───────────┐
│  • User Interface                        │    │  • Edge Functions               │
│  • API Routing (/api/*)                  │◄──►│  • AI Workflow Automation       │
│  • State Management (Zustand)            │    │  • External API Integration     │
│  • Component Library (shadcn/ui)         │    │  • Database & Auth              │
└──────────────────────────────────────────┘    └────────────────────────────────┘
                    │                                           │
                    ▼                                           ▼
            ┌─ External APIs ─────────────────────────────────────────┐
            │  • Coupang Open API (product search, deep links)        │
            │  • Perplexity API (AI product research)                 │  
            │  • OpenAI API (SEO content generation)                  │
            │  • WordPress REST API (blog publishing)                 │
            └─────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Feature-Based Architecture**: Each domain lives in `frontend/src/features/[domain]/`
2. **API Proxy Pattern**: Frontend `/api/*` routes proxy to Supabase Edge Functions
3. **Workflow Automation**: LangGraph-based AI agents handle multi-step processes
4. **Unified Response Format**: All APIs return consistent `CoupangProductResponse` interface

### Core Workflow (AI-Powered Product → Blog Pipeline)
```
User Input (keyword/URLs) 
  → coupangProductSearch (random selection)
  → item-research Edge Function (ResearchPack creation)
  → [User Review & Edit in /research page]
  → write Edge Function (GPT SEO content generation)
  → [User Approval - Coming Soon]
  → wordpressPublisher (draft creation - Coming Soon)
```

## 📂 Critical Directory Structure

### Frontend (`frontend/src/`)
```
features/                    # Domain-specific features (MAIN LOGIC)
├── auth/                   # Authentication system
├── product/                # Product search & management  
├── research/               # 🆕 Research data management
│   ├── components/
│   │   └── ResearchCard.tsx          # Research item display & quick editing
│   └── hooks/useResearch.ts          # Research CRUD operations
├── workflow/               # AI workflow UI components
│   ├── components/WorkflowProgress.tsx  # Real-time workflow UI
│   └── hooks/useWorkflow.ts            # Workflow state management
└── search/                 # Search functionality

app/api/                    # Next.js API routes (PROXY LAYER)
├── products/              # Product-related APIs (search, deeplink, etc.)
├── research/              # 🆕 Research data CRUD API
│   ├── route.ts          # List and create research
│   └── [id]/route.ts     # Get, update, delete by ID
├── write/                 # 🆕 SEO content generation API (proxy to Edge Function)
├── drafts/                # 🆕 Draft content retrieval API
├── workflow/              # Main workflow API (proxies to Edge Functions)
│   ├── route.ts          # Core workflow execution
│   └── stream/route.ts   # Real-time status streaming
└── test/                  # Testing endpoints

infrastructure/             # External service clients (INTEGRATION LAYER)
├── api/                   # API clients (Coupang, WordPress, Perplexity, etc.)
├── scraping/              # Web scraping utilities (Coupang, Scrapfly)
├── cache/                 # Cache system (Redis)
├── queue/                 # Queue system
└── auth/                  # Authentication services

shared/                    # Reusable components (COMMON LAYER)
├── types/                 # Unified type definitions
│   ├── api.ts            # CoupangProductResponse, etc.
│   ├── research.ts       # 🆕 ResearchPack, DraftItem, etc.
│   └── common.ts         # Common types
├── lib/                   # Common utilities
│   ├── api-utils.ts      # API response normalization
│   └── utils.ts          # cn(), etc.
├── hooks/                 # Common hooks (useClipboard, useModal, etc.)
└── ui/                    # shadcn/ui components (Button, Card, etc.)
```

### Backend (`backend/supabase/functions/`)
```
_shared/                   # Common utilities
├── cors.ts, response.ts   # CORS & response helpers
├── coupang.ts            # Coupang API utilities  
└── type.ts               # Common types

item-research/            # Research data generation
├── index.ts             # ResearchPack creation logic

write/                    # 🆕 SEO content generation (5장)
├── index.ts             # GPT-based SEO content creation

cache-gateway/           # Caching and queue management
queue-worker/           # Background task processing  
langgraph-api/          # LangGraph workflow orchestration

migrations/             # 🆕 Database schema
└── 20250110_create_drafts_table.sql  # Drafts table creation
```

## 🔧 Development Guidelines

### Working with AI Workflows
- **Backend AI Logic**: Lives in separate Edge Functions (`item-research/`, `write/`, etc.)
- **Frontend Layer**: Proxies requests via `/api/research/`, `/api/write/` etc.
- **Research Management**: Use `/research` page for data review and editing
- **Testing**: Use `/simple-test` for individual node testing
- **Structured Data Flow**: Product Search → Research → Write → Review → Publish

### API Development Patterns
```typescript
// All product APIs must return this normalized format:
interface CoupangProductResponse {
  productName: string;
  productPrice: number;
  productImage: string; 
  productUrl: string;
  productId: number;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
}

// Research data structure:
interface ResearchPack {
  itemId: string;
  title?: string;
  priceKRW?: number | null;
  isRocket?: boolean | null;
  features?: string[];
  pros?: string[];
  cons?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

// Use the normalization utilities:
import { normalizeCoupangProduct } from '@/shared/lib/api-utils';
const normalizedProducts = rawData.map(normalizeCoupangProduct);
```

### State Management with Zustand
- Global state in `frontend/src/store/`
- Feature-specific state in respective `features/[domain]/hooks/`
- Persistent state automatically saved to localStorage

### Component Architecture
```typescript
// Feature components follow this pattern:
features/[domain]/
├── components/           # UI components
├── hooks/               # State management & API calls
├── types/               # TypeScript interfaces  
├── utils/               # Domain-specific utilities
└── index.ts            # Public exports
```

## 🌟 Key Features & Implementation Notes

### 1. Research Data Management System
- **Frontend**: `/research` page with `ResearchCard.tsx` components + `/research/[id]` detail pages
- **Backend**: `research` table + `/api/research/` CRUD operations
- **Features**: View, edit, and manage research data before SEO generation
- **Flow**: Product Search → Research Review → SEO Generation
- **Detail Page**: Full-page editor with tabs for features, pros, cons, keywords

### 2. SEO Content Generation Pipeline
- **Research Creation**: `item-research` Edge Function → `ResearchPack`
- **Content Generation**: `write` Edge Function → GPT-4 SEO content
- **Storage**: `drafts` table with metadata + markdown content
- **UI Integration**: Individual/bulk generation from `/research` page

### 3. Multi-Modal Product Input
- **Keyword-based**: Search Coupang API → random selection → research
- **Category-based**: Best category products → research
- **URL-based**: Direct product URLs → extract IDs → research
- **Fallback**: Graceful handling when external APIs fail

### 4. Real-time Status Tracking
- **Draft Status**: Real-time tracking of which items have drafts generated
- **Progress Indicators**: Visual feedback during SEO generation
- **State Synchronization**: Frontend state updates with backend changes

## 🔐 Environment Variables

### Required Frontend (.env.local)
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Additional API keys managed in Supabase Dashboard
```

### Backend (Supabase Edge Functions - Set in Dashboard)
```bash
# Coupang API
COUPANG_ACCESS_KEY=your_coupang_access_key  
COUPANG_SECRET_KEY=your_coupang_secret_key

# AI Services  
PERPLEXITY_API_KEY=your_perplexity_api_key
OPENAI_API_KEY=your_openai_api_key

# WordPress Publishing
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=your_wp_username
WORDPRESS_PASSWORD=your_wp_app_password
```

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
npm run test                    # Run all tests
npm run test:coverage          # With coverage report (80% threshold)
npm run test:watch             # Watch mode for development
```

### Integration Testing  
- **Workflow Testing**: Use `/simple-test` page for individual AI nodes
- **API Testing**: Use `/test` page for end-to-end workflow validation
- **Manual Testing**: Each feature has dedicated test pages in `/app/[feature]-test/`

### Test File Structure
```
src/
├── components/ui/__tests__/       # UI component tests
├── features/auth/__tests__/       # Feature-specific tests
└── shared/lib/__tests__/          # Utility function tests
```

## 🚀 Deployment & Configuration

### Frontend Deployment
- **Platform**: Vercel (recommended) or any Next.js-compatible host
- **Build Command**: `npm run build`
- **Environment**: Set Supabase URLs in deployment environment

### Backend Deployment (Supabase Edge Functions)
- **Auto-deploy**: Connected via GitHub integration (recommended)
- **Manual**: `supabase functions deploy ai-workflow`  
- **Environment**: Set API keys in Supabase Dashboard → Settings → Environment Variables

### Next.js Configuration Notes
- **Image Optimization**: Configured for Coupang CDN domains in `next.config.ts`
- **Webpack Fallbacks**: Extensive Node.js polyfills for LangGraph compatibility
- **TypeScript**: Strict mode enabled, path aliases configured (`@/`)

## 🎯 Critical Implementation Details

### Authentication Flow
- All authenticated requests require Supabase session
- Auth state is managed via `AuthContext` and persisted in localStorage
- Protected routes are wrapped with `AuthGuard` component
- Supabase Edge Functions validate JWT tokens from frontend

### Error Handling Pattern
- All API routes return consistent error format: `{ error: string, details?: any }`
- External API failures have fallback mechanisms
- User-facing errors are displayed via toast notifications (react-hot-toast/sonner)

### Data Flow for Product → Blog Pipeline
1. **Product Search**: User inputs keyword → Coupang API → Normalize to `CoupangProductResponse`
2. **Research Generation**: Selected products → `item-research` Edge Function → `ResearchPack` data
3. **Review & Edit**: `/research` page displays all research → User can edit via detail page
4. **SEO Content**: Research data → `write` Edge Function → GPT-4 generates blog content
5. **Draft Storage**: Generated content → Stored in `drafts` table with metadata

## 🔧 Common Development Patterns

### Adding New Edge Functions
1. Create new function in `backend/supabase/functions/[function-name]/`
2. Implement with consistent CORS and error handling
3. Add proxy route in `frontend/src/app/api/[function-name]/route.ts`
4. Update TypeScript interfaces in `shared/types/`
5. Test function individually before integration

### Creating New Research Features
1. Add UI components in `features/research/components/`
2. Create hooks in `features/research/hooks/` for state management
3. Update `shared/types/research.ts` for new data structures
4. Add API routes in `app/api/research/` if needed
5. Test with existing research data

### Integrating External Services
1. Create client in `infrastructure/api/[service-name].ts`  
2. Add environment variables in Supabase Dashboard
3. Implement with retry logic and fallback strategies
4. Add TypeScript interfaces for request/response
5. Test integration thoroughly before production use

### Adding New UI Pages
1. Create page in `app/[page-name]/page.tsx`
2. Add navigation link in `components/common/navbar.tsx`
3. Create feature components in `features/[domain]/components/`
4. Add required hooks in `features/[domain]/hooks/`
5. Update shared types if needed

## ⚠️ Important Security & Performance Notes

- **API Keys**: Never expose in frontend code - all managed in Supabase Edge Functions
- **CORS**: Properly configured for cross-origin requests
- **Rate Limiting**: Implement for external API calls to avoid quota limits
- **Error Handling**: All external API calls have fallback mechanisms
- **Image Optimization**: Next.js Image component configured for Coupang CDNs
- **Bundle Size**: Webpack configured to exclude Node.js modules from client bundle

## 🔍 Debugging Tips

### Common Issues & Solutions
- **Supabase connection errors**: Check `supabase status` and ensure services are running
- **CORS errors in Edge Functions**: Verify `_shared/cors.ts` is properly imported
- **Type errors after API changes**: Update interfaces in `shared/types/` and restart dev server
- **LangGraph import errors**: Check webpack fallbacks in `next.config.ts`

### Useful Debug Commands
```bash
# Check Supabase logs for errors
supabase db logs --tail

# Test Edge Function locally
supabase functions serve item-research --env-file .env.local

# Clear Next.js cache
rm -rf frontend/.next && npm run dev
```

This architecture ensures secure, scalable, and maintainable AI-powered workflow automation while keeping the frontend lightweight and responsive.
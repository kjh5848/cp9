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
```

### Backend (Supabase Edge Functions)
```bash
# Using Supabase CLI (install: npm install -g supabase)
supabase init           # Initialize local development
supabase start          # Start local Supabase services  
supabase functions deploy ai-workflow     # Deploy specific function
supabase functions deploy --no-verify-jwt # Deploy without JWT verification

# Check function logs
supabase functions logs ai-workflow
```

### Testing Key Workflows
```bash
# Test AI workflow endpoints
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{"action":"execute","keyword":"무선 이어폰","config":{"maxProducts":3}}'

# Test individual components at:
# - http://localhost:3000/simple-test (LangGraph node testing)
# - http://localhost:3000/test (integrated workflow testing)
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
  → extractIds (URL parsing)  
  → aiProductResearch (AI enhancement)
  → seoAgent (GPT content generation)
  → wordpressPublisher (draft creation)
```

## 📂 Critical Directory Structure

### Frontend (`frontend/src/`)
```
features/                    # Domain-specific features (MAIN LOGIC)
├── auth/                   # Authentication system
├── product/                # Product search & management  
├── workflow/               # AI workflow UI components
│   ├── components/WorkflowProgress.tsx  # Real-time workflow UI
│   └── hooks/useWorkflow.ts            # Workflow state management
└── search/                 # Search functionality

app/api/                    # Next.js API routes (PROXY LAYER)
├── workflow/               # Main workflow API (proxies to Edge Functions)
│   ├── route.ts           # Core workflow execution
│   └── stream/route.ts    # Real-time status streaming
├── products/              # Product-related APIs
└── test/                  # Testing endpoints

infrastructure/             # External service clients (INTEGRATION LAYER)
├── api/                   # API clients (Coupang, WordPress, etc.)
├── auth/                  # Authentication services
└── scraping/              # Web scraping utilities

shared/                    # Reusable components (COMMON LAYER)
├── types/api.ts          # Unified API type definitions
├── lib/api-utils.ts      # API response normalization
└── ui/                   # shadcn/ui components
```

### Backend (`backend/supabase/functions/`)
```
ai-workflow/               # CORE AI AUTOMATION ENGINE
├── index.ts              # Main workflow orchestrator
└── [Implements all AI nodes: search → research → content → publish]

cache-gateway/            # Caching and queue management
queue-worker/            # Background task processing
```

## 🔧 Development Guidelines

### Working with AI Workflows
- **All AI business logic lives in `backend/supabase/functions/ai-workflow/`**
- **Frontend only handles UI and proxies requests via `/api/workflow/`**  
- Test individual workflow nodes at `/simple-test` before full integration
- Use structured logging for debugging AI workflows

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

// Use the normalization utility:
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

### 1. Real-time Workflow Progress
- **Frontend**: `WorkflowProgress.tsx` + `useWorkflow.ts` hook
- **Backend**: Server-Sent Events via `/api/workflow/stream/`  
- **Implementation**: Polls workflow status every 2 seconds, displays progress

### 2. AI Content Generation Pipeline
- **coupangProductSearch**: Keyword → product discovery (with randomization)
- **extractIds**: URL parsing for product IDs
- **aiProductResearch**: Perplexity API for product enrichment  
- **seoAgent**: GPT-4 for SEO blog content using CO-STAR prompts
- **wordpressPublisher**: WordPress REST API for draft creation

### 3. Hybrid Product Input Methods
- **Keyword-based**: Search Coupang API → random selection → AI workflow
- **URL-based**: Direct product URLs → extract IDs → AI workflow  
- **Fallback**: Uses dummy data when external APIs fail

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

## 🔧 Common Development Patterns

### Adding New AI Workflow Nodes
1. Implement node function in `backend/supabase/functions/ai-workflow/index.ts`
2. Add to workflow execution chain in `executeAIWorkflow()`
3. Update interfaces for request/response types
4. Test individual node at `/simple-test`

### Creating New Product APIs  
1. Add route in `frontend/src/app/api/products/[new-endpoint]/route.ts`
2. Implement with consistent error handling and response format
3. Use `normalizeCoupangProduct()` for standardized output
4. Add TypeScript interfaces in `shared/types/api.ts`

### Integrating External Services
1. Create client in `infrastructure/api/[service-name].ts`  
2. Add environment variables and validation
3. Implement with retry logic and fallback strategies
4. Test integration thoroughly before production use

## ⚠️ Important Security & Performance Notes

- **API Keys**: Never expose in frontend code - all managed in Supabase Edge Functions
- **CORS**: Properly configured for cross-origin requests
- **Rate Limiting**: Implement for external API calls to avoid quota limits
- **Error Handling**: All external API calls have fallback mechanisms
- **Image Optimization**: Next.js Image component configured for Coupang CDNs
- **Bundle Size**: Webpack configured to exclude Node.js modules from client bundle

This architecture ensures secure, scalable, and maintainable AI-powered workflow automation while keeping the frontend lightweight and responsive.
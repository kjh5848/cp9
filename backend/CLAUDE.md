# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Supabase Edge Functions backend** for CP9 Coupang Partners Auto-Blog SaaS. The backend provides a **modular, serverless architecture** with comprehensive shared utilities that eliminate code duplication and ensure consistency across all functions.

**Technology Stack:**
- **Runtime**: Deno (Supabase Edge Functions)
- **Language**: TypeScript with strict typing
- **Database**: Supabase PostgreSQL
- **AI Services**: Perplexity API, OpenAI GPT
- **External APIs**: Coupang Open API, WordPress REST API
- **Caching**: Redis for performance optimization
- **Queue**: LangGraph-based task queuing system

**Architecture Principles:**
- **DRY (Don't Repeat Yourself)**: All shared functionality consolidated in `_shared/` directory
- **Consistency**: Standardized error handling, CORS, and response formats
- **Type Safety**: Comprehensive TypeScript definitions across all modules
- **Modularity**: Each function handles a specific, focused domain

## Development Commands

### Prerequisites & Setup
```bash
# Install Supabase CLI (recommended via npm)
npm install -g supabase
# Note: Global install may show warnings but works for CLI usage
# Alternative: Use npx supabase for individual commands

# First time setup
supabase login
# Get access token from https://supabase.com/dashboard/account/tokens

# Link to your project (required for deployment)
supabase link --project-ref <your-project-ref>
```

### Critical Development Notes
- **CLI-Only Strategy**: Using CLI deployment keeps project on free tier
- **No GitHub Integration**: Connecting to GitHub requires paid plan upgrade
- **Secrets via CLI**: All environment variables managed through Supabase CLI, never in code
- **Local Development**: Always test functions locally before deployment

### Local Development
```bash
# Start local Supabase services (database, auth, storage, functions)
supabase start

# Serve all Edge Functions locally for development
supabase functions serve

# Serve specific function with environment variables
supabase functions serve [function-name] --env-file .env.local

# Check service status and URLs
supabase status

# Stop all local services
supabase stop
```

### Secrets Management (Critical)
```bash
# Set environment variables for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-... PERPLEXITY_API_KEY=pplx-...

# Batch set from .env file
supabase secrets set --env-file ../frontend/.env.local

# List current secrets (names only, values hidden)
supabase secrets list

# Required secrets for this project:
# - OPENAI_API_KEY
# - PERPLEXITY_API_KEY  
# - COUPANG_ACCESS_KEY
# - COUPANG_SECRET_KEY
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

### Deployment
```bash
# Deploy specific function
supabase functions deploy [function-name]

# Deploy all functions
supabase functions deploy

# Deploy without JWT verification (testing only)
supabase functions deploy --no-verify-jwt

# Check function logs in real-time
supabase functions logs [function-name] --tail
```

### Database Operations
```bash
# Apply database migrations
supabase db push

# Generate TypeScript types from schema
supabase gen types typescript --local > types/database.ts

# Reset local database to clean state
supabase db reset
```

## High-Level Architecture

### Modular Function Architecture
The backend follows a strict **shared utilities pattern** where all Edge Functions leverage common modules:

```
functions/
├── _shared/              # 🔧 MANDATORY shared utilities
│   ├── server.ts         # Edge Function wrapper with CORS/error handling
│   ├── response.ts       # Standardized ok()/fail() responses
│   ├── redis.ts          # Redis client and queue utilities
│   ├── cors.ts          # CORS configuration
│   └── type.ts          # Common TypeScript definitions
├── item-research/        # Product research with Perplexity API
├── write/               # SEO content generation with OpenAI
├── cache-gateway/       # Redis caching and queue management
├── queue-worker/        # Background task processing
└── langgraph-api/       # LangGraph workflow orchestration
```

### Critical Shared Utilities Pattern

**Every Edge Function MUST follow this pattern:**

```typescript
// 1. Standard imports
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// 2. MANDATORY shared utilities
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";

// 3. Domain-specific utilities (as needed)
import { createRedisClient } from "../_shared/redis.ts";
import { MyType } from "../_shared/type.ts";

// 4. Handler function using shared utilities
async function handleMyFunction(req: Request): Promise<Response> {
  const body = await safeJsonParse<MyRequestType>(req);
  if (!body?.requiredField) {
    return fail("requiredField is required", "VALIDATION_ERROR", 400);
  }
  
  // Your business logic here
  const result = await processMyLogic(body);
  
  return ok(result);
}

// 5. Server setup with automatic CORS/error handling
serve(createEdgeFunctionHandler(handleMyFunction));
```

### Shared Utilities Reference

**Server Utilities (`_shared/server.ts`)**
- `createEdgeFunctionHandler()` - Handles CORS, method validation, error handling
- `safeJsonParse<T>()` - Safe JSON parsing with error handling
- `validateEnvVars()` - Environment variable validation
- `handleError()` - Standardized error handling

**Response Utilities (`_shared/response.ts`)**
- `ok(data)` - Standardized success response
- `fail(message, code, status, extra)` - Standardized error response

**Redis Utilities (`_shared/redis.ts`)**
- `createRedisClient()` - Redis client factory
- `generateCacheKey()` - Cache key generation
- `generateJobId()` - Queue job ID generation

### Data Flow Architecture

The system follows a **linear pipeline architecture**:

```
User Input → Product Search → Research Generation → SEO Content → Draft Storage
     ↓              ↓               ↓                    ↓            ↓
  Frontend    item-research    Perplexity API      write function   Database
             Edge Function                        Edge Function
```

**Key Tables:**
- `research` - Stores ResearchPack data from item-research function
- `drafts` - Stores generated SEO content from write function

### Error Handling Strategy

All functions use **consistent error handling**:

1. **Environment Validation**: Check required environment variables at startup
2. **Request Validation**: Parse and validate incoming requests
3. **Business Logic**: Execute with try-catch blocks
4. **Standardized Responses**: Always use `ok()` or `fail()` responses
5. **Logging**: Log errors with context for debugging

### Testing Strategy

**Local Testing:**
```bash
# Test specific function
curl -X POST http://localhost:54321/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"itemName":"test product","projectId":"test","itemId":"test_001"}'
```

**Production Testing:**
```bash
# Test deployed function
curl -X POST https://[project-ref].supabase.co/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"itemName":"test product","projectId":"test","itemId":"test_001"}'
```

## Development Guidelines

### MANDATORY: Use Shared Utilities

🚨 **Before writing ANY code, check `_shared/` directory first!**

- Never duplicate CORS handling
- Never create manual JSON parsing
- Never create manual error responses
- Always use the standardized patterns

### Common Anti-Patterns to Avoid

```typescript
// ❌ DON'T: Manual CORS handling
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // ... rest of function
});

// ❌ DON'T: Manual JSON parsing
const body = await req.json();

// ❌ DON'T: Manual error responses
return new Response(
  JSON.stringify({ error: "Something went wrong" }),
  { status: 500 }
);
```

```typescript
// ✅ DO: Use shared utilities
serve(createEdgeFunctionHandler(async (req) => {
  const body = await safeJsonParse<RequestType>(req);
  if (!body) return fail("Invalid request", "PARSE_ERROR", 400);
  
  // Business logic only
  return ok(result);
}));
```

### Environment Variables

Required environment variables must be set via Supabase CLI:

```bash
# Core AI services
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...

# Coupang API  
COUPANG_ACCESS_KEY=...
COUPANG_SECRET_KEY=...

# Supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional: Redis, WordPress
REDIS_URL=...
WORDPRESS_URL=...
```

### Adding New Functions

1. **Create function directory**: `functions/new-function/`
2. **Follow shared utilities pattern**: Import and use `_shared` modules
3. **Add types**: Define request/response types in `_shared/type.ts`
4. **Test locally**: Use `supabase functions serve`
5. **Deploy**: Use `supabase functions deploy new-function`

### Database Schema Changes

1. **Create migration file**: `migrations/YYYYMMDD_description.sql`
2. **Apply locally**: `supabase db push`
3. **Test thoroughly**: Verify changes work with functions
4. **Apply to production**: `supabase db push --linked`

## Common Issues & Solutions

### Function Deployment Fails
- **Check**: `supabase link` is configured
- **Check**: `supabase login` is active
- **Check**: All required secrets are set

### CORS Errors
- **Solution**: Always use `createEdgeFunctionHandler()`
- **Never**: Handle CORS manually in individual functions

### Environment Variable Errors
- **Solution**: Use `validateEnvVars()` from shared utilities
- **Check**: Secrets are set via `supabase secrets set`

### Code Duplication
- **Prevention**: Always check `_shared/` before writing new code
- **Rule**: If 2+ functions need the same code, it belongs in `_shared/`

For detailed API documentation, see `API-DOCUMENTATION.md`.
For implementation examples, see existing functions in `functions/` directory.
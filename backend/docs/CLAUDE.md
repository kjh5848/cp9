# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Supabase Edge Functions backend** for the CP9 Coupang Partners Auto-Blog SaaS. The backend provides a **modular, serverless architecture** with shared utilities to eliminate code duplication and ensure consistency across all functions.

**Technology Stack:**
- **Runtime**: Deno (Supabase Edge Functions)
- **Language**: TypeScript with strict typing
- **Database**: Supabase PostgreSQL
- **AI Services**: Perplexity API, OpenAI GPT
- **External APIs**: Coupang Open API, WordPress REST API
- **Caching**: Redis for performance optimization
- **Queue**: LangGraph-based task queuing system

**Architecture Principles:**
- **DRY (Don't Repeat Yourself)**: Shared utilities in `_shared/` directory
- **Consistency**: Standardized error handling, CORS, and response formats
- **Type Safety**: Comprehensive TypeScript definitions
- **Modularity**: Each function handles a specific domain

## Development Commands

### Prerequisites
```bash
# Install Supabase CLI (recommended via npm)
npm install -g supabase
# Note: Global install is not officially supported but works for CLI usage
# Alternative: Use npx supabase commands instead
```

### Important Notes
- **CLI vs CI/CD**: Using CLI-only deployment keeps the project on Supabase's free tier
- **GitHub Integration**: Connecting Supabase to GitHub requires paid plan upgrade
- **Environment Management**: All secrets are managed via Supabase CLI, not in code

### Local Development
```bash
# Initialize Supabase project (first time only)
supabase init

# Start local Supabase services (database, auth, storage, functions)
supabase start

# Stop local Supabase services
supabase stop

# Check service status
supabase status

# Serve Edge Functions locally for development
supabase functions serve [function-name] --env-file .env.local

# Serve all functions at once
supabase functions serve

# Link to remote project (required for deployment)
supabase link --project-ref <your-project-ref>
```

### Secrets Management
```bash
# Set environment variables for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-... PERPLEXITY_API_KEY=pplx-...

# Set secrets from .env file
supabase secrets set --env-file ../frontend/.env.local

# List current secrets
supabase secrets list

# Login to Supabase CLI (required for deployment)
supabase login
# Get token from https://supabase.com/dashboard/account/tokens
```

### Deployment Commands
```bash
# Deploy a specific Edge Function
supabase functions deploy [function-name]

# Deploy all functions
supabase functions deploy

# Deploy without JWT verification (for testing)
supabase functions deploy --no-verify-jwt

# Check function logs
supabase functions logs [function-name] --tail
```

### Database Management
```bash
# Run migrations
supabase db push

# Generate TypeScript types from database schema
supabase gen types typescript --local > types/database.ts

# Reset local database
supabase db reset
```

## Edge Functions Available

### Core Functions
- **`item-research`** - Generates product research data (ResearchPack) using Perplexity API
- **`write`** - Creates SEO-optimized blog content using OpenAI GPT
- **`cache-gateway`** - Handles caching and request optimization
- **`queue-worker`** - Processes background tasks and queued operations
- **`langgraph-api`** - Orchestrates complex AI workflows

### Shared Utilities (`_shared/`)
- **`cors.ts`** - CORS configuration for Edge Functions
- **`coupang.ts`** - Coupang API integration utilities
- **`response.ts`** - Standardized response helpers
- **`type.ts`** - Common TypeScript type definitions

## Project Structure

```
backend/
├── supabase/
│   ├── functions/          # Edge Functions (Deno runtime)
│   │   ├── _shared/       # 🔧 Shared utilities (IMPORTANT: Use these!)
│   │   │   ├── cors.ts           # CORS configuration
│   │   │   ├── response.ts       # Standardized response helpers
│   │   │   ├── server.ts         # Edge Function wrapper utilities
│   │   │   ├── redis.ts          # Redis client and queue utilities
│   │   │   ├── type.ts           # Common TypeScript definitions
│   │   │   └── coupang.ts        # Coupang API utilities
│   │   ├── item-research/ # Product research with Perplexity API
│   │   ├── write/         # SEO content generation with OpenAI
│   │   ├── cache-gateway/ # Redis caching and queue management
│   │   ├── queue-worker/  # Background task processing
│   │   ├── langgraph-api/ # LangGraph workflow orchestration
│   │   └── hello/         # Simple test function example
│   ├── migrations/        # Database schema migrations
│   └── config.toml        # Supabase configuration
├── API-DOCUMENTATION.md   # 📚 Complete API documentation
├── package.json          # Dev dependencies (Supabase CLI)
└── CLAUDE.md            # This file
```

### Key Directories

- **`_shared/`**: 🚨 **ALWAYS use shared utilities before creating new ones**
  - Contains all common functionality to avoid code duplication
  - Provides standardized patterns for error handling, CORS, Redis, etc.
  - Must be imported by all Edge Functions

- **Individual Functions**: Each function should be **minimal and focused**
  - Import and use `_shared` utilities
  - Follow the established patterns
  - Handle only domain-specific logic

### Naming Conventions
- **Files**: Use kebab-case for Edge Function directories (`item-research/`)
- **Functions**: Use camelCase for function names (`generateResearchPack`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`CORS_HEADERS`)
- **Types/Interfaces**: Use PascalCase (`ResearchPack`, `SeoDraft`)
- **Environment Variables**: Use UPPER_SNAKE_CASE (`OPENAI_API_KEY`)

## 🏗️ Development Guidelines

### **MANDATORY**: Use Shared Utilities

🚨 **Before writing any new functionality, check `_shared/` directory first!**

```typescript
// ✅ CORRECT: Use shared utilities
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";
import { createRedisClient } from "../_shared/redis.ts";

async function handleMyFunction(req: Request): Promise<Response> {
  const body = await safeJsonParse<MyRequestType>(req);
  
  if (!body?.requiredField) {
    return fail("requiredField is required", "VALIDATION_ERROR", 400);
  }
  
  // Your business logic here
  
  return ok(result);
}

serve(createEdgeFunctionHandler(handleMyFunction));
```

```typescript
// ❌ WRONG: Don't duplicate functionality
serve(async (req) => {
  // Don't manually handle CORS
  if (req.method === "OPTIONS") { /* ... */ }
  
  // Don't manually parse JSON
  const body = await req.json();
  
  // Don't manually create responses
  return new Response(JSON.stringify(data), { headers: {...} });
});
```

### Required Imports Pattern

**Every Edge Function should follow this pattern:**

```typescript
// 1. Deno/External imports
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// 2. Shared utilities (ALWAYS import these)
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";

// 3. Domain-specific shared utilities (as needed)
import { createRedisClient } from "../_shared/redis.ts";
import { MyType } from "../_shared/type.ts";

// 4. Deno type declaration (standard)
declare const Deno: {
  env: { get(key: string): string | undefined; };
};

// 5. Request/Response types (function-specific)
interface MyRequest { /* ... */ }

// 6. Handler function
async function handleMyFunction(req: Request): Promise<Response> {
  // Implementation using shared utilities
}

// 7. Server setup
serve(createEdgeFunctionHandler(handleMyFunction));
```

## Shared Utilities Reference

### Server Utilities (`_shared/server.ts`)

```typescript
// Main wrapper - handles CORS, method validation, error handling
createEdgeFunctionHandler(
  handler: (req: Request) => Promise<Response>,
  options?: {
    allowedMethods?: string[];    // Default: ["POST"]
    requireAuth?: boolean;        // Default: false
    rateLimited?: boolean;        // Default: false
  }
)

// Safe JSON parsing
safeJsonParse<T>(req: Request): Promise<T | null>

// Environment validation
validateEnvVars(required: string[]): string[]

// Common error handler
handleError(error: unknown, context: string): Response
```

### Response Utilities (`_shared/response.ts`)

```typescript
// Success response
ok<T>(data: T, init?: ResponseInit): Response

// Error response with details
fail(
  message: string, 
  code?: string, 
  status = 400, 
  extra?: Record<string, unknown>
): Response
```

### Redis Utilities (`_shared/redis.ts`)

```typescript
// Create Redis client instance
createRedisClient(): RedisClient

// Generate cache keys
generateCacheKey(namespace: string, id: string): string

// Generate job IDs for queue
generateJobId(): string

// Queue defaults and utilities
QUEUE_DEFAULTS.NAME          // "langgraph-queue"
QUEUE_DEFAULTS.TTL           // 3600
getPriorityScore(priority)   // Convert priority to number
```

### Type Definitions (`_shared/type.ts`)

```typescript
// Standard API response types
ApiResponse<T> = ApiSuccess<T> | ApiError
ApiSuccess<T> = { success: true; data: T }
ApiError = { success: false; error: string; code?: string; details?: unknown }

// Domain types
ResearchPack      // Product research data structure
SeoDraft         // SEO content structure
QueueJob         // Background job structure
JobResult        // Job execution result
CheckpointData   // LangGraph checkpoint
GraphStatus      // Workflow status
```

## Development Best Practices

### 1. **Always Use Shared Utilities**
```typescript
// ✅ DO: Use shared utilities
import { createEdgeFunctionHandler } from "../_shared/server.ts";
serve(createEdgeFunctionHandler(myHandler));

// ❌ DON'T: Manually handle common functionality
serve(async (req) => {
  if (req.method === "OPTIONS") { /* manual CORS */ }
  // ... manual error handling, JSON parsing, etc.
});
```

### 2. **Environment Variables**
```typescript
// ✅ DO: Validate required environment variables
const required = ["OPENAI_API_KEY", "SUPABASE_URL"];
const missing = validateEnvVars(required);
if (missing.length > 0) {
  return fail(`Missing env vars: ${missing.join(", ")}`, "ENV_ERROR", 500);
}
```

### 3. **Error Handling**
```typescript
// ✅ DO: Use standardized error responses
return fail("Validation failed", "VALIDATION_ERROR", 400, { field: "itemId" });

// ❌ DON'T: Create manual error responses
return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
```

### 4. **Response Format**
```typescript
// ✅ DO: Use standardized success responses
return ok({ items: data, count: data.length });

// ❌ DON'T: Manual response creation
return new Response(JSON.stringify(data), { headers: { ... } });
```

## Database Migrations

### Creating New Migrations
```sql
-- Example: supabase/migrations/20250111_create_research_table.sql
CREATE TABLE IF NOT EXISTS research (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE,
  title TEXT,
  features JSONB DEFAULT '[]',
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Running Migrations
```bash
# Apply migrations to local database
supabase db push

# Apply migrations to production
supabase db push --linked
```

## Environment Variables

### Required for Edge Functions
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
COUPANG_ACCESS_KEY=your_coupang_access_key
COUPANG_SECRET_KEY=your_coupang_secret_key

# WordPress (if applicable)
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_PASSWORD=your_app_password
```

## Testing Edge Functions

### Local Testing
```bash
# Test with curl
curl -X POST http://localhost:54321/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"itemName":"test product","itemId":"test_001"}'

# Test with Supabase client
const { data, error } = await supabase.functions.invoke('item-research', {
  body: { itemName: 'test product', itemId: 'test_001' }
});
```

### Production Testing
```bash
# Replace with your project URL
curl -X POST https://[project-ref].supabase.co/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"itemName":"test product","itemId":"test_001"}'
```

## 🚨 Common Issues & Solutions

### Code Duplication
- **Issue**: Writing duplicate CORS/error handling code
- **Solution**: Always import and use `_shared` utilities first
- **Check**: Does `_shared/` already have what you need?

### CORS Errors
- **Issue**: CORS preflight failures
- **Solution**: Use `createEdgeFunctionHandler()` - handles CORS automatically
- **Manual Fix**: Import `corsHeaders` from `_shared/cors.ts`

### Type Errors
- **Issue**: Deno import errors
- **Solution**: Use `// @ts-ignore` for Deno imports and declare Deno global
- **Best Practice**: Follow the standard import pattern shown above

### Environment Variable Issues
- **Issue**: Missing API keys causing runtime errors
- **Solution**: Use `validateEnvVars()` from shared utilities
- **Production**: Set variables in Supabase Dashboard
- **Development**: Use `.env.local` for local development

### Response Format Inconsistency
- **Issue**: Different response formats across functions
- **Solution**: Always use `ok()` and `fail()` from `_shared/response.ts`
- **Benefit**: Consistent API responses across all functions

### Redis/Queue Issues
- **Issue**: Duplicate Redis client code
- **Solution**: Use `createRedisClient()` from `_shared/redis.ts`
- **Pattern**: Import utilities instead of recreating functionality
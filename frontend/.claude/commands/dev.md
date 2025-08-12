# Development Commands

## Quick Start
```bash
npm run dev
```
Starts the Next.js development server on http://localhost:3000

## Common Development Tasks

### Running Tests
```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
npm run test:ui        # With UI interface
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run build         # Build for production
```

### Test Specific Features
- Product Search: http://localhost:3000/product
- Research Management: http://localhost:3000/research
- Simple Test: http://localhost:3000/simple-test
- Workflow Test: http://localhost:3000/test

### API Testing
```bash
# Test research API
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Research","itemId":"test123"}'

# Test product search
curl http://localhost:3000/api/products/search?keyword=laptop

# Test workflow
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{"action":"execute","keyword":"이어폰"}'
```

## Environment Setup
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```